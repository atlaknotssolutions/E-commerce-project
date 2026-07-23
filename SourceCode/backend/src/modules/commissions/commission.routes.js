export const createCommissionRoutes = ({
    router,
    controller,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) => {
    // Admin routes
    router.get(
        '/admin/commissions/statistics',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getCommissionStats)
    );

    router.get(
        '/admin/commissions',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getAllCommissions)
    );

    router.get(
        '/admin/commissions/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getCommission)
    );

    router.post(
        '/admin/commissions/calculate/:orderId',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.calculateCommission)
    );

    // Seller routes
    router.get(
        '/seller/commissions/statistics',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getSellerCommissionStats)
    );

    router.get(
        '/seller/commissions',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getSellerCommissions)
    );

    return Object.freeze(router);
};
