/**
 * AI Chatbot Action Architecture.
 *
 * THE AI MAY INTERPRET. THE BACKEND MUST AUTHORIZE AND EXECUTE.
 *
 * This module is the ONLY place the chatbot's structured actions are defined
 * and executed. The user/LLM can never invoke an arbitrary function: the
 * executor dispatches against a fixed, allowlisted `handlers` object, and any
 * `type` not present there is rejected with a safe fallback.
 *
 * Cart mutations are NOT implemented here — they delegate to the existing
 * marketplace `cartService` (addCartItem / updateCartItem / removeCartItem).
 * This file only adds the thin AI orchestration layer (public-product checks,
 * stock checks, ownership-scoped resolution, sanitized response shapes).
 */

import { toPublicProductSource } from "./ai.sources.js";
import { t } from "./ai.language.js";

// ------------------------------------------------------------
// Action registry (the single source of truth)
// ------------------------------------------------------------

export const ACTIONS = Object.freeze({
  PRODUCT_SEARCH: "PRODUCT_SEARCH",
  PRODUCT_DETAIL: "PRODUCT_DETAIL",
  CATEGORY_LIST: "CATEGORY_LIST",
  CATEGORY_SELECT: "CATEGORY_SELECT",
  VIEW_CART: "VIEW_CART",
  ADD_TO_CART: "ADD_TO_CART",
  UPDATE_CART_QUANTITY: "UPDATE_CART_QUANTITY",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  LOGIN_REQUIRED: "LOGIN_REQUIRED",
});

/**
 * Actions that require an authenticated user. The identity ALWAYS comes from
 * the server-side JWT middleware (req.user) — never from the client body.
 */
export const AUTH_REQUIRED_ACTIONS = new Set([
  ACTIONS.VIEW_CART,
  ACTIONS.ADD_TO_CART,
  ACTIONS.UPDATE_CART_QUANTITY,
  ACTIONS.REMOVE_FROM_CART,
]);

/** Maps the Phase-2 intent names to the public action names used in responses. */
export const INTENT_TO_ACTION = {
  greeting: "GREETING",
  general: "GENERAL",
  search: ACTIONS.PRODUCT_SEARCH,
  detail: ACTIONS.PRODUCT_DETAIL,
  "category-list": ACTIONS.CATEGORY_LIST,
  "category-select": ACTIONS.CATEGORY_SELECT,
  cart: ACTIONS.VIEW_CART,
  order: "ORDER_STATUS",
  fallback: "FALLBACK",
  gift: "GIFT",
  comparison: "COMPARISON",
  recommendation: "RECOMMENDATION",
  refine: "REFINE",
  "show-more": "SHOW_MORE",
  alternatives: "ALTERNATIVES",
  select: "SELECT",
};

/** Upper bound on any quantity accepted from the chatbot. */
export const MAX_CART_QUANTITY = 99;

// ------------------------------------------------------------
// Sanitizers — whitelist-only output builders
// ------------------------------------------------------------

const getImageUrl = (images) =>
{
    if (!Array.isArray(images) || images.length === 0)
    {
        return undefined;
    }

    const primary = images.find(
        (img) => img && typeof img === 'object' && img.isPrimary
    );
    const first = primary || images[0];

    if (typeof first === 'string')
    {
        return first;
    }

    if (first && typeof first.url === 'string')
    {
        return first.url;
    }

    return undefined;
};

const getProductId = (product) =>
{
    if (!product)
    {
        return null;
    }

    if (product._id)
    {
        return product._id.toString();
    }

    if (product.id)
    {
        return String(product.id);
    }

    return null;
};

/**
 * Whitelisted public view of a product for action results.
 * Never spreads the raw document — seller/moderation fields stay out.
 */
export const toPublicProductResult = (product) =>
{
    if (!product)
    {
        return null;
    }

    const result = {
        id: getProductId(product),
        title: product.title || null,
        sellingPrice: product.sellingPrice ?? null,
        mrpPrice: product.mrpPrice ?? null,
        quantity: product.quantity ?? null,
        inStock: Number(product.quantity) > 0,
    };

    const imageUrl = getImageUrl(product.images);
    if (imageUrl)
    {
        result.image = imageUrl;
    }

    return result;
};

/**
 * Whitelisted cart item view. Only public product fields + the cart item id
 * (needed for follow-up UPDATE/REMOVE actions). Seller data never appears.
 */
