/**
 * Pure function-based routing factory representing the Administrative API gateways.
 * Binds admin paths directly to authenticators and RBAC filters using dependency injection.
 */
export const createAdminRoutes = ({
    router,
    adminController,
    categoryController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    // ==========================================
    // SECURED ADMINISTRATIVE GATEWAYS (/admin/*)
    // ==========================================

    /**
     * Admin Endpoint
     * Returns the authenticated admin's own account profile.
     *
     * GET /admin/account
     */
    router.get(
        '/admin/account',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminController.getProfile)
    );

    /**
     * Admin Endpoint
     * Updates seller account operational status.
     *
     * PATCH /admin/seller/:id/status/:status
     */
    router.patch(
        '/admin/seller/:id/status/:status',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminController.updateSellerStatus)
    );

    // ==========================================
    // ADMIN CATEGORY MANAGEMENT
    // ==========================================

    /**
     * GET /admin/categories
     * Returns all categories (flat list).
     */
    router.get(
        '/admin/categories',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(categoryController.getAllCategories)
    );

    /**
     * GET /admin/categories/:id
     * Returns a single category by ID.
     */
    router.get(
        '/admin/categories/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(categoryController.getCategoryById)
    );

    /**
     * POST /admin/categories
     * Creates a new category.
     */
    router.post(
        '/admin/categories',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(categoryController.createCategory)
    );

    /**
     * PATCH /admin/categories/:id
     * Updates an existing category.
     */
    router.patch(
        '/admin/categories/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(categoryController.updateCategory)
    );

    /**
     * DELETE /admin/categories/:id
     * Deletes a category (only if no children or products).
     */
    router.delete(
        '/admin/categories/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(categoryController.deleteCategory)
    );

    return Object.freeze(router);
};
