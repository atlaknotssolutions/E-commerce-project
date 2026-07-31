export const createSettlementEngineRoutes = ({
    router,
    controller,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) => {
    // Seller routes
    router.get(
        '/seller/ledger',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getSellerLedger)
    );
    router.get(
        '/seller/ledger/statistics',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getSellerLedgerStats)
    );
    router.get(
        '/seller/ledger/order/:orderId',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(controller.getOrderLedger)
    );

    // Admin routes
    router.get(
        '/admin/ledger',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getAllLedger)
    );
    router.get(
        '/admin/ledger/order/:orderId',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getOrderLedger)
    );
    router.post(
        '/admin/ledger/recalculate/:orderId',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.recalculateSettlement)
    );

    return Object.freeze(router);
};