const toPublicCartItem = (item) =>
{
    if (!item)
    {
        return null;
    }

    const product =
        item.product && typeof item.product === 'object' ? item.product : null;

    const cartItemId =
        (typeof item._id === 'object' && item._id?.toString)
            ? item._id.toString()
            : item.id || null;

    const productId = getProductId(product);

    const entry = {
        id: cartItemId,
        productId,
        title: product?.title || null,
        size: item.size ?? null,
        quantity: item.quantity ?? 1,
        sellingPrice: item.sellingPrice ?? 0,
        mrpPrice: item.mrpPrice ?? 0,
    };

    const imageUrl = getImageUrl(product?.images);
    if (imageUrl)
    {
        entry.image = imageUrl;
    }

    // Keep only rows that reference a real cart item.
    return cartItemId ? entry : null;
};

/**
 * Whitelisted cart summary built from the authoritative cart DTO returned by
 * the existing cart service. Totals are never computed here.
 */
export const toPublicCartSummary = (cartDto) =>
{
    if (!cartDto)
    {
        return null;
    }

    const items = Array.isArray(cartDto.cartItems) ? cartDto.cartItems : [];

    return {
        itemCount: cartDto.totalItem ?? items.reduce((sum, item) => sum + (item.quantity || 0), 0),
        subtotal: cartDto.totalSellingPrice ?? 0,
        mrpTotal: cartDto.totalMrpPrice ?? 0,
        discount: cartDto.discount ?? 0,
        couponCode: cartDto.couponCode ?? null,
        couponPrice: cartDto.couponPrice ?? 0,
        items: items.map(toPublicCartItem).filter(Boolean),
    };
};

// ------------------------------------------------------------
// Executor
// ------------------------------------------------------------

