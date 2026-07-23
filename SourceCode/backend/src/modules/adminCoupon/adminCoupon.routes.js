/**
 * Pure function-based routing factory representing the Admin Coupon API gateways.
 * Binds admin coupon paths under strict admin authorization guards.
 *
 * IMPORTANT: /statistics and /:id routes are ordered to avoid param capture.
 */
export const createAdminCouponRoutes = ({
    router,
    adminCouponController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    // ==========================================
    // SECURED ADMIN COUPON GATEWAYS
    // ==========================================

    /**
     * Admin Endpoint
     * Returns coupon statistics for the dashboard.
     *
     * GET /admin/coupons/statistics
     */
    router.get(
        '/admin/coupons/statistics',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminCouponController.getStatistics)
    );

    /**
     * Admin Endpoint
     * Lists all coupons with search, filters, and pagination.
     *
     * GET /admin/coupons?page=&limit=&search=&isActive=&discountType=&sortBy=&sortOrder=
     */
    router.get(
        '/admin/coupons',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminCouponController.listCoupons)
    );

    /**
     * Admin Endpoint
     * Returns full details for a single coupon.
     *
     * GET /admin/coupons/:id
     */
    router.get(
        '/admin/coupons/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminCouponController.getCoupon)
    );

    /**
     * Admin Endpoint
     * Creates a new coupon. Body: { code, description, discountType, ... }
     *
     * POST /admin/coupons
     */
    router.post(
        '/admin/coupons',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminCouponController.createCoupon)
    );

    /**
     * Admin Endpoint
     * Updates an existing coupon. Body: { ...fieldsToUpdate }
     *
     * PATCH /admin/coupons/:id
     */
    router.patch(
        '/admin/coupons/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminCouponController.updateCoupon)
    );

    /**
     * Admin Endpoint
     * Deletes a coupon.
     *
     * DELETE /admin/coupons/:id
     */
    router.delete(
        '/admin/coupons/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminCouponController.deleteCoupon)
    );

    /**
     * Admin Endpoint
     * Enables a coupon (sets isActive to true).
     *
     * PATCH /admin/coupons/:id/enable
     */
    router.patch(
        '/admin/coupons/:id/enable',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminCouponController.enableCoupon)
    );

    /**
     * Admin Endpoint
     * Disables a coupon (sets isActive to false).
     *
     * PATCH /admin/coupons/:id/disable
     */
    router.patch(
        '/admin/coupons/:id/disable',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminCouponController.disableCoupon)
    );

    /**
     * Admin Endpoint
     * Returns usage details for a specific coupon.
     *
     * GET /admin/coupons/:id/usage
     */
    router.get(
        '/admin/coupons/:id/usage',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(adminCouponController.getUsage)
    );

    return Object.freeze(router);
};
