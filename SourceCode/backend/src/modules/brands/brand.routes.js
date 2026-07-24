export const createBrandRoutes = ({
    router,
    controller,
    authenticate,
    authorizeRoles,
    upload,
    asyncHandler,
}) =>
{
    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    /**
     * GET /api/brands/active
     * Public: Get active brands (for product filters, seller brand selection).
     */
    router.get(
        '/api/brands/active',
        asyncHandler(controller.getActiveBrands)
    );

    /**
     * GET /api/brands/featured
     * Public: Get featured brands (for homepage/carousel).
     */
    router.get(
        '/api/brands/featured',
        asyncHandler(controller.getFeaturedBrands)
    );

    /**
     * GET /api/brands/search
     * Public: Full-text brand search.
     */
    router.get(
        '/api/brands/search',
        asyncHandler(controller.searchBrands)
    );

    /**
     * GET /api/brands/slug/:slug
     * Public: Get brand by slug (for brand detail page).
     */
    router.get(
        '/api/brands/slug/:slug',
        asyncHandler(controller.getBrandBySlug)
    );

    /**
     * GET /api/brands/:id
     * Public: Get brand by ID.
     */
    router.get(
        '/api/brands/:id',
        asyncHandler(controller.getBrandById)
    );

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * POST /api/brands
     * Admin: Create a new brand (with optional logo and banner images).
     */
    router.post(
        '/api/brands',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        upload.fields([
            { name: 'logo', maxCount: 1 },
            { name: 'bannerImage', maxCount: 1 },
        ]),
        asyncHandler(controller.createBrand)
    );

    /**
     * GET /api/brands
     * Admin: List all brands (with filters).
     */
    router.get(
        '/api/brands',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getAllBrands)
    );

    /**
     * PUT /api/brands/:id
     * Admin: Update brand details (with optional logo and banner images).
     */
    router.put(
        '/api/brands/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        upload.fields([
            { name: 'logo', maxCount: 1 },
            { name: 'bannerImage', maxCount: 1 },
        ]),
        asyncHandler(controller.updateBrand)
    );

    /**
     * PATCH /api/brands/:id/status
     * Admin: Toggle brand active status.
     */
    router.patch(
        '/api/brands/:id/status',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateBrandStatus)
    );

    /**
     * PATCH /api/brands/:id/featured
     * Admin: Toggle brand featured status.
     */
    router.patch(
        '/api/brands/:id/featured',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateBrandFeatured)
    );

    /**
     * PATCH /api/brands/:id/display-order
     * Admin: Update brand display order.
     */
    router.patch(
        '/api/brands/:id/display-order',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateDisplayOrder)
    );

    /**
     * DELETE /api/brands/:id
     * Admin: Soft delete brand.
     */
    router.delete(
        '/api/brands/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.softDeleteBrand)
    );

    /**
     * PATCH /api/brands/:id/restore
     * Admin: Restore soft-deleted brand.
     */
    router.patch(
        '/api/brands/:id/restore',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.restoreBrand)
    );

    /**
     * DELETE /api/brands/:id/hard
     * Admin: Permanently delete brand.
     */
    router.delete(
        '/api/brands/:id/hard',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.hardDeleteBrand)
    );

    /**
     * GET /api/brands/admin/stats
     * Admin: Get brand statistics.
     */
    router.get(
        '/api/brands/admin/stats',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getBrandStats)
    );

    return Object.freeze(router);
};
