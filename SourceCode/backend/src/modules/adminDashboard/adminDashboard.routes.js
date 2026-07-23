/**
 * Pure function-based routing factory representing the Admin Dashboard Analytics API gateways.
 * Binds dashboard paths directly to authenticators and RBAC filters using dependency injection.
 */
export const createAdminDashboardRoutes = ({
    router,
    adminDashboardController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{

    // ==========================================
    // SECURED ADMIN DASHBOARD GATEWAYS (/admin/dashboard)
    // ==========================================

    // Admin Endpoint: Retrieve aggregated dashboard analytics with KPIs (Authentication & ROLE_ADMIN required)
    router.get(
        '/admin/dashboard',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminDashboardController.getDashboardAnalytics)
    );

    return router;
};
