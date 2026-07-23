/**
 * Pure function-based routing factory representing the Return Request API gateways.
 * Binds return paths directly to authenticators and RBAC filters using dependency injection.
 */
export const createReturnRoutes = ({
    router,
    returnController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{

    // ==========================================
    // CUSTOMER RETURN GATEWAYS (/api/returns/*)
    // ==========================================

    // Customer Endpoint: Submit a new return request for a delivered order item
    router.post(
        '/api/returns',
        authenticate,
        asyncHandler(returnController.requestReturn)
    );

    // Customer Endpoint: Retrieve own return request history
    router.get(
        '/api/returns',
        authenticate,
        asyncHandler(returnController.getMyReturns)
    );

    // ==========================================
    // SELLER RETURN GATEWAYS (/seller/returns/*)
    // ==========================================

    // Seller Endpoint: Retrieve return requests assigned to own store
    router.get(
        '/seller/returns',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(returnController.getSellerReturns)
    );

    // Seller Endpoint: Approve a pending return request
    router.patch(
        '/seller/returns/:returnId/approve',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(returnController.approveReturn)
    );

    // Seller Endpoint: Reject a pending return request
    router.patch(
        '/seller/returns/:returnId/reject',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(returnController.rejectReturn)
    );

    // Seller Endpoint: Confirm receipt of returned item and trigger restock
    router.patch(
        '/seller/returns/:returnId/receive',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(returnController.markItemReceived)
    );

    // Seller Endpoint: Process refund for a received return
    router.patch(
        '/seller/returns/:returnId/refund',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(returnController.processRefund)
    );

    return router;
};
