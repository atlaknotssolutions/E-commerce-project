/**
 * Pure function-based factory representing the AI Chatbot HTTP API Controllers.
 * Strictly enforces thin controller design principles.
 */
export const createAiController = ({ aiService, logger = console }) =>
{
    /**
     * Application-level chatbot prompt limit. Enforced before any work
     * happens so oversized prompts never reach product queries or any
     * external provider. Well below the global 100kb Express body limit.
     */
    const MAX_PROMPT_LENGTH = 5000;

    /**
     * Shared handler so /chat and /chat/demo can't drift out of sync,
     * and so error handling only has to be written once.
     */
    const handleChat = async ({ prompt, productId, userId, action }, res) =>
    {
        if (!prompt || typeof prompt !== "string" || !prompt.trim())
        {
            return res.status(400).json({
                role: "assistant",
                message: "A non-empty 'prompt' is required.",
            });
        }

        const cleanPrompt = prompt.trim();

        if (cleanPrompt.length > MAX_PROMPT_LENGTH)
        {
            return res.status(400).json({
                role: "assistant",
                message: `Prompt is too long. Please keep it under ${MAX_PROMPT_LENGTH} characters.`,
            });
        }

        // productId must be a non-empty string; anything else is ignored so
        // a malformed/untrusted value can never reach the persistence layer.
        const cleanProductId =
            typeof productId === "string" && productId.trim()
                ? productId.trim()
                : null;

        // Structured action payloads (from frontend action buttons) are
        // validated again by the allowlisted action registry in the service.
        // userId is NEVER accepted from the client — it comes from req.user.
        const cleanAction =
            action && typeof action === "object" && !Array.isArray(action)
                ? {
                      type: typeof action.type === "string" ? action.type : null,
                      productId:
                          typeof action.productId === "string"
                              ? action.productId
                              : null,
                      cartItemId:
                          typeof action.cartItemId === "string"
                              ? action.cartItemId
                              : null,
                      quantity: action.quantity,
                  }
                : null;

        try
        {
            const result = await aiService.getChatBotResponse({
                prompt: cleanPrompt,
                productId: cleanProductId,
                userId,
                action: cleanAction,
            });

            return res.status(200).json({
                role: "assistant",
                message: result.response,
                intent: result.intent || null,
                mockMode: result.mockMode === undefined ? true : result.mockMode,
                sources: result.sources || [],
                actions: result.actions || [],
                actionResult: result.actionResult || null,
                cart: result.cart || null,
                loginRequired: Boolean(result.loginRequired),
            });
        }
        catch (err)
        {
            // Metadata-only: never log the full error object or any
            // request/response payload.
            logger.error("[AI Controller] getChatBotResponse failed:", err.message);

            return res.status(502).json({
                role: "assistant",
                message: "Sorry, I couldn't process that request right now.",
                intent: "FALLBACK",
                mockMode: true,
                sources: [],
                actions: [],
                actionResult: null,
                cart: null,
                loginRequired: false,
            });
        }
    };

    /**
     * POST /api/ai/chat
     */
    const chat = async (req, res) =>
    {
        const userId = req.user?.id || null;
        const { prompt, productId, action } = req.body || {};

        return handleChat({ prompt, productId, action, userId }, res);
    };

    /**
     * POST /api/ai/chat/demo
     */
    const chatDemo = async (req, res) =>
    {
        const message = req.query?.message || req.body?.message || "Hello";

        return handleChat({ prompt: message, productId: null, userId: null }, res);
    };

    /**
     * GET /api/ai/health — surfaces index status from the RAG service.
     */
    const health = (req, res) =>
    {
        return res.status(200).json(aiService.getStatus());
    };

    return Object.freeze({
        chat,
        chatDemo,
        health,
    });
};