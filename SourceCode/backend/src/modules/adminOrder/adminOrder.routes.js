/**
 * Pure function-based routing factory representing the Admin Order API gateways.
 * Binds admin order paths under strict admin authorization guards.
 *
 * IMPORTANT: /stats route MUST be defined before /:orderId to avoid param capture.
 */
export const createAdminOrderRoutes = ({
    router,
    adminOrderController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    // ==========================================
    // SECURED ADMIN ORDER GATEWAYS
    // ==========================================

    /**
     * Admin Endpoint
     * Returns aggregated order statistics.
     *
     * GET /admin/orders/stats
     */
    router.get(
        '/admin/orders/stats',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminOrderController.getStats)
    );

    /**
     * Admin Endpoint
     * Lists all orders with search, filters, and pagination.
     *
     * GET /admin/orders?page=&limit=&search=&orderStatus=&paymentStatus=&sellerId=&customerId=&sortBy=&sortOrder=
     */
    router.get(
        '/admin/orders',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminOrderController.listOrders)
    );

    /**
     * Admin Endpoint
     * Returns full details for a single order.
     *
     * GET /admin/orders/:orderId
     */
    router.get(
        '/admin/orders/:orderId',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminOrderController.getOrderDetails)
    );

    /**
     * Admin Endpoint
     * Updates order status. Body: { orderStatus, adminNote }
     *
     * PATCH /admin/orders/:orderId/status
     */
    router.patch(
        '/admin/orders/:orderId/status',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminOrderController.updateOrderStatus)
    );

    return Object.freeze(router);
};
