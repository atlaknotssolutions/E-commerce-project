export const createSellerSegmentController = ({ sellerSegmentService }) =>
{
    const getMySegment = async (req, res) =>
    {
        const sellerId = req.seller.id;
        const result = await sellerSegmentService.getSellerSegment(sellerId);
        res.status(200).json({ success: true, data: result });
    };

    const refreshMySegment = async (req, res) =>
    {
        const sellerId = req.seller.id;
        const metric = await sellerSegmentService.refreshMetrics(sellerId);
        const topRevenueIds = await sellerSegmentService.getTopRevenueSellerIds(10);
        const topCompositeIds = await sellerSegmentService.getTopCompositeSellerIds(15);
        const { primary } = sellerSegmentService.evaluateSegments(metric, topRevenueIds, topCompositeIds);

        res.status(200).json({
            success: true,
            data: { segment: primary, refreshedAt: new Date() },
        });
    };

    const getSegmentDistribution = async (req, res) =>
    {
        const { sellerMetricRepository } = req.app.locals;
        const distribution = await sellerMetricRepository.countBySegment();
        res.status(200).json({ success: true, data: distribution });
    };

    const getSellerSegmentAdmin = async (req, res) =>
    {
        const { sellerId } = req.params;
        const result = await sellerSegmentService.getSellerSegment(sellerId);
        res.status(200).json({ success: true, data: result });
    };

    return Object.freeze({
        getMySegment,
        refreshMySegment,
        getSegmentDistribution,
        getSellerSegmentAdmin,
    });
};
