/**
 * Pure function-based factory representing the AI Chatbot HTTP API Controllers.
 * Strictly enforces thin controller design principles.
 */
export const createAiController = ({ aiService, logger = console }) =>
{
    /**
     * Shared handler so /chat and /chat/demo can't drift out of sync,
     * and so error handling only has to be written once.
     */
    const handleChat = async ({ prompt, productId, userId }, res) =>
    {
        if (!prompt || typeof prompt !== "string" || !prompt.trim())
        {
            return res.status(400).json({
                role: "assistant",
                message: "A non-empty 'prompt' is required.",
            });
        }

        try
        {
            const result = await aiService.getChatBotResponse({
                prompt: prompt.trim(),
                productId: productId || null,
                userId,
            });

            return res.status(200).json({
                role: "assistant",
                message: result.response,
                mockMode: result.mockMode,
                sources: result.sources,
            });
        }
        catch (err)
        {
            logger.error("[AI Controller] getChatBotResponse failed:", err);

            return res.status(502).json({
                role: "assistant",
                message: "Sorry, I couldn't process that request right now.",
                mockMode: true,
            });
        }
    };

    /**
     * POST /api/ai/chat
     */
    const chat = async (req, res) =>
    {
        const userId = req.user?.id || null;
        const { prompt, productId } = req.body || {};

        return handleChat({ prompt, productId, userId }, res);
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