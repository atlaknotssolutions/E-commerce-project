export const createCustomerMetricRepository = ({ CustomerMetric }) =>
{
    const findByUserId = async (userId, options = {}) =>
    {
        return CustomerMetric.findOne({ userId }, null, options).lean();
    };

    const upsertMetrics = async (userId, metrics) =>
    {
        return CustomerMetric.findOneAndUpdate(
            { userId },
            {
                $set: {
                    userId,
                    totalOrders: metrics.totalOrders,
                    lifetimeSpend: metrics.lifetimeSpend,
                    averageOrderValue: metrics.averageOrderValue || 0,
                    lastOrderDate: metrics.lastOrderDate,
                    firstOrderDate: metrics.firstOrderDate,
                    daysSinceLastOrder: metrics.daysSinceLastOrder || 0,
                    computedAt: new Date(),
                },
            },
            { upsert: true, new: true, lean: true }
        );
    };

    const updateSegment = async (userId, segment, segments) =>
    {
        return CustomerMetric.findOneAndUpdate(
            { userId },
            { $set: { segment, segments, computedAt: new Date() } },
            { new: true, lean: true }
        );
    };

    const findTopPercentile = async (percentile) =>
    {
        const total = await CustomerMetric.countDocuments({ totalOrders: { $gt: 0 } });
        const topN = Math.max(1, Math.ceil((total * percentile) / 100));
        return CustomerMetric.find({ totalOrders: { $gt: 0 } })
            .sort({ lifetimeSpend: -1 })
            .limit(topN)
            .select('userId lifetimeSpend totalOrders')
            .lean();
    };

    const countBySegment = async () =>
    {
        return CustomerMetric.aggregate([
            { $group: { _id: '$segment', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
    };

    return Object.freeze({
        findByUserId,
        upsertMetrics,
        updateSegment,
        findTopPercentile,
        countBySegment,
    });
};
