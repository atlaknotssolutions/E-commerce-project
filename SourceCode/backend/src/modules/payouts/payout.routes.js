export const createPayoutRoutes = ({
    router,
    controller,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) => {
    // Seller routes
    router.get(
        '/seller/payouts/balance',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getAvailableBalance)
    );

    router.get(
        '/seller/payouts/statistics',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getSellerPayoutStats)
    );

    router.get(
        '/seller/payouts',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getSellerPayouts)
    );

    router.get(
        '/seller/payouts/:id',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getPayout)
    );

    router.post(
        '/seller/payouts/request',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.requestPayout)
    );

    // Admin routes
    router.get(
        '/admin/payouts/statistics',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getPayoutStats)
    );

    router.get(
        '/admin/payouts',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getAllPayouts)
    );

    router.get(
        '/admin/payouts/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getPayout)
    );

    router.patch(
        '/admin/payouts/:id/approve',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.approvePayout)
    );

    router.patch(
        '/admin/payouts/:id/reject',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.rejectPayout)
    );

    router.patch(
        '/admin/payouts/:id/disburse',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.disbursePayout)
    );

    return Object.freeze(router);
};
