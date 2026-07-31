export const createSellerMetricRepository = ({ SellerMetric }) =>
{
    const findBySellerId = async (sellerId, options = {}) =>
    {
        return SellerMetric.findOne({ sellerId }, null, options).lean();
    };

    const upsertMetrics = async (sellerId, metrics) =>
    {
        return SellerMetric.findOneAndUpdate(
            { sellerId },
            {
                $set: {
                    sellerId,
                    totalOrders: metrics.totalOrders,
                    totalRevenue: Math.round(metrics.totalRevenue),
                    averageOrderValue: Math.round(metrics.averageOrderValue || 0),
                    averageRating: metrics.averageRating || 0,
                    reviewCount: metrics.reviewCount || 0,
                    returnCount: metrics.returnCount || 0,
                    returnRate: metrics.returnRate || 0,
                    cancellationCount: metrics.cancellationCount || 0,
                    cancellationRate: metrics.cancellationRate || 0,
                    fulfillmentRate: metrics.fulfillmentRate || 0,
                    revenueGrowth: metrics.revenueGrowth || 0,
                    orderGrowth: metrics.orderGrowth || 0,
                    lastOrderDate: metrics.lastOrderDate,
                    daysSinceLastOrder: metrics.daysSinceLastOrder || 0,
                    daysSinceRegistration: metrics.daysSinceRegistration || 0,
                    computedAt: new Date(),
                },
            },
            { upsert: true, new: true, lean: true }
        );
    };

    const updateSegment = async (sellerId, segment, segments) =>
    {
        return SellerMetric.findOneAndUpdate(
            { sellerId },
            { $set: { segment, segments, computedAt: new Date() } },
            { new: true, lean: true }
        );
    };

    const findTopByRevenue = async (percentile) =>
    {
        const total = await SellerMetric.countDocuments({ totalOrders: { $gt: 0 } });
        const topN = Math.max(1, Math.ceil((total * percentile) / 100));
        return SellerMetric.find({ totalOrders: { $gt: 0 } })
            .sort({ totalRevenue: -1 })
            .limit(topN)
            .select('sellerId totalRevenue totalOrders')
            .lean();
    };

    const findTopByCompositeScore = async (percentile) =>
    {
        const total = await SellerMetric.countDocuments({ totalOrders: { $gt: 0 } });
        const topN = Math.max(1, Math.ceil((total * percentile) / 100));
        return SellerMetric.find({ totalOrders: { $gt: 0 } })
            .sort({ totalRevenue: -1, averageRating: -1, fulfillmentRate: -1 })
            .limit(topN)
            .select('sellerId totalRevenue averageRating fulfillmentRate')
            .lean();
    };

    const countBySegment = async () =>
    {
        return SellerMetric.aggregate([
            { $group: { _id: '$segment', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
    };

    return Object.freeze({
        findBySellerId,
        upsertMetrics,
        updateSegment,
        findTopByRevenue,
        findTopByCompositeScore,
        countBySegment,
    });
};
