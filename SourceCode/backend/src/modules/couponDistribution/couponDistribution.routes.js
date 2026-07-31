export const createCouponDistributionRoutes = ({ router, controller, authenticate, asyncHandler }) =>
{
    router.get('/api/customer/wallet/coupons', authenticate, asyncHandler(controller.getWallet));
    router.post('/api/customer/wallet/coupons/:id/claim', authenticate, asyncHandler(controller.claimCoupon));

    return router;
};
