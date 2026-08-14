import React, { useMemo, useState, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import type { ChatAction } from "../../../Redux Toolkit/Customer/AiChatBotSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { addProductToWishlist } from "../../../Redux Toolkit/Customer/WishlistSlice";
import { chatBot } from "../../../Redux Toolkit/Customer/AiChatBotSlice";
import { isWishlisted } from "../../../util/isWishlisted";
import { isAuthenticated } from "../../../util/requireAuth";
import { notification } from "../../../services/notificationService";

interface ProductSource {
  id?: string;
  title?: string;
  sellingPrice?: number;
  mrpPrice?: number;
  category?: {
    categoryId?: string;
    name?: string;
  };
  images?: Array<{ url?: string }>;
}

interface ResponseMessageProps {
  message: string;
  sources?: ProductSource[];
  actions?: ChatAction[];
  intent?: string | null;
  loginRequired?: boolean;
  isError?: boolean;
  onActionClick?: (action: ChatAction) => void;
  onRetry?: () => void;
  onShowMore?: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  ADD_TO_CART: "Add to Cart",
  VIEW_CART: "View Cart",
  UPDATE_CART_QUANTITY: "Update Quantity",
  REMOVE_FROM_CART: "Remove",
  PRODUCT_SEARCH: "Search",
  CATEGORY_LIST: "Browse",
  CATEGORY_SELECT: "Select",
  LOGIN_REQUIRED: "Login to Continue",
};

const getActionLabel = (action: ChatAction) =>
  action.label ||
  ACTION_LABELS[action.type] ||
  action.type.replace(/_/g, " ").toLowerCase();

/** Intents whose product batches can be extended via the existing show-more. */
const LIST_INTENTS = new Set([
  "PRODUCT_SEARCH",
  "RECOMMENDATION",
  "SHOW_MORE",
  "ALTERNATIVES",
  "REFINE",
  "GIFT",
  "CATEGORY_SELECT",
]);

/** Renders a single line of text honouring `**bold**` pairs. */
const renderRichText = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

/** Splits a backend message into an intro line + any following detail lines. */
const splitMessage = (text: string) => {
  const [intro, ...rest] = String(text).split(/\r?\n/).filter((l) => l.trim().length > 0);
  return { intro: intro || "", rest };
};

interface CardActions {
  view?: ChatAction;
  add?: ChatAction;
}

const ResponseMessage = ({
  message,
  sources = [],
  actions = [],
  intent = null,
  loginRequired = false,
  isError = false,
  onActionClick,
  onRetry,
  onShowMore,
}: ResponseMessageProps) => {
  const navigate = useNavigate();
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  // Backend only surfaces compact batches; cap defensively at 3 on the client
  // so a response can never dump a wall of large cards into the chat.
  const displayedSources = useMemo(() => sources.slice(0, 3), [sources]);

  const grouped: CardActions[] = useMemo(
    () =>
      displayedSources.map((product) => {
        const byProduct = actions.filter(
          (a) => a.productId === product.id || (!a.productId && a.type === "VIEW_CART"),
        );
        return {
          view: byProduct.find((a) => a.type === "PRODUCT_DETAIL"),
          add: byProduct.find((a) => a.type === "ADD_TO_CART"),
        };
      }),
    [displayedSources, actions],
  );

  const handleAction = (action: ChatAction, productId?: string) => {
    if (!action || !onActionClick) return;
    if (action.type === "ADD_TO_CART" && productId) {
      setBusyProductId(productId);
      onActionClick(action);
      // Backend is authoritative — latency is low in mock mode, so just clear
      // the busy state after a beat to avoid a permanently stuck spinner.
      window.setTimeout(() => setBusyProductId(null), 2500);
      return;
    }
    onActionClick(action);
  };

  const goToProduct = (product: ProductSource) => {
    if (!product?.id) return;
    const categoryId = product.category?.categoryId || "all";
    const productTitle = product.title || "product";
    navigate(`/product-details/${categoryId}/${productTitle}/${product.id}`);
  };

  const handleLoginRequired = () => navigate("/login");

  const { intro, rest } = splitMessage(message);
  const canShowMore =
    LIST_INTENTS.has(intent || "") &&
    displayedSources.length >= 3 &&
    typeof onShowMore === "function";

  if (isError) {
    return (
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <p className="leading-relaxed">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[92%] space-y-2">
      {/* Conversational text */}
      {intro && (
        <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm leading-relaxed text-gray-800 shadow-sm ring-1 ring-gray-100">
          <p>{renderRichText(intro)}</p>
          {rest.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {rest.map((line, i) => (
                <p key={i} className="text-xs text-gray-500">
                  {renderRichText(line)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compact product cards */}
      {displayedSources.length > 0 && (
        <div className="space-y-2">
          {grouped.map((card, index) => {
            const product = displayedSources[index];
            if (!product) return null;
            return (
              <ProductCard
                key={product.id || `${product.title}-${index}`}
                product={product}
                busy={busyProductId === product.id}
                onView={() => goToProduct(product)}
                onAction={(action) => handleAction(action, product.id)}
                card={card}
              />
            );
          })}
        </div>
      )}

      {/* Show more — reuses the backend SHOW_MORE intent + shopping context */}
      {canShowMore && (
        <button
          type="button"
          onClick={onShowMore}
          className="flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-100"
        >
          Show more
          <span aria-hidden="true">→</span>
        </button>
      )}

      {/* Standalone actions (view cart, etc.) — the login CTA is rendered by
          the block below so LOGIN_REQUIRED buttons never double up here. */}
      {actions.length > 0 && displayedSources.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {actions
            .filter((action) => action.type !== "LOGIN_REQUIRED")
            .map((action, index) => (
              <button
                key={`${action.type}-${index}`}
                type="button"
                onClick={() => onActionClick?.(action)}
                className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                {getActionLabel(action)}
              </button>
            ))}
        </div>
      )}

      {/* Login required */}
      {loginRequired && (
        <button
          type="button"
          onClick={handleLoginRequired}
          className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          Login to Continue
        </button>
      )}
    </div>
  );
};

interface ProductCardProps {
  product: ProductSource;
  card: CardActions;
  busy: boolean;
  onView: () => void;
  onAction: (action: ChatAction) => void;
}

const ProductCard = ({
  product,
  card,
  busy,
  onView,
  onAction,
}: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const wishlistState = useAppSelector((store) => store.wishlist);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  const imageUrl = product.images?.[0]?.url || "";
  const selling = product.sellingPrice;
  const mrp = product.mrpPrice;
  const discount =
    typeof selling === "number" &&
    typeof mrp === "number" &&
    mrp > selling
      ? Math.round(((mrp - selling) / mrp) * 100)
      : 0;

  const isFav =
    !!product.id &&
    !!wishlistState.wishlist &&
    isWishlisted(wishlistState.wishlist, { id: product.id } as any);

  const handleWishlist = (event: MouseEvent) => {
    event.stopPropagation();
    if (!product.id || wishlistBusy) return;

    // Guests: route through the existing loginRequired chat flow so the
    // assistant answers with a wishlist login prompt + ONE "Login to
    // Continue" CTA instead of silently bouncing to /login.
    if (!isAuthenticated()) {
      dispatch(
        chatBot({
          prompt: {
            prompt: `Add ${product.title || "this product"} to my wishlist`,
          },
          productId: null,
          action: { type: "ADD_TO_WISHLIST", productId: product.id },
        }) as any,
      );
      return;
    }

    setWishlistBusy(true);
    const wasFav = isFav;
    dispatch(addProductToWishlist({ productId: product.id }) as any)
      .unwrap()
      .then(() => {
        notification.success(
          wasFav ? "Removed from wishlist" : "Added to wishlist",
        );
      })
      .catch((error: any) => {
        notification.error(
          typeof error === "string"
            ? error
            : "Could not update wishlist. Please try again.",
        );
      })
      .finally(() => setWishlistBusy(false));
  };

  const stopAndDo = (event: MouseEvent, fn: () => void) => {
    event.stopPropagation();
    fn();
  };

  return (
    <div
      onClick={onView}
      className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition hover:border-teal-300 hover:shadow-md"
    >
      {/* Image + discount badge */}
      <button
        type="button"
        onClick={(e) => stopAndDo(e, onView)}
        aria-label={`View details for ${product.title || "product"}`}
        title={product.title || "Product"}
        className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:h-[4.25rem] sm:w-[4.25rem]"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title || "Product"}
            className="h-full w-full object-contain p-0.5"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl">
            🛍️
          </span>
        )}
        {discount > 0 && (
          <span className="absolute left-1 top-1 rounded bg-teal-600 px-1 py-0.5 text-[9px] font-bold leading-none text-white shadow-sm">
            {discount}% OFF
          </span>
        )}
      </button>

      {/* Title / price / actions */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-1.5">
          <button
            type="button"
            onClick={(e) => stopAndDo(e, onView)}
            title={product.title || "Product"}
            className="min-w-0 flex-1 text-left"
          >
            <p className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900">
              {product.title || "Product"}
            </p>
          </button>

          <div className="flex flex-shrink-0 flex-col gap-1">
            {card.add && (
              <Tooltip title="Add to cart" placement="top">
                <button
                  type="button"
                  onClick={(e) => stopAndDo(e, () => onAction(card.add!))}
                  disabled={busy}
                  aria-label="Add to cart"
                  title="Add to cart"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-teal-700 transition hover:bg-teal-50 disabled:opacity-60"
                >
                  {busy ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-teal-300 border-t-teal-600" />
                  ) : (
                    <AddShoppingCartIcon sx={{ fontSize: 16 }} />
                  )}
                </button>
              </Tooltip>
            )}

            <Tooltip title={isFav ? "Remove from wishlist" : "Add to wishlist"} placement="top">
              <button
                type="button"
                onClick={handleWishlist}
                disabled={wishlistBusy}
                aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                title={isFav ? "Remove from wishlist" : "Add to wishlist"}
                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-rose-50 disabled:opacity-60"
              >
                {wishlistBusy ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
                ) : isFav ? (
                  <FavoriteIcon sx={{ fontSize: 16, color: "#e91e63" }} />
                ) : (
                  <FavoriteBorderIcon sx={{ fontSize: 16, color: "#666" }} />
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-gray-900">
            ₹{typeof selling === "number" ? selling.toLocaleString("en-IN") : "--"}
          </span>
          {typeof selling === "number" && typeof mrp === "number" && mrp > selling && (
            <span className="text-[11px] text-gray-400 line-through">
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseMessage;