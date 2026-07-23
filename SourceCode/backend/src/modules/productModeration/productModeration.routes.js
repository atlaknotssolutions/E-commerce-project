/**
 * Pure function-based routing factory representing the Product Moderation API gateways.
 * Binds product moderation paths under strict admin authorization guards.
 *
 * IMPORTANT: /stats route MUST be defined before /:productId to avoid param capture.
 */
export const createProductModerationRoutes = ({
    router,
    productModerationController,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) =>
{
    // ==========================================
    // SECURED PRODUCT MODERATION GATEWAYS
    // ==========================================

    /**
     * Admin Endpoint
     * Returns aggregated product moderation statistics.
     *
     * GET /admin/products/stats
     */
    router.get(
        '/admin/products/stats',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.getStats)
    );

    /**
     * Admin Endpoint
     * Lists all products with optional filters.
     *
     * GET /admin/products/all?page=&limit=&search=&approvalStatus=&publishStatus=
     */
    router.get(
        '/admin/products/all',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.listAll)
    );

    /**
     * Admin Endpoint
     * Lists products pending approval.
     *
     * GET /admin/products/pending?page=&limit=&search=
     */
    router.get(
        '/admin/products/pending',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.listPending)
    );

    /**
     * Admin Endpoint
     * Lists approved products.
     *
     * GET /admin/products/approved?page=&limit=&search=
     */
    router.get(
        '/admin/products/approved',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.listApproved)
    );

    /**
     * Admin Endpoint
     * Lists rejected products.
     *
     * GET /admin/products/rejected?page=&limit=&search=
     */
    router.get(
        '/admin/products/rejected',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.listRejected)
    );

    /**
     * Admin Endpoint
     * Lists published products.
     *
     * GET /admin/products/published?page=&limit=&search=
     */
    router.get(
        '/admin/products/published',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.listPublished)
    );

    /**
     * Admin Endpoint
     * Lists unpublished products.
     *
     * GET /admin/products/unpublished?page=&limit=&search=
     */
    router.get(
        '/admin/products/unpublished',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.listUnpublished)
    );

    /**
     * Admin Endpoint
     * Lists featured products.
     *
     * GET /admin/products/featured?page=&limit=&search=
     */
    router.get(
        '/admin/products/featured',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.listFeatured)
    );

    /**
     * Admin Endpoint
     * Returns full details for a single product.
     *
     * GET /admin/products/:productId
     */
    router.get(
        '/admin/products/:productId',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.getProductDetails)
    );

    /**
     * Admin Endpoint
     * Approves a pending product.
     *
     * PATCH /admin/products/:productId/approve
     */
    router.patch(
        '/admin/products/:productId/approve',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.approveProduct)
    );

    /**
     * Admin Endpoint
     * Rejects a pending product. Reason required in body.
     *
     * PATCH /admin/products/:productId/reject
     */
    router.patch(
        '/admin/products/:productId/reject',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.rejectProduct)
    );

    /**
     * Admin Endpoint
     * Publishes an approved product.
     *
     * PATCH /admin/products/:productId/publish
     */
    router.patch(
        '/admin/products/:productId/publish',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.publishProduct)
    );

    /**
     * Admin Endpoint
     * Unpublishes a published product.
     *
     * PATCH /admin/products/:productId/unpublish
     */
    router.patch(
        '/admin/products/:productId/unpublish',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.unpublishProduct)
    );

    /**
     * Admin Endpoint
     * Features a published product.
     *
     * PATCH /admin/products/:productId/feature
     */
    router.patch(
        '/admin/products/:productId/feature',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.featureProduct)
    );

    /**
     * Admin Endpoint
     * Unfeatures a featured product.
     *
     * PATCH /admin/products/:productId/unfeature
     */
    router.patch(
        '/admin/products/:productId/unfeature',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.unfeatureProduct)
    );

    /**
     * Admin Endpoint
     * Soft-deletes a product. Reason required in body.
     *
     * DELETE /admin/products/:productId
     */
    router.delete(
        '/admin/products/:productId',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(productModerationController.deleteProduct)
    );

    return Object.freeze(router);
};
