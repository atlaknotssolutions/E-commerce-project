/**
 * Pure function-based factory representing the Admin Coupon HTTP API Controllers.
 * Thin controllers — delegates all business logic to the service layer.
 */
export const createAdminCouponController = ({ adminCouponService }) =>
{
    /**
     * Lists all coupons with search, filters, and pagination.
     * GET /admin/coupons
     */
    const listCoupons = async (req, res) =>
    {
        const { page, limit, search, isActive, discountType, ownerType, scope, targetType, sortBy, sortOrder } = req.query;

        const result = await adminCouponService.getAllCoupons({
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
            search: search || null,
            isActive: isActive !== undefined && isActive !== '' ? isActive : null,
            discountType: discountType || null,
            ownerType: ownerType || null,
            scope: scope || null,
            targetType: targetType || null,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc',
        });

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    };

    /**
     * Returns full details for a single coupon.
     * GET /admin/coupons/:id
     */
    const getCoupon = async (req, res) =>
    {
        const { id } = req.params;
        const coupon = await adminCouponService.getCouponById(id);
        res.status(200).json({ success: true, data: coupon });
    };

    /**
     * Creates a new coupon.
     * POST /admin/coupons
     */
    const createCoupon = async (req, res) =>
    {
        const coupon = await adminCouponService.createCoupon(req.body);
        res.status(201).json({ success: true, data: coupon });
    };

    /**
     * Updates an existing coupon.
     * PATCH /admin/coupons/:id
     */
    const updateCoupon = async (req, res) =>
    {
        const { id } = req.params;
        const coupon = await adminCouponService.updateCoupon(id, req.body);
        res.status(200).json({ success: true, data: coupon });
    };

    /**
     * Deletes a coupon.
     * DELETE /admin/coupons/:id
     */
    const deleteCoupon = async (req, res) =>
    {
        const { id } = req.params;
        const result = await adminCouponService.deleteCoupon(id);
        res.status(200).json({ success: true, data: result });
    };

    /**
     * Enables a coupon.
     * PATCH /admin/coupons/:id/enable
     */
    const enableCoupon = async (req, res) =>
    {
        const { id } = req.params;
        const coupon = await adminCouponService.enableCoupon(id);
        res.status(200).json({ success: true, data: coupon });
    };

    /**
     * Disables a coupon.
     * PATCH /admin/coupons/:id/disable
     */
    const disableCoupon = async (req, res) =>
    {
        const { id } = req.params;
        const coupon = await adminCouponService.disableCoupon(id);
        res.status(200).json({ success: true, data: coupon });
    };

    /**
     * Returns coupon statistics for the admin dashboard.
     * GET /admin/coupons/statistics
     */
    const getStatistics = async (req, res) =>
    {
        const stats = await adminCouponService.getCouponStatistics();
        res.status(200).json({ success: true, data: stats });
    };

    /**
     * Lists coupons belonging to the authenticated seller.
     * GET /seller/coupons
     */
    const listSellerCoupons = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { page, limit, search, isActive, scope, targetType } = req.query;

        const result = await adminCouponService.getSellerCoupons({
            sellerId,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
            search: search || null,
            isActive: isActive !== undefined && isActive !== '' ? isActive : null,
            scope: scope || null,
            targetType: targetType || null,
        });

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    };

    /**
     * Seller creates a new coupon (ownerType forced to SELLER).
     * POST /seller/coupons
     */
    const createSellerCoupon = async (req, res) =>
    {
        const sellerId = req.user.id;
        const coupon = await adminCouponService.createSellerCoupon(sellerId, req.body);
        res.status(201).json({ success: true, data: coupon });
    };

    /**
     * Seller updates their own coupon.
     * PATCH /seller/coupons/:id
     */
    const updateSellerCoupon = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { id } = req.params;
        const coupon = await adminCouponService.updateSellerCoupon(sellerId, id, req.body);
        res.status(200).json({ success: true, data: coupon });
    };

    /**
     * Seller deletes their own coupon.
     * DELETE /seller/coupons/:id
     */
    const deleteSellerCoupon = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { id } = req.params;
        const result = await adminCouponService.deleteSellerCoupon(sellerId, id);
        res.status(200).json({ success: true, data: result });
    };

    /**
     * Seller enables their own coupon.
     * PATCH /seller/coupons/:id/enable
     */
    const enableSellerCoupon = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { id } = req.params;
        const coupon = await adminCouponService.enableSellerCoupon(sellerId, id);
        res.status(200).json({ success: true, data: coupon });
    };

    /**
     * Seller disables their own coupon.
     * PATCH /seller/coupons/:id/disable
     */
    const disableSellerCoupon = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { id } = req.params;
        const coupon = await adminCouponService.disableSellerCoupon(sellerId, id);
        res.status(200).json({ success: true, data: coupon });
    };

    /**
     * Returns usage details for a specific coupon.
     * GET /admin/coupons/:id/usage
     */
    const getUsage = async (req, res) =>
    {
        const { id } = req.params;
        const usage = await adminCouponService.getCouponUsage(id);
        res.status(200).json({ success: true, data: usage });
    };

    return Object.freeze({
        listCoupons,
        getCoupon,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        enableCoupon,
        disableCoupon,
        getStatistics,
        getUsage,
        listSellerCoupons,
        createSellerCoupon,
        updateSellerCoupon,
        deleteSellerCoupon,
        enableSellerCoupon,
        disableSellerCoupon,
    });
};
