export const createBrandRequestRoutes = ({
    router,
    brandRequestController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    // ==========================================
    // SELLER ENDPOINTS
    // ==========================================

    /**
     * POST /seller/brand-requests
     * Seller submits a new brand request.
     */
    router.post(
        '/seller/brand-requests',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(brandRequestController.createRequest)
    );

    /**
     * GET /seller/brand-requests
     * Seller views their own requests.
     */
    router.get(
        '/seller/brand-requests',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(brandRequestController.getMyRequests)
    );

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * GET /admin/brand-requests
     * Admin lists all brand requests (optional status/search filters).
     */
    router.get(
        '/admin/brand-requests',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(brandRequestController.getAllRequests)
    );

    /**
     * GET /admin/brand-requests/pending-count
     * Admin gets count of pending brand requests.
     */
    router.get(
        '/admin/brand-requests/pending-count',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(brandRequestController.countPendingRequests)
    );

    /**
     * GET /admin/brand-requests/:id
     * Admin views a single request.
     */
    router.get(
        '/admin/brand-requests/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(brandRequestController.getRequestById)
    );

    /**
     * PATCH /admin/brand-requests/:id/approve
     * Admin approves a request -- creates the brand automatically.
     */
    router.patch(
        '/admin/brand-requests/:id/approve',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(brandRequestController.approveRequest)
    );

    /**
     * PATCH /admin/brand-requests/:id/reject
     * Admin rejects a request with a reason.
     */
    router.patch(
        '/admin/brand-requests/:id/reject',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(brandRequestController.rejectRequest)
    );

    return router;
};
