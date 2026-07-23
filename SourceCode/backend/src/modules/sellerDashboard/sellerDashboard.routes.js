/**
 * Pure function-based routing factory representing the Seller Dashboard Analytics API gateways.
 * Binds dashboard paths directly to authenticators and RBAC filters using dependency injection.
 */
export const createSellerDashboardRoutes = ({
    router,
    sellerDashboardController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{

    // ==========================================
    // SECURED SELLER DASHBOARD GATEWAYS (/seller/dashboard/*)
    // ==========================================

    // Seller Endpoint: Retrieve aggregated dashboard summary with analytics KPIs (Authentication & ROLE_SELLER required)
    router.get(
        '/seller/dashboard',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerDashboardController.getDashboardSummary)
    );

    // Seller Endpoint: Retrieve aggregated dashboard summary with analytics KPIs (Authentication & ROLE_SELLER required)
    router.get(
        '/seller/dashboard/summary',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerDashboardController.getDashboardSummary)
    );

    // Seller Endpoint: Retrieve revenue analytics with chart data for a specific period (Authentication & ROLE_SELLER required)
    router.get(
        '/seller/dashboard/revenue',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerDashboardController.getRevenueAnalytics)
    );

    // Seller Endpoint: Retrieve product analytics including overview, top/lowest selling, stock alerts, and newest products (Authentication & ROLE_SELLER required)
    router.get(
        '/seller/dashboard/products',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerDashboardController.getProductAnalytics)
    );

    // Seller Endpoint: Retrieve order analytics including overview, revenue, status distribution, recent orders, and top customers (Authentication & ROLE_SELLER required)
    router.get(
        '/seller/dashboard/orders',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerDashboardController.getOrderAnalytics)
    );

    // Seller Endpoint: Retrieve customer analytics including overview, growth, retention, top/new/repeat customers (Authentication & ROLE_SELLER required)
    router.get(
        '/seller/dashboard/customers',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerDashboardController.getCustomerAnalytics)
    );

    // Seller Endpoint: Retrieve return & refund analytics including overview, refund summary, status distribution, recent returns, top returned products, and return reasons (Authentication & ROLE_SELLER required)
    router.get(
        '/seller/dashboard/returns',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerDashboardController.getReturnRefundAnalytics)
    );

    return router;
};
