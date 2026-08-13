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
import {
  detectLanguage,
  t,
  LANG,
  normalizeCommerceQuery,
} from "./ai.language.js";

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
  // LANGUAGE PERSISTENCE (Phase 5)
  // ============================================================

  /**
   * Per-user language memory. Keyed by the authenticated userId only, so a
   * guest (userId null) is detected fresh on every message and never pollutes
   * another user's conversation. Pure presentation state — never used for
   * authorization or business rules.
   */
  const languageStore = new Map();
  const LANGUAGE_STORE_MAX_USERS = 1000;

  const saveLanguage = (userId, lang) => {
    if (typeof userId !== "string" || !userId) return;

    if (
      languageStore.size >= LANGUAGE_STORE_MAX_USERS &&
      !languageStore.has(userId)
    ) {
      const oldestUserId = languageStore.keys().next().value;
      languageStore.delete(oldestUserId);
    }

    languageStore.set(userId, lang);
  };

  /**
   * Detects the language for the current message. The previous conversation
   * language (per user) is fed in so short contextual messages ("2000",
   * "yes", "wireless wala") inherit it instead of flipping to English.
   */
  const resolveLanguage = (userId, prompt) => {
    const previousLang =
      typeof userId === "string" && userId ? languageStore.get(userId) : null;
    const detection = detectLanguage(prompt, previousLang);
    saveLanguage(userId, detection.code);
    return detection.code;
  };

  const LANGUAGE_LABELS = {
    [LANG.HI]: "Hindi",
    [LANG.HILATN]: "Hinglish (romanized Hindi)",
    [LANG.PA]: "Punjabi",
    [LANG.PALATN]: "romanized Punjabi",
    [LANG.MR]: "Marathi",
    [LANG.BN]: "Bengali",
    [LANG.GU]: "Gujarati",
    [LANG.TA]: "Tamil",
    [LANG.TE]: "Telugu",
    [LANG.KN]: "Kannada",
    [LANG.ML]: "Malayalam",
    [LANG.UR]: "Urdu",
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
   * against the products the assistant most recently surfaced. A keyword
   * reference ("the nike one", "add nike sneakers") falls back to a fresh
   * catalog search so a named product works even on a brand-new session.
   */
  const resolveProductReference = async ({
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
      if (match)
      {
        return match.id || null;
      }

      const [found] = await findMatchingProductsByQuery(token);
      return (
        found?._id?.toString?.() ||
        found?.id ||
        null
      );
    }

    if (ref.kind === "last")
    {
      return context.lastProductId || bodyProductId || null;
    }

    return bodyProductId || null;
  };

  const loginRequiredResponse = (lang, actionType) => {
    const message =
      actionType === ACTIONS.VIEW_CART
        ? t(lang, "loginRequiredView")
        : t(lang, "loginRequiredAdd");

    return {
      response: message,
      intent: ACTIONS.LOGIN_REQUIRED,
      mockMode: true,
      sources: [],
      actions: [{ type: ACTIONS.LOGIN_REQUIRED, label: "Login" }],
      actionResult: null,
      cart: null,
      loginRequired: true,
      language: lang,
    };
  };

  /**
   * Wraps an executed action into the full structured chat response.
   */
  const buildActionResponse = (result, lang) => {
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
      language: lang,
    };
  };

  /**
   * Executes a structured action payload sent by the frontend action buttons.
   * The backend re-validates every field — the frontend is never trusted.
   */
  const handleStructuredAction = async ({ action, userId, lang }) => {
    const type = typeof action?.type === "string" ? action.type : null;

    if (!type)
    {
      return {
        response: t(lang, "invalidAction"),
        intent: "FALLBACK",
        mockMode: true,
        sources: [],
        actions: [],
        actionResult: null,
        cart: null,
        loginRequired: false,
        language: lang,
      };
    }

    if (!actionExecutor.isRegistered(type))
    {
      return {
        response: t(lang, "invalidAction"),
        intent: type,
        mockMode: true,
        sources: [],
        actions: [],
        actionResult: null,
        cart: null,
        loginRequired: false,
        language: lang,
      };
    }

    if (AUTH_REQUIRED_ACTIONS.has(type) && !userId)
    {
      return loginRequiredResponse(lang, type);
    }

    const result = await actionExecutor.dispatchAction({
      type,
      lang,
      userId,
      productId: typeof action.productId === "string" ? action.productId : null,
      cartItemId:
        typeof action.cartItemId === "string" ? action.cartItemId : null,
      quantity: action.quantity,
    });

    return buildActionResponse(result, lang);
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
    lang,
  }) => {
    const type = actionRequest.type;

    // Explicit unsupported/injection marker — never executes anything.
    if (type === "UNSUPPORTED")
    {
      return {
        response: t(lang, "unsupported"),
        intent: "FALLBACK",
        mockMode: true,
        sources: [],
        actions: [],
        actionResult: null,
        cart: null,
        loginRequired: false,
        language: lang,
      };
    }

    if (!actionExecutor.isRegistered(type))
    {
      return {
        response: t(lang, "invalidAction"),
        intent: type,
        mockMode: true,
        sources: [],
        actions: [],
        actionResult: null,
        cart: null,
        loginRequired: false,
        language: lang,
      };
    }

    if (AUTH_REQUIRED_ACTIONS.has(type) && !userId)
    {
      return loginRequiredResponse(lang, type);
    }

    let productId = bodyProductId;

    if (type === ACTIONS.ADD_TO_CART)
    {
      productId = await resolveProductReference({
        userId,
        actionRequest,
        bodyProductId,
      });

      if (!productId)
      {
        return {
          response: t(lang, "askWhichProduct"),
          intent: ACTIONS.ADD_TO_CART,
          mockMode: true,
          sources: [],
          actions: [],
          actionResult: null,
          cart: null,
          loginRequired: false,
          language: lang,
        };
      }
    }

    const result = await actionExecutor.dispatchAction({
      type,
      lang,
      userId,
      productId,
      quantity: actionRequest.quantity,
      ref: actionRequest.ref,
    });

    return buildActionResponse(result, lang);
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
    language = "en",
  }) => `
${COMPANY_CONTEXT}

${productContext}

${cartContext}

${orderContext}

${language === "en" ? "" : `Reply in the customer's language (${LANGUAGE_LABELS[language] || language}).`}

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

  /**
   * Extracts a budget ceiling from the raw prompt, e.g. "2000 ke under",
   * "under ₹1500", "1000 de andar", "budget 3000". Returns null when no
   * budget phrasing is present so model numbers ("nike air 1") never get
   * misread as price constraints.
   */
  const extractBudgetNumber = (prompt = "") =>
  {
    const text = String(prompt);
    const lead =
      text.match(/(?:under|below|within|less\s+than|up\s+to|budget|max)\b[^₹\d]*₹?\s*(\d{2,})/i);
    if (lead)
    {
      return Number(lead[1]);
    }

    const trail =
      text.match(/₹?\s*(\d{2,})\s*(?:ke\s+under|ke\s+andar|de\s+andar|de\s+under|se\s+kam|under\s*price|के\s+अंदर|के\s+भीतर)/i);
    return trail ? Number(trail[1]) : null;
  };

  const findMatchingProductsByQuery = async (query) =>
    {
        // Phase 5: normalize Indic/romanized queries to English search terms,
        // then drop pure-numeric budget tokens ("2000") so they cannot break
        // the AND-semantics of multi-token relevance matching.
        const normalizedQuery = normalizeCommerceQuery(query);
        const searchTokens = getSearchTokens(normalizedQuery).filter(
            // Budget/price tokens ("2000", "₹1000", "₹ 1,000") must not break
            // the AND-semantics of multi-token relevance matching.
            (token) => !/^₹?\s?\d[\d,]*$/.test(token),
        );
        if (searchTokens.length === 0) return [];

        // "X ke under/andar" budget phrased in the raw prompt constrains the
        // catalog, mirroring the RAG service's maxPrice behaviour.
        const maxPrice = extractBudgetNumber(query);

        try
        {
            // Public-catalog only: APPROVED + PUBLISHED + not deleted, and
            // no seller reference populated (private seller data stays out).
            const result = await productRepository.getPublicProducts({
                pageNumber: 0,
                sizeLimit: 50,
            });

            const products = Array.isArray(result?.content) ? result.content : [];

            const withinBudget = maxPrice
                ? products.filter(
                      (product) => Number(product.sellingPrice) <= maxPrice,
                  )
                : products;

            return rankProducts(withinBudget, searchTokens);
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
  const processMockResponseInternal = async ({ prompt, productId, userId, lang = "en" }) => {
    const intent = detectIntent(prompt, { productId });

    // Greeting / small talk
    if (intent.type === "greeting") {
      return {
        text: `${t(lang, "greeting")} ${t(lang, "capability")}`,
        products: [],
      };
    }

    // Cart insight
    if (intent.type === "cart") {
      if (!userId) {
        return {
          text: t(lang, "loginRequiredView"),
          products: [],
        };
      }

      let cart = null;
      try {
        cart = await cartRepository.findByUserId({ userId });
      } catch (err) {
        // Non-ObjectId user claim: treat as no cart rather than crashing.
        console.warn("[AI Service] Cart lookup error:", err.message);
        cart = null;
      }
      if (!cart || cart.items.length === 0) {
        return {
          text: `${t(lang, "cartEmpty")} ${t(lang, "cartEmptySuggest")}`,
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
        text: `${t(lang, "cartView")}\n\n${cartSummaryList}\n\n**Subtotal Selling Price**: Rs. ${cart.totalSellingPrice}\n**Total Articles**: ${cart.totalItem} items`,
        products: [],
      };
    }

    // Order / tracking history
    if (intent.type === "order") {
      if (!userId) {
        return {
          text: t(lang, "orderLoginRequired"),
          products: [],
        };
      }

      let orders = [];
      try {
        orders = await orderRepository.findByUser({ userId });
      } catch (err) {
        // A malformed/non-ObjectId user claim must never 502 the chat —
        // degrade to the same "no orders" reply as an empty history.
        console.warn("[AI Service] Order history lookup error:", err.message);
        orders = [];
      }
      if (!orders || orders.length === 0) {
        return {
          text: t(lang, "orderEmpty"),
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
        text: `${t(lang, "orderFound", { count: orders.length, s: orders.length > 1 ? "s" : "" })}\n\n${orderSummaryList}`,
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
            text: `${t(lang, "detail", { title: product.title, price: product.sellingPrice, stock: product.quantity })}\n\n- Discount Offered: ${product.discountPercent}% off\n- Color Variant: ${product.color || "Not specified"}\n- Sizes Available: ${product.sizes || "Not specified"}\n\n${t(lang, "detailAddPrompt")}`,
            products: [product],
          };
        }
      } catch (err) {
        console.warn("[AI Service] Product detail lookup error:", err.message);
      }

      return {
        text: t(lang, "detailNotFound"),
        products: [],
      };
    }

    // Category browser
    if (intent.type === "category-list") {
      try {
        const categories = await categoryRepository.findAll();

        if (!categories || categories.length === 0) {
          return {
            text: t(lang, "noCategories"),
            products: [],
          };
        }

        const topCategories = categories.slice(0, 3);
        const categoryListText = topCategories
          .map((cat, idx) => `${idx + 1}. **${cat.name}**`)
          .join("\n");

        return {
          text: `${t(lang, "categoryPrompt")}\n\n${categoryListText}\n\n${t(lang, "categoryPickHint")}`,
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
            text: t(lang, "noCategories"),
            products: [],
          };
        }

        if (intent.index >= categories.length) {
          return {
            text: t(lang, "categoryOutOfRange", { max: Math.min(3, categories.length) }),
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
            text: t(lang, "categoryEmpty", { name: selectedCategory.name }),
            products: [],
          };
        }

        const productListText = formatProductListText(products);

        return {
          text: `${t(lang, "categoryProducts", { name: selectedCategory.name })}\n\n${productListText}\n\n${t(lang, "searchActions")}`,
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
          text: t(lang, "identity"),
          products: [],
        };
      }

      if (normalized.includes("who are you") || normalized.includes("what are you")) {
        return {
          text: t(lang, "identity"),
          products: [],
        };
      }

      if (normalized.includes("thank") || /shukriya|sukriya|shukria|shukar|dhanyavad|dhanyavaad/.test(normalized)) {
        return {
          text: t(lang, "thanks"),
          products: [],
        };
      }

      if (normalized.includes("bye") || normalized.includes("goodbye")) {
        return {
          text: t(lang, "bye"),
          products: [],
        };
      }

      return {
        text: t(lang, "capability"),
        products: [],
      };
    }

    // Product search
    if (intent.type === "search") {
      const matchedProducts = await findMatchingProductsByQuery(prompt);

      if (matchedProducts.length > 0) {
        return {
          text: `${t(lang, "searchFound", { count: matchedProducts.length, s: matchedProducts.length > 1 ? "s" : "", query: prompt })}\n\n${formatProductListText(matchedProducts.slice(0, 3))}\n\n${t(lang, "searchActions")}`,
          products: matchedProducts,
        };
      }

      return {
        text: t(lang, "searchEmpty"),
        products: [],
      };
    }

    // Fallback: generic help
    return {
      text: `${t(lang, "identity")}\n\n${t(lang, "capability")}`,
      products: [],
    };
  };

  /**
   * Public mock entry point — attaches the detected intent so responses can
   * carry the structured `intent` field without touching every return above.
   */
  const processMockResponse = async ({ prompt, productId, userId, lang }) => {
    const intent = detectIntent(prompt, { productId });
    const result = await processMockResponseInternal({ prompt, productId, userId, lang });

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

    // Phase 5: resolve the conversation language BEFORE any action/intent
    // handling so every response path can localize. Purely presentational.
    const lang = resolveLanguage(userId, prompt);

    // =========================================
    // Phase 4: structured action from UI buttons
    // =========================================
    if (action && typeof action === "object") {
      return handleStructuredAction({ action, userId, lang });
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
        lang,
      });
    }

    if (isMockMode) {
      const mockResult = await processMockResponse({
        prompt,
        productId,
        userId,
        lang,
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
        language: lang,
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
        language: lang,
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
          language: lang,
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
          language: lang,
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
        language: lang,
      };
    }
  };

  return Object.freeze({
    getChatBotResponse,
    getStatus,
  });
};
