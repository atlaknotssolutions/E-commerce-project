export const createSellerCouponController = ({ sellerCouponService }) =>
{
    const listCoupons = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { page, limit, search, isActive, scope, targetType } = req.query;

        const result = await sellerCouponService.getCoupons({
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

    const createCoupon = async (req, res) =>
    {
        const sellerId = req.user.id;
        const coupon = await sellerCouponService.createCoupon(sellerId, req.body);
        res.status(201).json({ success: true, data: coupon });
    };

    const updateCoupon = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { id } = req.params;
        const coupon = await sellerCouponService.updateCoupon(sellerId, id, req.body);
        res.status(200).json({ success: true, data: coupon });
    };

    const deleteCoupon = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { id } = req.params;
        const result = await sellerCouponService.deleteCoupon(sellerId, id);
        res.status(200).json({ success: true, data: result });
    };

    const enableCoupon = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { id } = req.params;
        const coupon = await sellerCouponService.enableCoupon(sellerId, id);
        res.status(200).json({ success: true, data: coupon });
    };

    const disableCoupon = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { id } = req.params;
        const coupon = await sellerCouponService.disableCoupon(sellerId, id);
        res.status(200).json({ success: true, data: coupon });
    };

    return Object.freeze({
        listCoupons,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        enableCoupon,
        disableCoupon,
    });
};
