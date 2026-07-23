/**
 * Pure function-based routing factory representing the Admin User Management API gateways.
 * Binds user management paths under strict admin authorization guards.
 *
 * IMPORTANT: /counts route MUST be defined before /:id to avoid param capture.
 */
export const createAdminUserRoutes = ({
    router,
    adminUserController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    // ==========================================
    // SECURED ADMIN USER MANAGEMENT GATEWAYS
    // ==========================================

    /**
     * Admin Endpoint
     * Returns aggregated user counts by role.
     *
     * GET /admin/users/counts
     */
    router.get(
        '/admin/users/counts',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminUserController.getUserCounts)
    );

    /**
     * Admin Endpoint
     * Lists users with optional role filter, search, pagination, sorting.
     *
     * GET /admin/users?role=&page=&limit=&search=&sortBy=&sortOrder=
     */
    router.get(
        '/admin/users',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminUserController.listUsers)
    );

    /**
     * Admin Endpoint
     * Returns full details for a single user or seller by ID.
     *
     * GET /admin/users/:id
     */
    router.get(
        '/admin/users/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminUserController.getUserById)
    );

    /**
     * Admin Endpoint
     * Updates a seller's account status (ACTIVE, SUSPENDED, BANNED, PENDING_VERIFICATION).
     *
     * PATCH /admin/users/:id/seller-status   { status: "ACTIVE" }
     */
    router.patch(
        '/admin/users/:id/seller-status',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminUserController.updateSellerAccountStatus)
    );

    return Object.freeze(router);
};
