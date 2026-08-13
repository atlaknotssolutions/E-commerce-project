import { Router } from "express";

/**
 * Builds the /api/ai router. The router and controller are injected
 * so this module remains a pure route composition layer.
 */
export const createAiRoutes = ({
  router,
  aiController,
  authenticate,
  asyncHandler,
  aiRateLimiter,
}) =>
{
  const optionalAuthenticate = (req, res, next) =>
  {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
    {
      return next();
    }
    return authenticate(req, res, next);
  };

  // /ai/chat: optional auth runs FIRST so the rate limiter can scope
  // authenticated users by user id while guests stay IP-throttled.
  router.post(
    "/ai/chat",
    optionalAuthenticate,
    aiRateLimiter,
    asyncHandler(aiController.chat),
  );

  // /ai/chat/demo: no auth, so the limiter throttles purely by IP.
  router.post(
    "/ai/chat/demo",
    aiRateLimiter,
    asyncHandler(aiController.chatDemo),
  );

  router.get("/ai/health", aiController.health);

  return router;
};
