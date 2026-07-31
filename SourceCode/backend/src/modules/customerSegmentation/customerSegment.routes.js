export const createCustomerSegmentRoutes = ({
    router,
    customerSegmentController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    // ==========================================
    // CUSTOMER SEGMENT GATEWAYS
    // ==========================================

    /**
     * Customer Endpoint
     * Returns the current segment for the authenticated customer.
     *
     * GET /customer/segment
     */
    router.get(
        '/customer/segment',
        authenticate,
        authorizeRoles('ROLE_CUSTOMER'),
        asyncHandler(customerSegmentController.getMySegment)
    );

    /**
     * Customer Endpoint
     * Refreshes metrics and reassigns segment.
     *
     * POST /customer/segment/refresh
     */
    router.post(
        '/customer/segment/refresh',
        authenticate,
        authorizeRoles('ROLE_CUSTOMER'),
        asyncHandler(customerSegmentController.refreshMySegment)
    );

    // ==========================================
    // ADMIN SEGMENT GATEWAYS
    // ==========================================

    /**
     * Admin Endpoint
     * Returns segment distribution across all customers.
     *
     * GET /admin/segments/distribution
     */
    router.get(
        '/admin/segments/distribution',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(customerSegmentController.getSegmentDistribution)
    );

    /**
     * Admin Endpoint
     * Returns segment for a specific user.
     *
     * GET /admin/users/:userId/segment
     */
    router.get(
        '/admin/users/:userId/segment',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(customerSegmentController.getUserSegmentAdmin)
    );

    return Object.freeze(router);
};
