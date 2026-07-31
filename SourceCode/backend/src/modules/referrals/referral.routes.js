export const createReferralRoutes = ({ router, controller, authenticate, asyncHandler }) =>
{
    router.post('/api/referrals/apply-code', authenticate, asyncHandler(controller.applyReferralCode));
    router.get('/api/referrals/my-code', authenticate, asyncHandler(controller.getMyReferralCode));

    return router;
};
