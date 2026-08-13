import { env } from "../../config/env.js";
import branding from "../../config/branding.js";
import { mapPublicProductSources } from "./ai.sources.js";
import {
  detectIntent,
  getSearchTokens,
  rankProducts,
  extractActionRequest,
} from "./ai.intents.js";
import {
  ACTIONS,
  AUTH_REQUIRED_ACTIONS,
  INTENT_TO_ACTION,
  createAiActionExecutor,
} from "./ai.actions.js";

/**
 * Pure function-based factory representing the AI Chatbot Business Service layer.
 * Coordinates Gemini API handshakes and implements a context-aware local mock engine.
 */
export const createAiService = ({
  cartRepository,
  cartService,
  productRepository,
  orderRepository,
  categoryRepository,
  createApiError,
}) => {
  // ============================================================
  // AI CONFIGURATION
  // ============================================================
  // ============================================================
  // AI CONFIGURATION
  // ============================================================

  const AI_NAME = `${branding.appShortName} Marketplace Assistant`;

  const conversationStore = new Map();

  // Cap tracked sessions so the in-memory store cannot grow unbounded
  // (server restarts already wipe it; this evicts the oldest session).
  const CONVERSATION_STORE_MAX_USERS = 1000;

  const saveConversation = (userId, messages) => {
    if (
      conversationStore.size >= CONVERSATION_STORE_MAX_USERS &&
      !conversationStore.has(userId)
    ) {
      const oldestUserId = conversationStore.keys().next().value;
      conversationStore.delete(oldestUserId);
    }
    conversationStore.set(userId, messages);
  };

  // ============================================================
  // ACTION EXECUTOR + SEARCH CONTEXT (Phase 4)
  // ============================================================

  /**
   * The ONLY executor the chatbot uses. It validates against the allowlist and
   * delegates every cart mutation to the existing marketplace cartService.
   */
  const actionExecutor = createAiActionExecutor({
    cartService,
    cartRepository,
    productRepository,
    createApiError,
  });

  /**
   * Bounded in-memory per-user context of the most recent product listings the
   * assistant showed, used to resolve "the first one" / "this product" /
   * "the nike one". Never trusted for authorization — resolved ids are still
   * re-validated against the public catalog before any action executes.
   */
  const searchContextStore = new Map();
  const SEARCH_CONTEXT_MAX_USERS = 1000;

  const saveSearchContext = (userId, context) => {
    if (typeof userId !== "string" || !userId) return;

    if (
      searchContextStore.size >= SEARCH_CONTEXT_MAX_USERS &&
      !searchContextStore.has(userId)
    ) {
      const oldestUserId = searchContextStore.keys().next().value;
      searchContextStore.delete(oldestUserId);
    }

    searchContextStore.set(userId, context);
  };

  const rememberProductList = (userId, products = []) => {
    saveSearchContext(userId, {
      products: products.map((product) => ({
        id:
          product._id?.toString?.() ||
          product.id ||
          null,
        title: product.title || "",
        brand: product.brand || "",
      })),
      lastProductId: products[0]?.id || products[0]?._id?.toString?.() || null,
    });
  };

  const rememberLastProduct = (userId, productId) => {
    const previous = searchContextStore.get(userId) || { products: [] };
    saveSearchContext(userId, {
      ...previous,
      lastProductId: productId || null,
    });
  };

  /**
   * Resolves a text product reference ("first one", "nike one", "this")
   * against the products the assistant most recently surfaced.
   */
  const resolveProductReference = ({
    userId,
    actionRequest,
    bodyProductId,
  }) => {
    const context = searchContextStore.get(userId) || { products: [] };
    const ref = actionRequest?.ref;

    if (!ref)
    {
      return bodyProductId || null;
    }

    if (ref.kind === "index")
    {
      const product = context.products[ref.index];
      return product?.id || null;
    }

    if (ref.kind === "keyword")
    {
      const token = String(ref.text || "").toLowerCase();
      const match = context.products.find(
        (product) =>
          product.title.toLowerCase().includes(token) ||
          product.brand.toLowerCase().includes(token),
      );
      return match?.id || null;
    }

    if (ref.kind === "last")
    {
      return context.lastProductId || bodyProductId || null;
    }

    return bodyProductId || null;
  };

  const loginRequiredResponse = (actionType) => {
    const message =
      actionType === ACTIONS.VIEW_CART
        ? "Please log in before I can show you your cart."
        : "Please log in before I can modify your cart.";

    return {
      response: message,
      intent: ACTIONS.LOGIN_REQUIRED,
      mockMode: true,
      sources: [],
      actions: [{ type: ACTIONS.LOGIN_REQUIRED, label: "Login" }],
      actionResult: null,
      cart: null,
      loginRequired: true,
    };
  };

  /**
   * Wraps an executed action into the full structured chat response.
   */
  const buildActionResponse = (result) => {
    const actions = [];

    if (result.success)
    {
      if (
        result.action === ACTIONS.ADD_TO_CART ||
        result.action === ACTIONS.UPDATE_CART_QUANTITY ||
        result.action === ACTIONS.REMOVE_FROM_CART
      ) {
        actions.push({ type: ACTIONS.VIEW_CART, label: "View Cart" });
      }
    }

    return {
      response: result.message,
      intent: result.action,
      mockMode: true,
      sources: result.sources || [],
      actions,
      actionResult: {
        action: result.action,
        success: result.success,
        product: result.product || null,
        quantity: result.quantity ?? null,
        cart: result.cart || null,
      },
      cart: result.cart || null,
      loginRequired: false,
    };
  };

  /**
   * Executes a structured action payload sent by the frontend action buttons.
   * The backend re-validates every field — the frontend is never trusted.
   */
  const handleStructuredAction = async ({ action, userId }) => {
    const type = typeof action?.type === "string" ? action.type : null;

    if (!type)
    {
      return {
        response: "I couldn't understand that request.",
        intent: "FALLBACK",
        mockMode: true,
        sources: [],
        actions: [],
        actionResult: null,
        cart: null,
        loginRequired: false,
      };
    }

    if (!actionExecutor.isRegistered(type))
    {
      return {
        response: "Sorry, I can't perform that action.",
        intent: type,
        mockMode: true,
        sources: [],
        actions: [],
        actionResult: null,
        cart: null,
        loginRequired: false,
      };
    }

    if (AUTH_REQUIRED_ACTIONS.has(type) && !userId)
    {
      return loginRequiredResponse(type);
    }

    const result = await actionExecutor.dispatchAction({
      type,
      userId,
      productId: typeof action.productId === "string" ? action.productId : null,
      cartItemId:
        typeof action.cartItemId === "string" ? action.cartItemId : null,
      quantity: action.quantity,
    });

    return buildActionResponse(result);
  };

  /**
   * Executes an action detected from natural-language text ("add the first one
   * to my cart"). Entities are resolved against recent assistant context and
   * the backend re-validates the product before mutating anything.
   */
  const handleDetectedAction = async ({
    actionRequest,
    prompt,
    userId,
    bodyProductId,
  }) => {
    const type = actionRequest.type;

    // Explicit unsupported/injection marker — never executes anything.
    if (type === "UNSUPPORTED")
    {
      return {
        response:
          "Sorry, I can't do that. I can help you search products and manage your cart.",
        intent: "FALLBACK",
        mockMode: true,
        sources: [],
        actions: [],
        actionResult: null,
        cart: null,
        loginRequired: false,
      };
    }

    if (!actionExecutor.isRegistered(type))
    {
      return {
        response: "Sorry, I can't perform that action.",
        intent: type,
        mockMode: true,
        sources: [],
        actions: [],
        actionResult: null,
        cart: null,
        loginRequired: false,
      };
    }

    if (AUTH_REQUIRED_ACTIONS.has(type) && !userId)
    {
      return loginRequiredResponse(type);
    }

    let productId = bodyProductId;

    if (type === ACTIONS.ADD_TO_CART)
    {
      productId = resolveProductReference({
        userId,
        actionRequest,
        bodyProductId,
      });

      if (!productId)
      {
        return {
          response:
            "Which product would you like me to add? You can tell me, like \"the first one\" or its name.",
          intent: ACTIONS.ADD_TO_CART,
          mockMode: true,
          sources: [],
          actions: [],
          actionResult: null,
          cart: null,
          loginRequired: false,
        };
      }
    }

    const result = await actionExecutor.dispatchAction({
      type,
      userId,
      productId,
      quantity: actionRequest.quantity,
      ref: actionRequest.ref,
    });

    return buildActionResponse(result);
  };

  const buildSourceActions = (sources) =>
    (Array.isArray(sources) ? sources : []).flatMap((source) => {
      const actions = [];

      if (source.id)
      {
        actions.push({
          type: ACTIONS.PRODUCT_DETAIL,
          productId: source.id,
          title: source.title || null,
        });
        actions.push({
          type: ACTIONS.ADD_TO_CART,
          productId: source.id,
          title: source.title || null,
        });
      }

      return actions;
    });

  const COMPANY_CONTEXT = `
You are ${AI_NAME}.

You help customers with:

- Products
- Cart
- Orders
- Delivery
- Payment
- Returns
- Refunds

Rules:

- Be friendly.
- Answer in 2-5 short sentences.
- Never invent products or prices.
- Use only the provided marketplace data.
- If information is unavailable, politely say so.
- Do not repeat cart or order details unless the user asks.


Do not greet the customer in every reply.

If the customer says only "hi" or "hello", simply reply:

"Hello! How can I help you today?"

Avoid mentioning cart, orders or products unless the customer asks about them.

Keep replies under 80 words.
`;
  // ============================================================
  // PRODUCT CONTEXT
  // ============================================================

  const buildProductContext = (product) => {
    if (!product) return "";

    return `
Product Information

Title: ${product.title}
Price: ₹${product.sellingPrice}
Brand: ${product.brand || "N/A"}
Color: ${product.color || "N/A"}
Stock: ${product.quantity}
`;
  };
  // ============================================================
  // CART CONTEXT
  // ============================================================

  const buildCartContext = (cart) => {
    if (!cart?.items?.length) return "";

    return `
Cart

Items: ${cart.totalItem}
Subtotal: ₹${cart.totalSellingPrice}
`;
  };
  // ============================================================
  // ORDER CONTEXT
  // ============================================================

  const buildOrderContext = (orders) => {
    if (!orders?.length) return "";

    const lastOrder = orders[0];

    return `
Last Order

Order ID: ${lastOrder.orderId}
Status: ${lastOrder.orderStatus}
Payment: ${lastOrder.paymentStatus}
`;
  };
  // ============================================================
  // GEMINI PROMPT BUILDER
  // ============================================================

  const buildPrompt = ({
    prompt,
    productContext = "",
    cartContext = "",
    orderContext = "",
  }) => `
${COMPANY_CONTEXT}

${productContext}

${cartContext}

${orderContext}

Customer Question:

${prompt}
`;

  const isMockMode = () =>
    !env.groqApiKey ||
    env.groqApiKey.includes("MOCK") ||
    process.env.NODE_ENV === "test";

  const getStatus = () => ({
    status: "ok",
    provider: isMockMode() ? "mock" : "groq",
    mockMode: isMockMode(),
  });

  const findMatchingProductsByQuery = async (query) =>
    {
        const searchTokens = getSearchTokens(query);
        if (searchTokens.length === 0) return [];

        try
        {
            // Public-catalog only: APPROVED + PUBLISHED + not deleted, and
            // no seller reference populated (private seller data stays out).
            const result = await productRepository.getPublicProducts({
                pageNumber: 0,
                sizeLimit: 50,
            });

            const products = Array.isArray(result?.content) ? result.content : [];

            return rankProducts(products, searchTokens);
        } catch (error)
        {
            console.warn("[AI Service] Product query matching error:", error.message);
            return [];
        }
    };

  /**
   * Builds the plain-text catalog listing shown after a product search.
   */
  const formatProductListText = (products) =>
    products
      .map((product, idx) => {
        const categoryName = product.category?.name || "General";
        return `${idx + 1}. **${product.title}**\n   - Category: ${categoryName}\n   - Price: Rs. ${product.sellingPrice} (MRP: Rs. ${product.mrpPrice})\n   - Stock: ${product.quantity} units available`;
      })
      .join("\n");
  /**
   * High-Intelligence Local Mock AI Processor.
   * Parses prompts and leverages injected repository data to generate context-aware solutions.
   * Enables seamless local development/testing without any external API keys or network dependencies.
   */
  const processMockResponseInternal = async ({ prompt, productId, userId }) => {
    const intent = detectIntent(prompt, { productId });

    // Greeting / small talk
    if (intent.type === "greeting") {
      return {
        text: "Hello! How can I help you today? I can find products, show categories, check your cart, or track your orders.",
        products: [],
      };
    }

    // Cart insight
    if (intent.type === "cart") {
      if (!userId) {
        return {
          text: "Please log in to your account first so I can retrieve and review your active shopping cart details.",
          products: [],
        };
      }

      const cart = await cartRepository.findByUserId({ userId });
      if (!cart || cart.items.length === 0) {
        return {
          text: "I reviewed your active profile and noticed your shopping cart is currently empty. Would you like some product recommendations from our latest catalog?",
          products: [],
        };
      }

      const cartSummaryList = cart.items
        .map(
          (item) =>
            `- ${item.product?.title || "Product"} (Size: ${item.size} | Qty: ${item.quantity} | Price: Rs. ${item.sellingPrice})`,
        )
        .join("\n");

      return {
        text: `I accessed your shopping cart session securely! Here is the list of items currently saved in your basket:\n\n${cartSummaryList}\n\n**Subtotal Selling Price**: Rs. ${cart.totalSellingPrice}\n**Total Articles**: ${cart.totalItem} items\n\nWould you like me to apply a promotional coupon or help you proceed directly to our secure checkout portal?`,
        products: [],
      };
    }

    // Order / tracking history
    if (intent.type === "order") {
      if (!userId) {
        return {
          text: "Authorization needed: Please authenticate into your account to securely track your sales orders history.",
          products: [],
        };
      }

      const orders = await orderRepository.findByUser({ userId });
      if (!orders || orders.length === 0) {
        return {
          text: "I checked your accounting history logs and found zero active orders registered under your profile. Start shopping and I will help you track them!",
          products: [],
        };
      }

      const orderSummaryList = orders
        .slice(0, 3)
        .map(
          (o) =>
            `- **ID**: ${o.orderId} | Date: ${new Date(o.orderDate).toLocaleDateString()} | Total: Rs. ${o.totalSellingPrice} | Status: ${o.orderStatus} (Payment: ${o.paymentStatus})`,
        )
        .join("\n");

      return {
        text: `I accessed your secure ledger accounts! Here are details of your most recent transactions (showing top 3 orders):\n\n${orderSummaryList}\n\nHow can I assist you further with shipping tracking or cancellations?`,
        products: [],
      };
    }

    // Single product detail (productId comes from a clicked product card)
    if (intent.type === "detail") {
      try {
        const product = await productRepository.findPublicById(productId);
        if (product) {
          rememberLastProduct(userId, product._id?.toString?.() || product.id);

          return {
            text: `Here are the details for **${product.title}**:\n\n- Selling Price: Rs. ${product.sellingPrice} (MRP: Rs. ${product.mrpPrice})\n- Discount Offered: ${product.discountPercent}% off\n- In-Stock Quantity: ${product.quantity} units available\n- Color Variant: ${product.color || "Not specified"}\n- Sizes Available: ${product.sizes || "Not specified"}\n\nWould you like me to add this verified catalog item to your cart?`,
            products: [product],
          };
        }
      } catch (err) {
        console.warn("[AI Service] Product detail lookup error:", err.message);
      }

      return {
        text: "I couldn't find that product in our current public catalog. It may have been removed or is not yet available for sale.",
        products: [],
      };
    }

    // Category browser
    if (intent.type === "category-list") {
      try {
        const categories = await categoryRepository.findAll();

        if (!categories || categories.length === 0) {
          return {
            text: "I'm sorry, we currently don't have any categories available in our system. Please check back later!",
            products: [],
          };
        }

        const topCategories = categories.slice(0, 3);
        const categoryListText = topCategories
          .map((cat, idx) => `${idx + 1}. **${cat.name}**`)
          .join("\n");

        return {
          text: `Great! Here are some popular shopping categories to explore:\n\n${categoryListText}\n\nPlease reply with the category number (1, 2, or 3) to see products in that category. For example: "Show me category 1" or just reply "1".`,
          products: [],
        };
      } catch (err) {
        console.log("[AI Service] Category fetch error:", err.message);
      }
    }

    // Category product selection (fixes the old paginated-object misuse)
    if (intent.type === "category-select") {
      try {
        const categories = await categoryRepository.findAll();

        if (!categories || categories.length === 0) {
          return {
            text: "I'm sorry, no categories available right now.",
            products: [],
          };
        }

        if (intent.index >= categories.length) {
          return {
            text: `That category number is out of range. Please select from 1 to ${Math.min(3, categories.length)}.`,
            products: [],
          };
        }

        const selectedCategory = categories[intent.index];

        const result = await productRepository.getPublicProducts({
          category: selectedCategory._id,
          pageNumber: 0,
          sizeLimit: 3,
        });
        const products = Array.isArray(result?.content) ? result.content : [];

        if (products.length === 0) {
          return {
            text: `I found the **${selectedCategory.name}** category, but unfortunately there are no products available in it at the moment. Would you like to explore another category?`,
            products: [],
          };
        }

        const productListText = formatProductListText(products);

        return {
          text: `Perfect! Here are the top products in the **${selectedCategory.name}** category:\n\n${productListText}\n\nWould you like to add any of these to your cart, or see more products from this category?`,
          products,
        };
      } catch (err) {
        console.log("[AI Service] Category products fetch error:", err.message);
      }
    }

    // General small talk / non-shopping conversation
    if (intent.type === "general") {
      const normalized = prompt.toLowerCase().trim();

      if (normalized.includes("your name")) {
        return {
          text: `I'm your **${branding.appName} AI Assistant**. I can help you find products, browse categories, review your cart, and track orders.`,
          products: [],
        };
      }

      if (normalized.includes("who are you") || normalized.includes("what are you")) {
        return {
          text: `I'm **${AI_NAME}**, your AI shopping assistant. Ask me about products, categories, cart, orders, or delivery.`,
          products: [],
        };
      }

      if (normalized.includes("thank")) {
        return {
          text: "You're welcome! Is there anything else I can help you with today?",
          products: [],
        };
      }

      if (normalized.includes("bye") || normalized.includes("goodbye")) {
        return {
          text: "Goodbye! Thanks for chatting with me. Happy shopping!",
          products: [],
        };
      }

      return {
        text: "I'm here to help you shop. Ask me to find products, show categories, check your cart, or track your orders.",
        products: [],
      };
    }

    // Product search
    if (intent.type === "search") {
      const matchedProducts = await findMatchingProductsByQuery(prompt);

      if (matchedProducts.length > 0) {
        return {
          text: `Here are products I found matching your query:\n\n${formatProductListText(matchedProducts.slice(0, 3))}\n\nLet me know if you want to view one in detail or add it to your cart.`,
          products: matchedProducts,
        };
      }

      return {
        text: 'I couldn\'t find any products matching that query in our current catalog. Try a different search, such as "nike sneakers" or "t shirt", or ask me to show available categories.',
        products: [],
      };
    }

    // Fallback: generic help
    return {
      text: `Hello! I am your **${branding.appName} AI Assistant** chatbot.\n\nI can help you with:\n- "Show me categories" - Browse shopping categories\n- "What is in my cart?" - View your cart\n- "Show my recent orders" - Track orders\n- "Tell me about this product" - Product information\n\nHow can I assist you with your shopping experience today?`,
      products: [],
    };
  };

  /**
   * Public mock entry point — attaches the detected intent so responses can
   * carry the structured `intent` field without touching every return above.
   */
  const processMockResponse = async ({ prompt, productId, userId }) => {
    const intent = detectIntent(prompt, { productId });
    const result = await processMockResponseInternal({ prompt, productId, userId });

    return {
      ...result,
      intent: result.intent || intent.type,
    };
  };

  /**
   * Main Generative Assistant entry-point.
   * Coordinates handshakes with Google Gemini API, falling back to local mocks if API key is missing.
   */
  const getChatBotResponse = async ({
    prompt,
    productId = null,
    userId = null,
    action = null,
  }) => {
    const groqKey = env.groqApiKey;
    const model = env.groqModel;

    const isMockMode =
      !groqKey || groqKey.includes("MOCK") || process.env.NODE_ENV === "test";

    // =========================================
    // Phase 4: structured action from UI buttons
    // =========================================
    if (action && typeof action === "object") {
      return handleStructuredAction({ action, userId });
    }

    // =========================================
    // Phase 4: natural-language action request
    // =========================================
    const actionRequest = extractActionRequest(prompt);
    if (actionRequest) {
      return handleDetectedAction({
        actionRequest,
        prompt,
        userId,
        bodyProductId: productId,
      });
    }

    if (isMockMode) {
      const mockResult = await processMockResponse({
        prompt,
        productId,
        userId,
      });

      const sources = mapPublicProductSources(mockResult.products).slice(0, 3);

      // Remember the surfaced products so "the first one" references resolve.
      if (userId) {
        rememberProductList(userId, mockResult.products.slice(0, 5));
      }

      return {
        response: mockResult.text,
        mockMode: true,
        sources,
        intent: INTENT_TO_ACTION[mockResult.intent] || "SEARCH",
        actions: buildSourceActions(sources),
        actionResult: null,
        cart: null,
        loginRequired: false,
      };
    }

    try {
      let product = null;
      let cart = null;
      let orders = [];

      // =========================================
      // Load Product Context
      // =========================================

      if (productId) {
        try {
          product = await productRepository.findPublicById(productId);
        } catch (e) {
          console.warn("[AI Service] Product Context Error:", e.message);
        }
      }

      // =========================================
      // Load User Context
      // =========================================

      if (userId) {
        try {
          cart = await cartRepository.findByUserId({ userId });
        } catch (e) {
          console.warn("[AI Service] Cart Context Error:", e.message);
        }

        try {
          orders = await orderRepository.findByUser({ userId });
        } catch (e) {
          console.warn("[AI Service] Order Context Error:", e.message);
        }
      }

      let history = "";

      if (userId) {
        const previous = conversationStore.get(userId) || [];

        history = previous
          .slice(-6)
          .map((msg) => `${msg.role}: ${msg.message}`)
          .join("\n");
      }

      // =========================================
      // Build Final Prompt
      // =========================================

      const finalPrompt = buildPrompt({
        prompt: `
Conversation:

${history}

Question:

${prompt}
`,
        productContext: buildProductContext(product),
        cartContext: buildCartContext(cart),
        orderContext: buildOrderContext(orders),
      });
      // =========================================
      // Gemini API
      // =========================================

      // Bound the upstream call so a hung provider never hangs the chat.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(
          `https://api.groq.com/openai/v1/chat/completions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${groqKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: "system",
                  content: COMPANY_CONTEXT,
                },
                {
                  role: "user",
                  content: finalPrompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 250,
              top_p: 0.95,
            }),
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok) {
          // Metadata-only provider error log. The full provider response may
          // echo private context and must never be written to logs.
          console.error(
            `[AI Service] Groq API error (status ${response.status}): ${data.error?.message || "Unknown provider error."}`
          );

          throw new Error(data.error?.message || "Groq API request failed.");
        }

        console.log("[AI Service] Groq response received.");

        const generatedText =
          data.choices?.[0]?.message?.content ||
          "Sorry, I couldn't generate a response.";

        if (userId) {
          const previousMessages = conversationStore.get(userId) || [];

          previousMessages.push({
            role: "user",
            message: prompt,
          });

          previousMessages.push({
            role: "assistant",
            message: generatedText,
          });

          if (previousMessages.length > 20) {
            previousMessages.splice(0, previousMessages.length - 20);
          }

          saveConversation(userId, previousMessages);
        }
        const sources = [];
        try {
          const matchedProducts = await findMatchingProductsByQuery(prompt);
          if (matchedProducts.length > 0) {
            sources.push(...mapPublicProductSources(matchedProducts).slice(0, 3));
            if (userId) {
              rememberProductList(userId, matchedProducts.slice(0, 5));
            }
          }
        } catch (err) {
          console.warn("[AI Service] Groq source enrichment error:", err.message);
        }

        return {
          response: generatedText,
          mockMode: false,
          sources,
          intent: INTENT_TO_ACTION[detectIntent(prompt, { productId }).type] || "SEARCH",
          actions: buildSourceActions(sources),
          actionResult: null,
          cart: null,
          loginRequired: false,
        };
      } catch (error) {
        if (error.name === "AbortError") {
          console.error("[AI Service] Groq request timed out.");
        } else {
          console.error("[AI Service] Groq request failed:", error.message);
        }

        return {
          response:
            "I'm currently unable to connect to the AI service. Please try again in a moment.",
          mockMode: false,
          sources: [],
          intent: "FALLBACK",
          actions: [],
          actionResult: null,
          cart: null,
          loginRequired: false,
        };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error("[AI Service] Groq request failed:", error.message);

      return {
        response:
          "I'm currently unable to connect to the AI service. Please try again in a moment.",
        mockMode: false,
        sources: [],
        intent: "FALLBACK",
        actions: [],
        actionResult: null,
        cart: null,
        loginRequired: false,
      };
    }
  };

  return Object.freeze({
    getChatBotResponse,
    getStatus,
  });
};
