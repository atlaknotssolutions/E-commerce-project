// import React from "react";

// interface ResponseMessageProps {
//   message: string;
// }

// const ResponseMessage = ({ message }: ResponseMessageProps) => {
//   console.log("Assistant Message:", message);

//   return (
//     <div className="px-3 py-4 bg-slate-100 rounded-md text-black whitespace-pre-wrap">
//       {String(message)}
//     </div>
//   );
// };

// export default ResponseMessage;

import React from "react";
import { useNavigate } from "react-router-dom";
import type { ChatAction } from "../../../Redux Toolkit/Customer/AiChatBotSlice";

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
  loginRequired?: boolean;
  onActionClick?: (action: ChatAction) => void;
}

const ACTION_LABELS: Record<string, string> = {
  PRODUCT_DETAIL: "View Product",
  ADD_TO_CART: "Add to Cart",
  VIEW_CART: "View Cart",
  UPDATE_CART_QUANTITY: "Update Quantity",
  REMOVE_FROM_CART: "Remove",
  PRODUCT_SEARCH: "Search",
  CATEGORY_LIST: "Browse",
  CATEGORY_SELECT: "Select",
  LOGIN_REQUIRED: "Login",
};

const getActionLabel = (action: ChatAction) =>
  action.label ||
  ACTION_LABELS[action.type] ||
  action.type.replace(/_/g, " ").toLowerCase();

const ResponseMessage = ({
  message,
  sources = [],
  actions = [],
  loginRequired = false,
  onActionClick,
}: ResponseMessageProps) => {
  const navigate = useNavigate();

  const formatMessage = (text: string) => {
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

  const goToProduct = (product: ProductSource) => {
    if (!product?.id) return;

    const categoryId = product.category?.categoryId || "all";
    const productTitle = product.title || "product";
    navigate(`/product-details/${categoryId}/${productTitle}/${product.id}`);
  };

  const handleLoginRequired = () => {
    navigate("/login");
  };

  return (
    <div className="px-4 py-3 bg-gray-50 rounded-2xl rounded-tl-sm max-w-[90%] text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
      {formatMessage(String(message))}

      {sources.length > 0 && (
        <div className="mt-3 space-y-2">
          {sources.map((product, index) => {
            const imageUrl = product.images?.[0]?.url || "";
            const categoryName = product.category?.name || "Product";

            return (
              <button
                key={product.id || `${product.title}-${index}`}
                type="button"
                onClick={() => goToProduct(product)}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-2 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md"
              >
                <img
                  src={imageUrl}
                  alt={product.title || "Product"}
                  className="h-16 w-16 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-gray-700">
                    {categoryName}
                  </p>
                  <p className="truncate text-sm font-medium text-gray-900">
                    {product.title || "Product"}
                  </p>
                  <p className="text-xs text-teal-700">
                    ₹{product.sellingPrice ?? product.mrpPrice ?? "--"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <button
              key={`${action.type}-${index}`}
              type="button"
              onClick={() => {
                if (action.type === "LOGIN_REQUIRED") {
                  handleLoginRequired();
                } else {
                  onActionClick?.(action);
                }
              }}
              className="rounded-full border border-teal-600 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-600 hover:text-white"
            >
              {getActionLabel(action)}
            </button>
          ))}
        </div>
      )}

      {loginRequired && actions.length === 0 && (
        <button
          type="button"
          onClick={handleLoginRequired}
          className="mt-3 rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-700"
        >
          Login to Continue
        </button>
      )}
    </div>
  );
};

export default ResponseMessage;
