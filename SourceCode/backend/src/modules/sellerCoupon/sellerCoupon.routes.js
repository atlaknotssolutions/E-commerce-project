export const createSellerCouponRoutes = ({
    router,
    sellerCouponController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    router.get(
        '/seller/coupons',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerCouponController.listCoupons)
    );

    router.post(
        '/seller/coupons',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerCouponController.createCoupon)
    );

    router.patch(
        '/seller/coupons/:id',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerCouponController.updateCoupon)
    );

    router.delete(
        '/seller/coupons/:id',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerCouponController.deleteCoupon)
    );

    router.patch(
        '/seller/coupons/:id/enable',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerCouponController.enableCoupon)
    );

    router.patch(
        '/seller/coupons/:id/disable',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerCouponController.disableCoupon)
    );

    return Object.freeze(router);
};