export const createAiActionExecutor = ({
    cartService,
    cartRepository,
    productRepository,
    createApiError,
    logger = console,
}) =>
{
    const normalizeQuantity = (quantity) =>
    {
        const parsed = parseInt(quantity, 10);

        if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1)
        {
            return { error: true, errorCode: "invalid_quantity" };
        }

        if (parsed > MAX_CART_QUANTITY)
        {
            return { error: true, errorCode: "quantity_too_large", max: MAX_CART_QUANTITY };
        }

        return { value: parsed };
    };

    const pickFirstSize = (product) =>
    {
        if (typeof product?.sizes === 'string')
        {
            const sizes = product.sizes
                .split(',')
                .map((size) => size.trim())
                .filter(Boolean);

            if (sizes.length)
            {
                return sizes[0];
            }
        }

        if (Array.isArray(product?.sizes) && product.sizes.length)
        {
            return String(product.sizes[0]).trim();
        }

        if (Array.isArray(product?.variants) && product.variants.length)
        {
            const variant =
                product.variants.find(
                    (v) => v?.isActive !== false && v?.attributes?.size
                ) || product.variants[0];

            if (variant?.attributes?.size)
            {
                return String(variant.attributes.size);
            }
        }

        return 'Default';
    };

    /**
     * Public + purchasable gate. Every ADD/UPDATE path runs through this so a
     * product that is unapproved, unpublished, deleted or out of stock can
     * never be mutated via the chatbot.
     */
    const requirePublicProduct = async (productId) =>
    {
        if (typeof productId !== 'string' || !productId.trim())
        {
            return { error: 'not_found' };
        }

        const product = await productRepository.findPublicById(productId.trim());

        if (!product)
        {
            return { error: 'not_found' };
        }

        if (Number(product.quantity) < 1)
        {
            return { error: 'out_of_stock' };
        }

        return { product };
    };

    const ensureCart = async (userId) =>
    {
        const existing = await cartRepository.findByUserId({ userId });
        if (!existing)
        {
            await cartRepository.createCart({ userId });
        }
    };

    /**
     * Resolves a cart item id for UPDATE/REMOVE against the authenticated
     * user's OWN cart only (ownership is enforced by the cart service, which
     * scopes every query by userId). Supports explicit cartItemId or a
     * text reference ("the first item", "the nike one", "this item").
     */
    const resolveCartItem = async ({ userId, cartItemId, ref }) =>
    {
        let cartDto = null;

        try
        {
            cartDto = await cartService.findUserCart({ userId });
        }
        catch (err)
        {
            if (err?.statusCode === 404 || err?.code === 'CART_NOT_FOUND')
            {
                return { cart: null, item: null };
            }
            throw err;
        }

        const items = Array.isArray(cartDto?.cartItems) ? cartDto.cartItems : [];

        if (items.length === 0)
        {
            return { cart: cartDto, item: null };
        }

        if (typeof cartItemId === 'string' && cartItemId.trim())
        {
            const item = items.find((entry) => entry.id === cartItemId);
            return { cart: cartDto, item: item || null };
        }

        if (ref?.kind === 'index')
        {
            return { cart: cartDto, item: items[ref.index] || null };
        }

        if (ref?.kind === 'keyword')
        {
            const token = String(ref.text || '').toLowerCase();
            const item = items.find((entry) =>
            {
                const product =
                    entry.product && typeof entry.product === 'object'
                        ? entry.product
                        : null;
                const title = String(product?.title || '').toLowerCase();
                const brand = String(product?.brand || '').toLowerCase();
                return title.includes(token) || brand.includes(token);
            });

            return { cart: cartDto, item: item || null };
        }

        // "this item" / "that product" -> most recent entry.
        return { cart: cartDto, item: items[items.length - 1] || null };
    };

    const handlers = {
        [ACTIONS.PRODUCT_DETAIL]: async ({ productId, lang = "en" }) =>
        {
            const checked = await requirePublicProduct(productId);

            if (checked.error === 'not_found')
            {
                return {
                    success: false,
                    error: 'not_found',
                    message: t(lang, 'notFound'),
                };
            }

            const product = checked.product;
            const source = toPublicProductSource(product);

            return {
                success: true,
                product: toPublicProductResult(product),
                sources: source ? [source] : [],
                message: t(lang, 'detail', {
                    title: product.title,
                    price: product.sellingPrice,
                    stock: product.quantity,
                }),
            };
        },

        [ACTIONS.VIEW_CART]: async ({ userId, lang = "en" }) =>
        {
            let cartDto = null;

            try
            {
                cartDto = await cartService.findUserCart({ userId });
            }
            catch (err)
            {
                if (err?.statusCode === 404 || err?.code === 'CART_NOT_FOUND')
                {
                    cartDto = null;
                }
                else
                {
                    throw err;
                }
            }

            const summary = toPublicCartSummary(cartDto);
            const isEmpty = !summary || summary.items.length === 0;

            return {
                success: true,
                cart: summary,
                message: isEmpty
                    ? `${t(lang, 'cartEmpty')} ${t(lang, 'cartEmptySuggest')}`
                    : t(lang, 'cartView'),
            };
        },

        [ACTIONS.ADD_TO_CART]: async ({ userId, productId, quantity = 1, lang = "en" }) =>
        {
            // Detected-language requests often carry no explicit count
            // ("pehla wala cart mein daal do") — default to one.
            if (quantity === null || quantity === "") quantity = 1;

            const checked = await requirePublicProduct(productId);

            if (checked.error === 'not_found')
            {
                return {
                    success: false,
                    error: 'not_found',
                    message: t(lang, 'notFound'),
                };
            }

            if (checked.error === 'out_of_stock')
            {
                return {
                    success: false,
                    error: 'out_of_stock',
                    message: t(lang, 'cartAddFailedStock', { title: productId }),
                };
            }

            const product = checked.product;
            const qty = normalizeQuantity(quantity);

            if (qty.error)
            {
                return {
                    success: false,
                    error: 'invalid_quantity',
                    message: qty.errorCode === "quantity_too_large"
                        ? t(lang, 'quantityTooLarge', { max: qty.max })
                        : t(lang, 'quantityInvalid'),
                };
            }

            if (qty.value > Number(product.quantity))
            {
                const available = product.quantity;
                return {
                    success: false,
                    error: 'out_of_stock',
                    message: t(lang, 'stockLimit', { count: available, s: available > 1 ? 's' : '' }),
                };
            }

            // Reuse the existing marketplace cart business service.
            await ensureCart(userId);

            const size = pickFirstSize(product);

            const cartDto = await cartService.addCartItem({
                userId,
                productId: productId.trim(),
                size,
                quantity: qty.value,
            });

            return {
                success: true,
                product: toPublicProductResult(product),
                quantity: qty.value,
                cart: toPublicCartSummary(cartDto),
                message: t(lang, 'cartAddDone', { title: product.title }),
            };
        },

        [ACTIONS.UPDATE_CART_QUANTITY]: async ({ userId, cartItemId, ref, quantity, lang = "en" }) =>
        {
            const qty = normalizeQuantity(quantity);

            if (qty.error)
            {
                return {
                    success: false,
                    error: 'invalid_quantity',
                    message: qty.errorCode === "quantity_too_large"
                        ? t(lang, 'quantityTooLarge', { max: qty.max })
                        : t(lang, 'quantityInvalid'),
                };
            }

            const resolved = await resolveCartItem({ userId, cartItemId, ref });

            if (!resolved.cart)
            {
                return {
                    success: false,
                    error: 'empty_cart',
                    message: t(lang, 'cartEmpty'),
                };
            }

            if (!resolved.item)
            {
                return {
                    success: false,
                    error: 'item_not_found',
                    message: t(lang, 'cartItemNotFound'),
                };
            }

            const product =
                resolved.item.product &&
                typeof resolved.item.product === 'object'
                    ? resolved.item.product
                    : null;

            const productId = getProductId(product);

            // Re-validate the underlying product is still public + stocked.
            const checked = productId
                ? await requirePublicProduct(productId)
                : { error: 'not_found' };

            if (checked.error === 'not_found')
            {
                return {
                    success: false,
                    error: 'not_found',
                    message: t(lang, 'notFound'),
                };
            }

            if (qty.value > Number(checked.product.quantity))
            {
                const available = checked.product.quantity;
                return {
                    success: false,
                    error: 'out_of_stock',
                    message: t(lang, 'stockLimit', { count: available, s: available > 1 ? 's' : '' }),
                };
            }

            const cartDto = await cartService.updateCartItem({
                userId,
                cartItemId: resolved.item.id,
                quantity: qty.value,
            });

            return {
                success: true,
                quantity: qty.value,
                cart: toPublicCartSummary(cartDto),
                message: t(lang, 'cartUpdateDone', { quantity: qty.value }),
            };
        },

        [ACTIONS.REMOVE_FROM_CART]: async ({ userId, cartItemId, ref, lang = "en" }) =>
        {
            const resolved = await resolveCartItem({ userId, cartItemId, ref });

            if (!resolved.cart)
            {
                return {
                    success: false,
                    error: 'empty_cart',
                    message: t(lang, 'cartEmpty'),
                };
            }

            if (!resolved.item)
            {
                return {
                    success: false,
                    error: 'item_not_found',
                    message: t(lang, 'cartItemNotFound'),
                };
            }

            const cartDto = await cartService.removeCartItem({
                userId,
                cartItemId: resolved.item.id,
            });

            return {
                success: true,
                cart: toPublicCartSummary(cartDto),
                message: t(lang, 'cartRemoveDone'),
            };
        },
    };

    /**
     * The ONLY dispatch entry point. `type` must be a key of the fixed
     * `handlers` object above — arbitrary function names are impossible here.
     */
    const isRegistered = (type) =>
        typeof type === 'string' &&
        Object.prototype.hasOwnProperty.call(handlers, type);

    const dispatchAction = async ({ type, lang = "en", ...params }) =>
    {
        if (!isRegistered(type))
        {
            logger.warn(`[AI Action] Rejected unregistered action type: ${type}`);

            return {
                action: type ?? 'UNKNOWN',
                success: false,
                error: 'unsupported',
                message: t(lang, 'invalidAction'),
            };
        }

        try
        {
            const result = await handlers[type]({ ...params, lang });
            return { action: type, ...result };
        }
        catch (err)
        {
            const statusCode = err?.statusCode;
            const code = err?.code;

            // Metadata-only log. Never echo internal errors to the client.
            logger.warn(
                `[AI Action] ${type} failed (${statusCode || code || 'internal'}): ${err?.message || 'unknown'}`
            );

            if (statusCode === 404 && code === 'PRODUCT_NOT_FOUND')
            {
                return {
                    action: type,
                    success: false,
                    error: 'not_found',
                    message: t(lang, 'notFound'),
                };
            }

            if (statusCode === 404 && code === 'CART_ITEM_NOT_FOUND')
            {
                return {
                    action: type,
                    success: false,
                    error: 'item_not_found',
                    message: t(lang, 'cartItemNotFound'),
                };
            }

            return {
                action: type,
                success: false,
                error: statusCode ? 'cart_error' : 'internal',
                message: t(lang, 'cartError'),
            };
        }
    };

    return Object.freeze({
        isRegistered,
        dispatchAction,
        toPublicCartSummary,
        toPublicProductSource,
    });
};
