export const createCookieConsentRoutes = ({
    router,
    controller,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) => {

    router.get(
        '/api/cookies/consent',
        asyncHandler(controller.getConsent)
    );

    router.post(
        '/api/cookies/consent',
        asyncHandler(controller.createConsent)
    );

    router.put(
        '/api/cookies/consent',
        asyncHandler(controller.updateConsent)
    );

    router.delete(
        '/api/cookies/consent',
        asyncHandler(controller.deleteConsent)
    );

    router.get(
        '/api/cookies/consent/stats',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getStatistics)
    );

    return Object.freeze(router);
};
