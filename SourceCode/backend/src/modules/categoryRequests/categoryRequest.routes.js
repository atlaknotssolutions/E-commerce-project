export const createCategoryRequestRoutes = ({
    router,
    categoryRequestController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) => {
    // ==========================================
    // SELLER ENDPOINTS
    // ==========================================

    /**
     * POST /seller/category-requests
     * Seller submits a new category request.
     */
    router.post(
        '/seller/category-requests',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(categoryRequestController.createRequest)
    );

    /**
     * GET /seller/category-requests
     * Seller views their own requests.
     */
    router.get(
        '/seller/category-requests',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(categoryRequestController.getMyRequests)
    );

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * GET /admin/category-requests
     * Admin lists all category requests (optional status/search filters).
     */
    router.get(
        '/admin/category-requests',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(categoryRequestController.getAllRequests)
    );

    /**
     * GET /admin/category-requests/:id
     * Admin views a single request.
     */
    router.get(
        '/admin/category-requests/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(categoryRequestController.getRequestById)
    );

    /**
     * PATCH /admin/category-requests/:id/approve
     * Admin approves a request — creates the category automatically.
     */
    router.patch(
        '/admin/category-requests/:id/approve',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(categoryRequestController.approveRequest)
    );

    /**
     * PATCH /admin/category-requests/:id/reject
     * Admin rejects a request with a reason.
     */
    router.patch(
        '/admin/category-requests/:id/reject',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(categoryRequestController.rejectRequest)
    );

    return router;
};
