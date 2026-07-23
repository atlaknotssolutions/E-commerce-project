/**
 * Pure function-based routing factory representing the Seller Verification API gateways.
 * Binds verification management paths under strict admin authorization guards.
 *
 * IMPORTANT: /stats route MUST be defined before /:sellerId to avoid param capture.
 */
export const createSellerVerificationRoutes = ({
    router,
    sellerVerificationController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    // ==========================================
    // SECURED SELLER VERIFICATION GATEWAYS
    // ==========================================

    /**
     * Admin Endpoint
     * Returns aggregated seller verification statistics.
     *
     * GET /admin/sellers/stats
     */
    router.get(
        '/admin/sellers/stats',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerVerificationController.getStats)
    );

    /**
     * Admin Endpoint
     * Lists sellers pending verification.
     *
     * GET /admin/sellers/pending?page=&limit=&search=&sortBy=&sortOrder=
     */
    router.get(
        '/admin/sellers/pending',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerVerificationController.listPending)
    );

    /**
     * Admin Endpoint
     * Lists approved sellers.
     *
     * GET /admin/sellers/approved
     */
    router.get(
        '/admin/sellers/approved',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerVerificationController.listApproved)
    );

    /**
     * Admin Endpoint
     * Lists rejected sellers.
     *
     * GET /admin/sellers/rejected
     */
    router.get(
        '/admin/sellers/rejected',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerVerificationController.listRejected)
    );

    /**
     * Admin Endpoint
     * Lists suspended sellers.
     *
     * GET /admin/sellers/suspended
     */
    router.get(
        '/admin/sellers/suspended',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerVerificationController.listSuspended)
    );

    /**
     * Admin Endpoint
     * Returns full details for a single seller.
     *
     * GET /admin/sellers/:sellerId
     */
    router.get(
        '/admin/sellers/:sellerId',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerVerificationController.getSellerDetails)
    );

    /**
     * Admin Endpoint
     * Approves a pending seller. Optional note in body.
     *
     * PATCH /admin/sellers/:sellerId/approve
     */
    router.patch(
        '/admin/sellers/:sellerId/approve',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerVerificationController.approveSeller)
    );

    /**
     * Admin Endpoint
     * Rejects a pending seller. Reason required in body.
     *
     * PATCH /admin/sellers/:sellerId/reject
     */
    router.patch(
        '/admin/sellers/:sellerId/reject',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerVerificationController.rejectSeller)
    );

    /**
     * Admin Endpoint
     * Suspends an active seller. Reason required in body.
     *
     * PATCH /admin/sellers/:sellerId/suspend
     */
    router.patch(
        '/admin/sellers/:sellerId/suspend',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerVerificationController.suspendSeller)
    );

    /**
     * Admin Endpoint
     * Restores a suspended seller.
     *
     * PATCH /admin/sellers/:sellerId/restore
     */
    router.patch(
        '/admin/sellers/:sellerId/restore',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerVerificationController.restoreSeller)
    );

    return Object.freeze(router);
};
