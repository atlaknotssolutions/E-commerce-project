export const createSettlementRoutes = ({
    router,
    controller,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    // Seller routes
    router.get(
        '/seller/settlements',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getSellerSettlements)
    );
    router.get(
        '/seller/settlements/statistics',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getSellerSettlementStats)
    );
    router.get(
        '/seller/settlements/:id',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getSettlement)
    );

    // Admin routes
    router.get(
        '/admin/settlements',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getAllSettlements)
    );
    router.get(
        '/admin/settlements/statistics',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getSettlementStats)
    );
    router.get(
        '/admin/settlements/export',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.exportSettlements)
    );
    router.get(
        '/admin/settlements/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getSettlement)
    );

    return Object.freeze(router);
};
