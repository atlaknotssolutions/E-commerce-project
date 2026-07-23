/**
 * Pure function-based routing factory representing Homepage APIs.
 *
 * Public:
 *   - Homepage data
 *
 * Admin:
 *   - Home Category CRUD
 *
 * Legacy:
 *   - Backward compatibility for existing frontend.
 *   - Remove after frontend migration.
 */
export const createHomeRoutes = ({
    router,
    homeController,
    homeCategoryController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    // ==================================================
    // PUBLIC ENDPOINTS
    // ==================================================

    /**
     * Retrieves complete homepage merchandising payload.
     *
     * GET /home-page
     */
    router.get(
        "/home-page",
        asyncHandler(homeController.getHomePageData)
    );

    // ==================================================
    // ADMIN HOME CATEGORY MANAGEMENT (Enterprise APIs)
    // ==================================================

    /**
     * Creates a single Home Category.
     *
     * POST /admin/home-categories
     */
    router.post(
        "/admin/home-categories",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.createHomeCategory)
    );

    /**
     * Creates multiple Home Categories.
     *
     * POST /admin/home-categories/bulk
     */
    router.post(
        "/admin/home-categories/bulk",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.createHomeCategories)
    );

    /**
     * Retrieves all Home Categories.
     *
     * GET /admin/home-categories
     */
    router.get(
        "/admin/home-categories",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.getAllHomeCategories)
    );

    /**
     * Reorder Home Categories.
     *
     * PATCH /admin/home-categories/reorder
     * MUST be registered before /:id routes to prevent "reorder" being caught as :id.
     */
    router.patch(
        "/admin/home-categories/reorder",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.reorderHomeCategories)
    );

    /**
     * Retrieves Home Category by id.
     *
     * GET /admin/home-categories/:id
     */
    router.get(
        "/admin/home-categories/:id",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.getHomeCategoryById)
    );

    /**
     * Updates Home Category.
     *
     * PATCH /admin/home-categories/:id
     */
    router.patch(
        "/admin/home-categories/:id",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.updateHomeCategory)
    );

    /**
     * Deletes Home Category.
     *
     * DELETE /admin/home-categories/:id
     */
    router.delete(
        "/admin/home-categories/:id",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.deleteHomeCategory)
    );

    // ==================================================
    // LEGACY FRONTEND COMPATIBILITY
    // Remove after React frontend migration.
    // ==================================================

    /**
     * @deprecated
     * Legacy bulk create endpoint.
     *
     * Frontend:
     * POST /home/categories
     *
     * Enterprise replacement:
     * POST /admin/home-categories/bulk
     */
    router.post(
        "/home/categories",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.createHomeCategories)
    );

    /**
     * @deprecated
     * Legacy list endpoint.
     *
     * Frontend:
     * GET /admin/home-category
     *
     * Enterprise replacement:
     * GET /admin/home-categories
     */
    router.get(
        "/admin/home-category",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.getAllHomeCategories)
    );

    /**
     * @deprecated
     * Legacy update endpoint.
     *
     * Frontend:
     * PATCH /admin/home-category/:id
     *
     * Enterprise replacement:
     * PATCH /admin/home-categories/:id
     */
    router.patch(
        "/admin/home-category/:id",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.updateHomeCategory)
    );


    router.patch(
        "/admin/home-categories/:id/status",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.updateCategoryStatus)
    );

    router.patch(
        "/admin/home-category/:id/status",
        authenticate,
        authorizeRoles("ROLE_ADMIN"),
        asyncHandler(homeCategoryController.updateCategoryStatus)
    );

    return Object.freeze(router);
};




// /**
//  * Pure function-based routing factory representing the Homepage Merchandising API gateways.
//  * Binds public landing paths openly and locks administrative controllers under strict guards.
//  */
// export const createHomeRoutes = ({
//     router,
//     homeController,
//     authenticate,
//     authorizeRoles,
//     asyncHandler
// }) =>
// {

//     // ==========================================
//     // PUBLIC CAMPAIGNS GATEWAYS (Unrestricted Paths)
//     // ==========================================

//     // Public Endpoint: Pull unified homepage landing page metadata payload (newest first)
//     router.get(
//         '/home-page',
//         asyncHandler(homeController.getHomePageData)
//     );

//     // =======================================================
//     // SECURED ADMINISTRATIVE CAMPAIGNS GATEWAYS (Admin Locks)
//     // =======================================================

//     // Admin Endpoint: Onboard a list of home categories merchandising banners (Requires Admin Privileges)
//     router.post(
//         '/home/categories',
//         authenticate,
//         authorizeRoles('ROLE_ADMIN'),
//         asyncHandler(homeController.createHomeCategories)
//     );

//     // Admin Endpoint: Pull complete list of registered HomeCategory layout documents
//     router.get(
//         '/admin/home-category',
//         authenticate,
//         authorizeRoles('ROLE_ADMIN'),
//         asyncHandler(homeController.listHomeCategories)
//     );

//     // Admin Endpoint: Modify an existing homepage category document image or categoryTarget
//     router.patch(
//         '/admin/home-category/:id',
//         authenticate,
//         authorizeRoles('ROLE_ADMIN'),
//         asyncHandler(homeController.updateHomeCategory)
//     );

//     return router;
// };