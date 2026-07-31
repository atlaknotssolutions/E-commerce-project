export const createSellerSegmentRoutes = ({
    router,
    sellerSegmentController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    router.get(
        '/seller/segment',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerSegmentController.getMySegment)
    );

    router.post(
        '/seller/segment/refresh',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(sellerSegmentController.refreshMySegment)
    );

    router.get(
        '/admin/sellers/segments/distribution',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerSegmentController.getSegmentDistribution)
    );

    router.get(
        '/admin/sellers/:sellerId/segment',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(sellerSegmentController.getSellerSegmentAdmin)
    );

    return Object.freeze(router);
};
