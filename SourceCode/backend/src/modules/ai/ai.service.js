import { env } from "../../config/env.js";
import branding from "../../config/branding.js";

/**
 * Pure function-based factory representing the AI Chatbot Business Service layer.
 * Coordinates Gemini API handshakes and implements a context-aware local mock engine.
 */
export const createAiService = ({
  cartRepository,
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

  const normalizeText = (value = "") =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const getProductSearchValues = (product = {}) => {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const manualValues = [
      product.title,
      product.brand,
      product.color,
      product.sizes,
      product.category?.name,
      product.category?.categoryId,
      product.description,
      ...variants.flatMap((variant) => [
        variant?.attributes?.color,
        variant?.attributes?.size,
        ...(Array.isArray(variant?.attributes?.dynamic)
          ? variant.attributes.dynamic.map((attr) => attr?.value)
          : []),
        ...(Array.isArray(variant?.attributes?.custom)
          ? variant.attributes.custom.map((attr) => attr?.value)
          : []),
      ]),
    ]
      .filter(Boolean)
      .flatMap((value) =>
        String(value)
          .split(/[\s,\/]+/)
          .map((part) => normalizeText(part))
          .filter(Boolean),
      );

    return [...new Set(manualValues)];
  };

  const findMatchingProductsByQuery = async (query) => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return [];

    try {
      const result = await productRepository.getAllProducts({
        pageNumber: 0,
        sizeLimit: 50,
      });

      const products = Array.isArray(result?.content) ? result.content : [];

      return products.filter((product) => {
        const values = getProductSearchValues(product);
        const tokens = normalizedQuery.split(" ").filter(Boolean);

        return tokens.some((token) => {
          if (!token || token.length === 1) {
            return false;
          }

          return values.some((value) => {
            if (!value) return false;
            return (
              value === token || value.includes(token) || token.includes(value)
            );
          });
        });
      });
    } catch (error) {
      console.log("Product query matching error:", error.message);
      return [];
    }
  };

  /**
   * High-Intelligence Local Mock AI Processor.
   * Parses prompts and leverages injected repository data to generate context-aware solutions.
   * Enables seamless local development/testing without any external API keys or network dependencies.
   */
  const processMockResponse = async ({ prompt, productId, userId }) => {
    const query = prompt.toLowerCase().trim();

    // Context-Aware Trigger A: Customer requests Shopping Cart insight
    if (
      query.includes("cart") ||
      query.includes("basket") ||
      query.includes("bag")
    ) {
      if (!userId) {
        return "Please log in to your account first so I can retrieve and review your active shopping cart details.";
      }

      const cart = await cartRepository.findByUserId({ userId });
      if (!cart || cart.items.length === 0) {
        return "I reviewed your active profile and noticed your shopping cart is currently empty. Would you like some product recommendations from our latest catalog?";
      }

      // Format custom plain text analytical breakdown of the user's cart
      const cartSummaryList = cart.items
        .map(
          (item) =>
            `- ${item.product ? item.product.title : "Product"} (Size: ${item.size} | Qty: ${item.quantity} | Price: Rs. ${item.sellingPrice})`,
        )
        .join("\n");

      return `I accessed your shopping cart session securely! Here is the list of items currently saved in your basket:\n\n${cartSummaryList}\n\n**Subtotal Selling Price**: Rs. ${cart.totalSellingPrice}\n**Total Articles**: ${cart.totalItem} items\n\nWould you like me to apply a promotional coupon or help you proceed directly to our secure checkout portal?`;
    }

    // Context-Aware Trigger B: Customer requests Catalog Product details
    if (
      productId ||
      query.includes("product") ||
      query.includes("detail") ||
      query.includes("item")
    ) {
      const targetProductId = productId || "65c1a167098e987bca8a6a44"; // Fallback mockup key

      try {
        const product = await productRepository.findById(targetProductId);
        if (product) {
          return `I pulled the catalog specifications for **${product.title}** directly from our database:\n\n- **Selling Price**: Rs. ${product.sellingPrice} (Original MRP: Rs. ${product.mrpPrice})\n- **Discounts Offered**: ${product.discountPercent}% Off\n- **In-Stock Quantity**: ${product.quantity} units available\n- **Color Variant**: ${product.color}\n- **Sizes Available**: ${product.sizes}\n- **Merchant Store**: ${product.seller ? product.seller.sellerName : branding.appShortName + " Hub"}\n\nWould you like me to automatically add this verified catalog item directly into your shopping cart?`;
        }
      } catch (err) {
        // Fallback gracefully on parsing glitches
      }
    }

    // Context-Aware Trigger C: Customer requests purchases history
    if (
      query.includes("order") ||
      query.includes("purchase") ||
      query.includes("track")
    ) {
      if (!userId) {
        return "Authorization needed: Please authenticate into your account to securely track your sales orders history.";
      }

      const orders = await orderRepository.findByUser({ userId });
      if (!orders || orders.length === 0) {
        return "I checked your accounting history logs and found zero active orders registered under your profile. Start shopping and I will help you track them!";
      }

      const orderSummaryList = orders
        .slice(0, 3)
        .map(
          (o) =>
            `- **ID**: ${o.orderId} | Date: ${new Date(o.orderDate).toLocaleDateString()} | Total: Rs. ${o.totalSellingPrice} | Status: ${o.orderStatus} (Payment: ${o.paymentStatus})`,
        )
        .join("\n");

      return `I accessed your secure ledger accounts! Here are details of your most recent transactions (showing top 3 orders):\n\n${orderSummaryList}\n\nHow can I assist you further with shipping tracking or cancellations?`;
    }

    // Context-Aware Trigger D: Customer requests category/browse products
    if (
      query.includes("category") ||
      query.includes("browse") ||
      query.includes("shop") ||
      query.includes("collection") ||
      query.includes("type") ||
      query.includes("look for") ||
      query.includes("what do you have")
    ) {
      try {
        const categories = await categoryRepository.findAll();

        if (!categories || categories.length === 0) {
          return `I'm sorry, we currently don't have any categories available in our system. Please check back later!`;
        }

        // Get top 3 categories
        const topCategories = categories.slice(0, 3);

        const categoryListText = topCategories
          .map((cat, idx) => `${idx + 1}. **${cat.name}** (ID: ${cat._id})`)
          .join("\n");

        return `Great! Here are some popular shopping categories to explore:\n\n${categoryListText}\n\n📌 **Please reply with the category number (1, 2, or 3) to see products in that category with colors, sizes, and pricing!**\n\nExample: "Show me category 1" or just reply "1"`;
      } catch (err) {
        console.log("Category fetch error:", err.message);
      }
    }

    // Context-Aware Trigger E: Customer selects a category
    if (
      query.match(/^(1|2|3|one|two|three|first|second|third)$/) ||
      query.match(/category\s*(1|2|3)/)
    ) {
      try {
        const categories = await categoryRepository.findAll();

        if (!categories || categories.length === 0) {
          return `I'm sorry, no categories available right now.`;
        }

        // Extract category number
        let categoryIndex = 0;
        if (
          query.includes("1") ||
          query.includes("one") ||
          query.includes("first")
        )
          categoryIndex = 0;
        else if (
          query.includes("2") ||
          query.includes("two") ||
          query.includes("second")
        )
          categoryIndex = 1;
        else if (
          query.includes("3") ||
          query.includes("three") ||
          query.includes("third")
        )
          categoryIndex = 2;

        if (categoryIndex >= categories.length) {
          return `That category number is out of range. Please select from 1 to ${Math.min(3, categories.length)}.`;
        }

        const selectedCategory = categories[categoryIndex];

        // Fetch products from this category using getAllProducts
        const products = await productRepository.getAllProducts({
          category: selectedCategory._id,
          pageNumber: 0,
          sizeLimit: 3,
        });

        if (!products || products.length === 0) {
          return `I found the **${selectedCategory.name}** category, but unfortunately there are no products available in this category at the moment. Would you like to explore another category?`;
        }

        // Get top 3 products with full details
        const topProducts = products.slice(0, 3);

        const productListText = topProducts
          .map((prod) => {
            const colors = prod.color
              ? Array.isArray(prod.color)
                ? prod.color.join(", ")
                : prod.color
              : "Not specified";
            const sizes = prod.sizes
              ? Array.isArray(prod.sizes)
                ? prod.sizes.join(", ")
                : prod.sizes
              : "Not specified";

            return `\n📦 **${prod.title}**\n   💰 Price: Rs. ${prod.sellingPrice} (MRP: Rs. ${prod.mrpPrice})\n   🎨 Colors: ${colors}\n   📏 Sizes: ${sizes}\n   ⭐ Stock: ${prod.quantity} available\n   🏪 Seller: ${prod.seller ? prod.seller.sellerName : "Official Store"}`;
          })
          .join("\n");

        return `Perfect! Here are the top products in the **${selectedCategory.name}** category:\n${productListText}\n\n✨ **All products feature multiple color and size options!**\n\nWould you like to add any of these to your cart, or would you like to see more products from this category?`;
      } catch (err) {
        console.log("Category products fetch error:", err.message);
      }
    }

    const attributeMatchingProducts = await findMatchingProductsByQuery(query);
    if (attributeMatchingProducts.length > 0) {
      const productListText = attributeMatchingProducts
        .slice(0, 3)
        .map((prod) => {
          const colors = Array.isArray(prod.color)
            ? prod.color.join(", ")
            : prod.color || "Not specified";
          const sizes = Array.isArray(prod.sizes)
            ? prod.sizes.join(", ")
            : prod.sizes || "Not specified";

          const categoryName = prod.category?.name || "General";

          return `\n📦 **${prod.title}**\n   🏷️ Category: ${categoryName}\n   💰 Price: Rs. ${prod.sellingPrice} (MRP: Rs. ${prod.mrpPrice})\n   🎨 Colors: ${colors}\n   📏 Sizes: ${sizes}\n   ⭐ Stock: ${prod.quantity} available\n   🏪 Seller: ${prod.seller ? prod.seller.sellerName : "Official Store"}`;
        })
        .join("\n");

      return `I found these products matching your query using category, color, or size:\n${productListText}\n\nHere is the full product details for each match. Let me know if you want to view one in detail or add it to your cart.`;
    }

    // Fallback Scenario: Standard friendly chatbot replies
    return `Hello! I am your **${branding.appName} AI Assistant** chatbot.\n\nI can dynamically fetch your real-time data directly from our databases securely. Ask me questions like:\n- *"Show me categories"* - Browse shopping categories\n- *"What is in my cart?"* - View your cart\n- *"Show my recent orders history"* - Track orders\n- *"Tell me about the product detail"* - Product information\n\nHow can I assist you with your shopping experience today?`;
  };

  /**
   * Main Generative Assistant entry-point.
   * Coordinates handshakes with Google Gemini API, falling back to local mocks if API key is missing.
   */
  const getChatBotResponse = async ({
    prompt,
    productId = null,
    userId = null,
  }) => {
    const groqKey = env.groqApiKey;
    const model = env.groqModel;

    const isMockMode =
      !groqKey || groqKey.includes("MOCK") || process.env.NODE_ENV === "test";

    if (isMockMode) {
      const mockResponse = await processMockResponse({
        prompt,
        productId,
        userId,
      });

      const fallbackSources = [];
      const responseText = mockResponse || "";
      const hasProductMatch =
        responseText.includes("I found these products matching your query") ||
        responseText.includes(
          "Here is the full product details for each match",
        );

      if (hasProductMatch) {
        const matchedProducts = await findMatchingProductsByQuery(prompt);
        return {
          response: mockResponse,
          mockMode: true,
          sources: matchedProducts.slice(0, 3),
        };
      }

      return {
        response: mockResponse,
        mockMode: true,
        sources: fallbackSources,
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
          product = await productRepository.findById(productId);
        } catch (e) {
          console.log("Product Context Error:", e.message);
        }
      }

      // =========================================
      // Load User Context
      // =========================================

      if (userId) {
        try {
          cart = await cartRepository.findByUserId({ userId });
        } catch (e) {
          console.log("Cart Context Error:", e.message);
        }

        try {
          orders = await orderRepository.findByUser({ userId });
        } catch (e) {
          console.log("Order Context Error:", e.message);
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
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Groq API Error:");
        console.error(JSON.stringify(data, null, 2));

        throw new Error(data.error?.message || "Groq API request failed.");
      }

      console.log("=========== GROQ RESPONSE ===========");
      console.log(JSON.stringify(data, null, 2));

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

        conversationStore.set(userId, previousMessages);
      }
      const sources = [];
      try {
        const matchedProducts = await findMatchingProductsByQuery(prompt);
        if (matchedProducts.length > 0) {
          sources.push(...matchedProducts.slice(0, 3));
        }
      } catch (err) {
        console.log("Groq source enrichment error:", err.message);
      }

      return {
        response: generatedText,
        mockMode: false,
        sources,
      };
    } catch (error) {
      console.error("Groq Error:", error);

      return {
        response:
          "I'm currently unable to connect to the AI service. Please try again in a moment.",
        mockMode: false,
        sources: [],
      };
    }
  };

  return Object.freeze({
    getChatBotResponse,
    getStatus,
  });
};
