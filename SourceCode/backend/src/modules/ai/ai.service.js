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

    // Fallback Scenario: Standard friendly chatbot replies
    return `Hello! I am your **${branding.appName} AI Assistant** chatbot.\n\nI can dynamically fetch your real-time data directly from our databases securely. Ask me questions like:\n- *"What is in my cart?"*\n- *"Show my recent orders history"* \n- *"Tell me about the product detail"* \n\nHow can I assist you with your shopping experience today?`;
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
      return {
        response: await processMockResponse({
          prompt,
          productId,
          userId,
        }),
        mockMode: true,
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
      return {
        response: generatedText,
        mockMode: false,
      };
    } catch (error) {
      console.error("Groq Error:", error);

      return {
        response:
          "I'm currently unable to connect to the AI service. Please try again in a moment.",
        mockMode: false,
      };
    }
  };

  return Object.freeze({
    getChatBotResponse,
    getStatus,
  });
};
