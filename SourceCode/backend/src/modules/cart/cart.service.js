import { toCartDto, toCartItemDto } from "../../utils/mappers/cart.mapper.js";
import {
    computeCartTotals,
    computeItemLine,
    resolveVariantPricing,
} from "../../utils/financialEngine.js";

/**
 * Pure function-based factory representing the Shopping Cart Business Service.
 * Implements loose-coupling and strictly coordinates secure server-side pricing recalculations.
 */
export const createCartService = ({
    cartRepository,
    productRepository,
    createApiError
}) =>
{

    /**
     * Core Mathematical Recalculation Engine.
     * Delegates to centralized financial engine for consistent calculations.
     */
    const recalculateCart = (items, couponPrice = 0) =>
        computeCartTotals(items, couponPrice);

    /**
     * Retrieves and automatically recalculates customer's shopping cart values.
     */
    const findUserCart = async ({ userId }) =>
    {

        const cart = await cartRepository.findByUserId({ userId });

        if (!cart)
        {
            throw createApiError({
                statusCode: 404,
                code: 'CART_NOT_FOUND',
                message: 'Active shopping cart session not found for this profile.'
            });
        }

        // Cascade Recalculations: Secures active totals before displaying cards to user
        const recalculatedData = recalculateCart(cart.items, cart.couponPrice);

        // Commits calculated states into database cleanly
        const updatedCart = await cartRepository.updateCart({
            userId,
            cartData: recalculatedData,
        });

        return toCartDto(updatedCart);
    };

    /**
     * Adds an item to the customer's cart.
     * Supports both variant-based and legacy size-based flows.
     * If variantId is provided, uses variant pricing. Otherwise falls back to product-level pricing.
     */
    const addCartItem = async ({ userId, productId, variantId, size, quantity }) =>
    {
        const cart = await cartRepository.findByUserId({ userId });
        if (!cart)
        {
            throw createApiError({
                statusCode: 404,
                code: 'CART_NOT_FOUND',
                message: 'Cart session not initialized.'
            });
        }

        // 1. Check if identical product, variant, and size is already present
        const existingDuplicate = cart.items.find(
            (item) =>
                item.product._id.toString() === productId.toString() &&
                item.size === size &&
                ((!variantId && !item.variantId) ||
                 (variantId && item.variantId && item.variantId.toString() === variantId.toString()))
        );

        // Business specification alignment: Return existing item immediately if duplicate is located
        if (existingDuplicate)
        {
            return existingDuplicate;
        }

        const product = await productRepository.findById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: "PRODUCT_NOT_FOUND",
                message: "Add to Cart failed. The requested product listing does not exist."
            });
        }

        // 2. Resolve pricing from variant if variantId is provided
        const { mrpPrice: itemMrpPrice, sellingPrice: itemSellingPrice } = resolveVariantPricing(product, variantId);

        // 3. Assemble and push new item snapshot into list
        const lineTotals = computeItemLine(itemMrpPrice, itemSellingPrice, quantity);
        const newItemLine = {
            product: product._id,
            variantId: variantId || undefined,
            size,
            quantity,
            mrpPrice: lineTotals.mrpPrice,
            sellingPrice: lineTotals.sellingPrice,
            userId,
        };

        const updatedItemsCollection = [...cart.items, newItemLine];

        // 4. Trigger calculations engine with newly updated lists
        const recalculatedData = recalculateCart(updatedItemsCollection, cart.couponPrice);

        // 5. Commit state updates to database
        const finalCart = await cartRepository.updateCart({ userId, cartData: recalculatedData });

        // Returns newly appended item snapshot
        const item = finalCart.items.find(
            (item) =>
                item.product._id.toString() === productId.toString() &&
                item.size === size &&
                ((!variantId && !item.variantId) ||
                 (variantId && item.variantId && item.variantId.toString() === variantId.toString()))
        );

        return toCartItemDto(item);
    };

    /**
     * Modifies quantities of an existing embedded item inside cart.
     * Supports variant-based pricing recalculation.
     */
    const updateCartItem = async ({ userId, cartItemId, quantity }) =>
    {
        const cart = await cartRepository.findByUserId({ userId });
        if (!cart)
        {
            throw createApiError({
                statusCode: 404,
                code: 'CART_NOT_FOUND',
                message: 'Cart session is missing.'
            });
        }

        // 1. Locate specific target item inside embedded subdocument arrays
        const targetItem = cart.items.find((item) => item._id.toString() === cartItemId.toString());
        if (!targetItem)
        {
            throw createApiError({
                statusCode: 404,
                code: 'CART_ITEM_NOT_FOUND',
                message: 'Cart modification failed. The targeted item was not found inside your cart.'
            });
        }

        // 2. Overwrite quantity parameters
        const newQuantity = Math.max(1, parseInt(quantity, 10));

        const product = await productRepository.findById(targetItem.product);

        // Resolve pricing: use variant pricing if variantId is present
        const { mrpPrice: itemMrpPrice, sellingPrice: itemSellingPrice } = resolveVariantPricing(product, targetItem.variantId);

        targetItem.quantity = newQuantity;
        const lineTotals = computeItemLine(itemMrpPrice, itemSellingPrice, newQuantity);
        targetItem.mrpPrice = lineTotals.mrpPrice;
        targetItem.sellingPrice = lineTotals.sellingPrice;

        const recalculatedData = recalculateCart(cart.items, cart.couponPrice);
        const finalCart = await cartRepository.updateCart({ userId, cartData: recalculatedData });

        const item = finalCart.items.find(
            (item) => item._id.toString() === cartItemId.toString()
        );

        return toCartItemDto(item);
    };

    /**
     * Removes an item from the customer's cart.
     */
    const removeCartItem = async ({ userId, cartItemId }) =>
    {
        const cart = await cartRepository.findByUserId({ userId });
        if (!cart)
        {
            throw createApiError({
                statusCode: 404,
                code: 'CART_NOT_FOUND',
                message: 'Cart session is missing.'
            });
        }

        // 1. Check if item exists in arrays
        const itemExists = cart.items.some((item) => item._id.toString() === cartItemId.toString());
        if (!itemExists)
        {
            throw createApiError({
                statusCode: 404,
                code: 'CART_ITEM_NOT_FOUND',
                message: 'Item deletion failed. The targeted item does not exist in your cart.'
            });
        }

        // 2. Filter out targeted subdocument item cleanly
        const filteredItemsCollection = cart.items.filter(
            (item) => item._id.toString() !== cartItemId.toString()
        );

        // 3. Re-evaluate sums of residue lists
        const recalculatedData = recalculateCart(filteredItemsCollection, cart.couponPrice);
        await cartRepository.updateCart({ userId, cartData: recalculatedData });

        return { success: true, message: 'Item successfully removed from cart.' };
    };



    /**
 * AI Helper
 * Adds one quantity of a product using the first available size.
 */
    const addProductToCartFromAi = async ({
        userId,
        productId,
    }) =>
    {
        const product = await productRepository.findById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: "PRODUCT_NOT_FOUND",
                message: "Product not found.",
            });
        }

        let selectedSize = "Default";

        if (product.sizes)
        {
            const availableSizes = product.sizes
                .split(",")
                .map((size) => size.trim())
                .filter(Boolean);

            if (availableSizes.length)
            {
                selectedSize = availableSizes[0];
            }
        }

        return addCartItem({
            userId,
            productId,
            size: selectedSize,
            quantity: 1,
        });
    };

    return Object.freeze({
        findUserCart,
        addCartItem,
        updateCartItem,
        removeCartItem,
        addProductToCartFromAi,
    });
};