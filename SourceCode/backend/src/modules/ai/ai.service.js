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
  deriveProductTopic,
} from "./ai.language.js";
import {
  detectShoppingIntent,
  extractShoppingConstraints,
  extractComparisonTargets,
  mergeShoppingConstraints,
  SHOPPING_INTENTS,
} from "./ai.shopping.js";
import {
  rankShoppingProducts,
  pickComparableProducts,
  buildComparisonText,
  buildTopPickExplanation,
} from "./ai.recommendations.js";
import { createShoppingContextStore } from "./ai.context.js";

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

  const productIdOfDoc = (product) =>
    product?._id?.toString?.() || product?.id || null;

  /**
   * Records the ids the assistant just surfaced in the shopping episode so a
   * follow-up "aur options" pages forward instead of repeating the same top 3.
   */
  const rememberShownProducts = (userId, products = []) => {
    const key = shoppingSessionKey(userId);
    if (!key) return;
    const prev = shoppingContextStore.get(key) || {};
    const existing = new Set(Array.isArray(prev.shownIds) ? prev.shownIds : []);
    (Array.isArray(products) ? products : []).forEach((product) => {
      const id = productIdOfDoc(product);
      if (id) existing.add(id);
    });
    shoppingContextStore.save(key, {
      ...prev,
      shownIds: [...existing],
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
   * Per-user memory of the most recent shopping episode (query, parsed
   * constraints, ranked result ids). Used only to resolve follow-up shopping
   * intents ("pehla wala better hai?", "aur options dikhao") in the same
   * conversation language. Pure presentation state — never authorization.
   */
  const shoppingContextStore = createShoppingContextStore({
    maxSessions: 1000,
  });

  const shoppingSessionKey = (userId) =>
    typeof userId === "string" && userId ? userId : null;

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
    const selectedContext = shoppingContextStore.get(shoppingSessionKey(userId));
    const selectedProductId = selectedContext?.selectedProductId || null;
    const ref = actionRequest?.ref;

    if (!ref)
    {
      // "cart me daal do" right after a product was selected -> that product.
      return bodyProductId || selectedProductId || null;
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
      return context.lastProductId || bodyProductId || selectedProductId || null;
    }

    return bodyProductId || selectedProductId || null;
  };

  const loginRequiredResponse = (lang, actionType) => {
    const message =
      actionType === ACTIONS.VIEW_CART
        ? t(lang, "loginRequiredView")
        : actionType === ACTIONS.ADD_TO_WISHLIST
          ? t(lang, "loginRequiredWishlist")
          : t(lang, "loginRequiredAdd");

    return {
      response: message,
      intent: ACTIONS.LOGIN_REQUIRED,
      mockMode: true,
      sources: [],
      actions: [{ type: ACTIONS.LOGIN_REQUIRED, label: "Login to Continue" }],
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

    if (AUTH_REQUIRED_ACTIONS.has(type) && !userId)
    {
      return loginRequiredResponse(lang, type);
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

    if (AUTH_REQUIRED_ACTIONS.has(type) && !userId)
    {
      return loginRequiredResponse(lang, type);
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
   * Phase 6 Smart Shopping: builds a localized recommendation/gift/comparison
   * reply from the parsed constraints, ranked public catalog and the existing
   * RESPONSES templates. All explanatory text flows through t(lang, ...) so
   * the reply follows the detected conversation language; product data is
   * never translated or modified.
   */
  const processShoppingResponse = async ({ prompt, lang, userId }) => {
    const context = shoppingContextStore.get(shoppingSessionKey(userId));
    const hasContext = Boolean(context?.resultIds?.length);

    const intent = detectShoppingIntent({
      raw: prompt,
      hasContext,
      context,
    });
    const type = intent?.type;

    const constraints = extractShoppingConstraints(prompt);
    const tokens = getSearchTokens(normalizeCommerceQuery(prompt)).filter(
      (token) => !/^₹?\s?\d[\d,]*$/.test(token),
    );
    const maxPrice = constraints?.budget?.maxPrice || extractBudgetNumber(prompt);

    let products = [];
    try {
      const result = await productRepository.getPublicProducts({
        pageNumber: 0,
        sizeLimit: 50,
      });
      products = Array.isArray(result?.content) ? result.content : [];
    } catch (err) {
      console.warn("[AI Service] Shopping pool fetch error:", err.message);
      products = [];
    }

    if (maxPrice) {
      products = products.filter(
        (product) => Number(product.sellingPrice) <= maxPrice,
      );
    }

    const ranked = rankShoppingProducts(products, constraints, tokens);

    const rememberShoppingEpisode = (episodeIntent = type) => {
      const key = shoppingSessionKey(userId);
      if (!key) return;
      const prev = shoppingContextStore.get(key) || {};
      shoppingContextStore.save(key, {
        ...prev,
        lastQuery: prompt,
        constraints,
        resultIds: ranked.slice(0, 5).map((item) => item.product?._id?.toString?.() || item.product?.id),
        rankMap: ranked.slice(0, 5).map((item) => item.product),
        found: ranked.length > 0,
        intent: episodeIntent,
      });
    };

    // Plain product search stays on the existing search path, but the ranked
    // episode is recorded so follow-ups ("wireless wale", "aur options") can
    // refine against the same pool instead of losing the original query.
    if (!type || type === SHOPPING_INTENTS.SEARCH) {
      rememberShoppingEpisode("search");
      return null;
    }

    const productIdOf = (product) =>
      product?._id?.toString?.() || product?.id || null;

    /** Records the ids the assistant actually surfaced so "aur options" /
     *  "kuch aur" can page forward instead of repeating the same top 3. */
    const trackShown = (products = []) => {
      const key = shoppingSessionKey(userId);
      if (!key) return;
      const prev = shoppingContextStore.get(key) || {};
      const existing = new Set(Array.isArray(prev.shownIds) ? prev.shownIds : []);
      (Array.isArray(products) ? products : []).forEach((product) => {
        const id = productIdOf(product);
        if (id) existing.add(id);
      });
      shoppingContextStore.save(key, {
        ...prev,
        shownIds: [...existing],
      });
    };

    const rememberSelection = (selectedProduct) => {
      const key = shoppingSessionKey(userId);
      if (!key) return;
      const prev = shoppingContextStore.get(key) || {};
      shoppingContextStore.save(key, {
        ...prev,
        lastQuery: prompt,
        selectedProductId: productIdOf(selectedProduct),
        intent: type,
      });
    };

    const noResultText = () =>
      t(lang, "shoppingNoResult", { suggestion: "" })
        .replace(/\s*\.\s*$/, ".")
        .replace(/\s*$/, "");

    const numberedList = (items) =>
      items
        .map(
          (item, idx) =>
            `${idx + 1}. **${item.product.title}** — Rs. ${item.product.sellingPrice}`,
        )
        .join("\n");

    // ---- GIFT ----
    if (type === SHOPPING_INTENTS.GIFT) {
      rememberShoppingEpisode();
      if (ranked.length === 0) {
        return { text: noResultText(), products: [], intent: type };
      }
      const top = ranked.slice(0, 3);
      return {
        text: t(lang, "giftIntro"),
        products: top.map((item) => item.product),
        intent: type,
      };
    }

    // ---- COMPARISON ----
    if (type === SHOPPING_INTENTS.COMPARISON) {
      const targets = extractComparisonTargets(prompt, context);
      let items = null;
      if (targets && context?.rankMap?.length) {
        const picked = targets
          .map((target) => context.rankMap[target.index])
          .filter(Boolean);
        if (picked.length >= 2) {
          items = picked.map((product) => ({ product, score: 0, reasons: [] }));
        }
      }
      if (!items) {
        items = pickComparableProducts(ranked, 2);
      }

      rememberShoppingEpisode();
      if (!items || items.length < 2) {
        return { text: noResultText(), products: [], intent: type };
      }

      const text = buildComparisonText({
        items,
        constraints,
        t,
        lang,
      });
      if (!text) {
        return { text: noResultText(), products: [], intent: type };
      }
      return {
        text,
        products: items.map((item) => item.product),
        intent: type,
      };
    }

    // ---- DETAIL: "iska price kya hai" / "iske baare mein batao" ----
    if (type === SHOPPING_INTENTS.DETAIL) {
      const selectedId = context?.selectedProductId || null;
      let product = null;
      if (selectedId) {
        product = (Array.isArray(context?.rankMap) ? context.rankMap : [])
          .find((p) => productIdOf(p) === selectedId) || null;
      }
      if (!product && selectedId) {
        try {
          product = await productRepository.findPublicById(selectedId);
        } catch (err) {
          console.warn("[AI Service] Selected product detail lookup error:", err.message);
          product = null;
        }
      }
      if (!product) {
        return { text: t(lang, "detailNotFound"), products: [], intent: type };
      }
      trackShown([product]);
      return {
        text: `${t(lang, "detail", { title: product.title, price: product.sellingPrice, stock: product.quantity })}\n\n- Discount Offered: ${product.discountPercent}% off\n- Color Variant: ${product.color || "Not specified"}\n- Sizes Available: ${product.sizes || "Not specified"}\n\n${t(lang, "detailAddPrompt")}`,
        products: [product],
        intent: type,
      };
    }

    // ---- SELECT: "second wala", "ye wala", "pehla wala" ----
    if (type === SHOPPING_INTENTS.SELECT) {
      const ref = intent?.reference || null;
      let selectedProduct = null;

      if (ref?.kind === "index") {
        if (ref.outOfRange) {
          const count = Array.isArray(context?.rankMap) ? context.rankMap.length : 0;
          return {
            text: t(lang, "selectionOutOfRange", { count, s: count === 1 ? "" : "s" }),
            products: [],
            intent: type,
          };
        }
        selectedProduct = Array.isArray(context?.rankMap) ? context.rankMap[ref.index] : null;
      }

      if (!selectedProduct) {
        return { text: noResultText(), products: [], intent: type };
      }

      rememberSelection(selectedProduct);
      trackShown([selectedProduct]);
      return {
        text: `${t(lang, "detailShort", { title: selectedProduct.title, price: selectedProduct.sellingPrice })}\n\n${t(lang, "detailAddPrompt")}`,
        products: [selectedProduct],
        intent: type,
      };
    }

    // ---- RECOMMENDATION / SHOW_MORE / ALTERNATIVES / REFINE ----
    const isFollowUp = type === SHOPPING_INTENTS.SHOW_MORE ||
      type === SHOPPING_INTENTS.ALTERNATIVES ||
      type === SHOPPING_INTENTS.REFINE;
    const effectivePrompt = isFollowUp ? (context?.lastQuery || prompt) : prompt;

    // Follow-ups inherit the earlier constraints so a budget/colour chosen in
    // the original query still filters "aur options" / "wireless wale".
    const effectiveConstraints = isFollowUp
      ? mergeShoppingConstraints(context?.constraints || {}, constraints)
      : constraints;

    let effectiveRanked = ranked;
    if (effectivePrompt !== prompt) {
      const tokens2 = getSearchTokens(normalizeCommerceQuery(effectivePrompt)).filter(
        (token) => !/^₹?\s?\d[\d,]*$/.test(token),
      );
      const max2 = extractBudgetNumber(effectivePrompt);
      let pool = products;
      if (max2) {
        pool = pool.filter(
          (product) => Number(product.sellingPrice) <= max2,
        );
      }
      effectiveRanked = rankShoppingProducts(pool, effectiveConstraints, tokens2);
    }

    // "aur options" / "kuch aur" page forward past already-shown results.
    let nextBatch = effectiveRanked;
    if (type === SHOPPING_INTENTS.SHOW_MORE || type === SHOPPING_INTENTS.ALTERNATIVES) {
      const shown = new Set(Array.isArray(context?.shownIds) ? context.shownIds : []);
      nextBatch = effectiveRanked.filter((item) => !shown.has(productIdOf(item.product)));
    }

    rememberShoppingEpisode();
    if (nextBatch.length === 0) {
      return { text: t(lang, "noMoreOptions", { suggestion: "" }), products: [], intent: type };
    }

    const top = nextBatch.slice(0, 3);
    trackShown(top.map((item) => item.product));
    const topPick = buildTopPickExplanation(nextBatch, effectiveConstraints, t, lang);
    return {
      text: `${t(lang, "recommendList")}\n\n${topPick}`,
      products: top.map((item) => item.product),
      intent: type,
    };
  };

  /**
   * Voices a clarifying question when the user asks for a recommendation
   * without enough signal ("show me something good" / "something for my
   * brother"). Avoids a confusing empty-search reply and keeps the
   * conversation human-like. Returns null when the prompt has real search
   * signal and should flow through the normal pipeline.
   */
  const buildLowSignalClarification = async ({ prompt, lang }) => {
    const raw = String(prompt);
    const norm = normalizeCommerceQuery(raw).toLowerCase();

    // Low-signal recipient ("something for my brother/dad/sister") -> ask the
    // budget so the follow-up can be constrained instead of a blind search.
    const recipientPattern =
      /\b(something|some|kuch|koi|gift|tohfa)\b[\s\S]*\b(for|ke\s+liye|ke\s+wat|ler|ke\s+waste|vaste)\b[\s\S]*\b(brother|bhai|bhaiya|sister|behen|bhabhi|father|dad|papa|mother|mom|mummy|maa|friend|dost|wife|patni|husband|pati|son|beta|beti|daughter|girl|boy|ladka|ladki|uncle|chacha|aunty|bua|bibi)\b/i;

    // Pure nudge ("show me something good", "kuch achha dikhao", "suggest
    // something nice") -> surface categories so the user can pick a direction.
    const vagueSuggestionPattern =
      /\b(show|give|suggest|recommend|recommend|find|dikhao|dikha|batao|bata|suggest)\b[\s\S]*\b(something|some|kuch|koi)\b[\s\S]*\b(good|nice|best|great|awesome|accha|achha|achhi|badhiya|theek)\b/i;

    if (recipientPattern.test(raw)) {
      return {
        text: t(lang, "budgetQuestion"),
        products: [],
        intent: "general",
      };
    }

    if (vagueSuggestionPattern.test(raw)) {
      try {
        const categories = await categoryRepository.findAll();
        if (categories && categories.length > 0) {
          const topCategories = categories.slice(0, 3);
          const categoryListText = topCategories
            .map((cat, idx) => `${idx + 1}. **${cat.name}**`)
            .join("\n");

          return {
            text: `${t(lang, "budgetQuestion")}\n\n${t(lang, "categoryPrompt")}\n\n${categoryListText}\n\n${t(lang, "categoryPickHint")}`,
            products: [],
            intent: "category-list",
          };
        }
      } catch (err) {
        console.warn(
          "[AI Service] Category clarification fetch error:",
          err.message,
        );
      }

      return {
        text: t(lang, "budgetQuestion"),
        products: [],
        intent: "general",
      };
    }

    return null;
  };

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
            intent: intent.type,
          };
        }

        return {
          text: t(lang, "categoryProducts", { name: selectedCategory.name }),
          products,
          intent: intent.type,
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
      // Phase 6C.2: before hitting the catalog, voice a clarifying question for
      // low-signal nudges ("show me something good", "something for my brother")
      // instead of returning a confusing empty-search reply.
      const clarification = await buildLowSignalClarification({ prompt, lang });
      if (clarification) {
        return clarification;
      }

      // Phase 6: route recommendation / gift / comparison prompts through the
      // localized shopping pipeline. Plain product searches keep the existing
      // search path (searchFound / searchEmpty).
      const shoppingReply = await processShoppingResponse({ prompt, lang, userId });
      if (shoppingReply) {
        return shoppingReply;
      }

      const matchedProducts = await findMatchingProductsByQuery(prompt);

      if (matchedProducts.length > 0) {
        const topicTokens = getSearchTokens(
          normalizeCommerceQuery(prompt),
        ).filter((token) => !/^₹?\s?\d[\d,]*$/.test(token));
        const topic = deriveProductTopic(topicTokens);
        const topicLabel =
          topic?.[matchedProducts.length === 1 ? "singular" : "plural"] ??
          (matchedProducts.length === 1 ? "option" : "options");

        return {
          text: t(
            lang,
            matchedProducts.length === 1 ? "searchFoundOne" : "searchFoundMany",
            { count: matchedProducts.length, topic: topicLabel },
          ),
          products: matchedProducts,
          intent: intent.type,
        };
      }

      return {
        text: t(lang, "searchEmpty"),
        products: [],
        intent: intent.type,
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
   * Builds the full structured chat payload for a deterministic mock result.
   * Used in mock mode, for shopping intents in Groq mode, and as the safe
   * fallback whenever the provider is unavailable or returns unusable text.
   */
  const buildMockChatResponse = async ({ mockResult, userId, lang }) => {
    const sources = mapPublicProductSources(mockResult.products).slice(0, 3);

    if (userId) {
      rememberProductList(userId, mockResult.products.slice(0, 5));
      rememberShownProducts(userId, mockResult.products.slice(0, 3));
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
  };

  /**
   * Reduces open-ended provider text to the short, clean, human-like shape the
   * assistant promises: strip markdown/code blocks, drop list decorators and
   * headings, collapse whitespace and cap at ~2 sentences / ~220 characters.
   */
  const normalizeGroqConversationText = (raw) => {
    if (typeof raw !== "string") return "";

    const text = raw
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s*([>-]|\d+[.)])\s+/gm, "")
      .replace(/[_\u00A0]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) return "";

    const sentences = text.match(/[^.!?]+[.!?]?/g) || [];
    let capped = sentences.slice(0, 2).join(" ").trim();

    if (capped.length > 220) {
      capped = `${capped.slice(0, 220).replace(/\s+\S*$/, "")}...`;
    }

    return capped;
  };

  /**
   * True only when the text actually says something usable. Provider boilerplate
   * ("Sorry, I couldn't generate a response.") must never be shown to the user —
   * it is treated as a failure and routed to the deterministic fallback.
   */
  const isUsableGroqText = (text) =>
    typeof text === "string" &&
    text.trim().length >= 2 &&
    !/^(sorry|i'?m|i am|i cannot|could not|couldn|unable|error|oops)/i.test(
      text.trim(),
    );

  /**
   * Safe deterministic fallback used when the provider fails (timeout, error,
   * unusable output). Keeps every reply short, localized and human-like instead
   * of surfacing a bare English provider error.
   */
  const safeFallbackResponse = async ({ prompt, productId, userId, lang }) => {
    try {
      const mockResult = await processMockResponse({
        prompt,
        productId,
        userId,
        lang,
      });
      return buildMockChatResponse({ mockResult, userId, lang });
    } catch (err) {
      console.warn(
        "[AI Service] Deterministic fallback failed:",
        err.message,
      );
      return {
        response: t(lang, "providerUnavailable"),
        mockMode: true,
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

      return buildMockChatResponse({ mockResult, userId, lang });
    }

    // =========================================
    // Phase 6C.2: deterministic intent routing.
    // Shopping intents (search, category browsing, product detail) run through
    // the SAME localized pipeline in both mock and Groq mode, so behavior is
    // identical and never leaks raw provider output. Groq is reserved for
    // open-ended general conversation.
    // =========================================
    const intent = detectIntent(prompt, { productId });

    const DETERMINISTIC_INTENTS = new Set([
      "search",
      "category-list",
      "category-select",
      "detail",
    ]);

    if (DETERMINISTIC_INTENTS.has(intent.type)) {
      const mockResult = await processMockResponse({
        prompt,
        productId,
        userId,
        lang,
      });

      return buildMockChatResponse({ mockResult, userId, lang });
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

        const generatedText = normalizeGroqConversationText(
          data.choices?.[0]?.message?.content || "",
        );

        // Provider boilerplate / refusal text must never reach the user.
        if (!isUsableGroqText(generatedText)) {
          console.warn(
            "[AI Service] Groq returned unusable text; using deterministic response.",
          );
          return safeFallbackResponse({ prompt, productId, userId, lang });
        }

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
          intent: INTENT_TO_ACTION[intent.type] || "SEARCH",
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

        return safeFallbackResponse({ prompt, productId, userId, lang });
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error("[AI Service] Groq request failed:", error.message);

      return safeFallbackResponse({ prompt, productId, userId, lang });
    }
  };

  return Object.freeze({
    getChatBotResponse,
    getStatus,
  });
};
