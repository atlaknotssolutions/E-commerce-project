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

  // router.post("/chat", optionalAuthenticate, asyncHandler(aiController.chat));
  // router.post("/chat/demo", asyncHandler(aiController.chatDemo));
  // router.get("/health", aiController.health);

  router.post("/ai/chat", optionalAuthenticate, asyncHandler(aiController.chat));
  router.post("/ai/chat/demo", asyncHandler(aiController.chatDemo));
  router.get("/ai/health", aiController.health);

  return router;
};
