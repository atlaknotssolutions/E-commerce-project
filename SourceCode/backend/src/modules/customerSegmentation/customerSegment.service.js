import { SEGMENT_RULES } from './segmentRule.config.js';

export const createCustomerSegmentService = ({
    customerMetricRepository,
    orderModel,
    createApiError,
}) =>
{
    /**
     * Computes and upserts CustomerMetric for a given user.
     * Runs a single aggregation pipeline over the Order collection.
     */
    const refreshMetrics = async (userId) =>
    {
        const stats = await orderModel.aggregate([
            { $match: { user: userId, paymentStatus: 'COMPLETED' } },
            {
                $group: {
                    _id: '$user',
                    totalOrders: { $sum: 1 },
                    lifetimeSpend: { $sum: '$totalSellingPrice' },
                    firstOrderDate: { $min: '$orderDate' },
                    lastOrderDate: { $max: '$orderDate' },
                },
            },
        ]);

        if (stats.length === 0)
        {
            const existing = await customerMetricRepository.findByUserId(userId);
            if (existing)
            {
                const daysSince = existing.lastOrderDate
                    ? Math.floor((Date.now() - new Date(existing.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                await customerMetricRepository.upsertMetrics(userId, {
                    totalOrders: 0,
                    lifetimeSpend: 0,
                    averageOrderValue: 0,
                    lastOrderDate: existing.lastOrderDate,
                    firstOrderDate: existing.firstOrderDate,
                    daysSinceLastOrder: daysSince,
                });
            }
            return customerMetricRepository.findByUserId(userId);
        }

        const s = stats[0];
        const avgOrderValue = s.totalOrders > 0 ? Math.round(s.lifetimeSpend / s.totalOrders) : 0;
        const daysSince = s.lastOrderDate
            ? Math.floor((Date.now() - new Date(s.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        return customerMetricRepository.upsertMetrics(userId, {
            totalOrders: s.totalOrders,
            lifetimeSpend: Math.round(s.lifetimeSpend),
            averageOrderValue: avgOrderValue,
            lastOrderDate: s.lastOrderDate,
            firstOrderDate: s.firstOrderDate,
            daysSinceLastOrder: daysSince,
        });
    };

    /**
     * Evaluates all active segment rules against a CustomerMetric document.
     * Returns segments sorted by priority descending (highest first).
     *
     * TOP_CUSTOMER requires a percentile check against all customers.
     * Pass topCustomerUserIds (pre-computed set of user IDs in the top X%).
     */
    const evaluateSegments = (metric, topCustomerUserIds = new Set()) =>
    {
        if (!metric) return { primary: 'ALL_CUSTOMERS', all: ['ALL_CUSTOMERS'] };

        const matched = [];

        for (const rule of SEGMENT_RULES)
        {
            if (!rule.isActive) continue;

            let matches = true;

            for (const [field, condition] of Object.entries(rule.criteria))
            {
                if (field === 'isTopPercentile')
                {
                    if (!topCustomerUserIds.has(metric.userId.toString()))
                    {
                        matches = false;
                    }
                }
                else if (typeof condition === 'object' && condition !== null)
                {
                    const metricValue = metric[field];
                    for (const [op, val] of Object.entries(condition))
                    {
                        if (op === '$gte' && !(metricValue >= val)) { matches = false; }
                        if (op === '$lte' && !(metricValue <= val)) { matches = false; }
                        if (op === '$gt' && !(metricValue > val)) { matches = false; }
                        if (op === '$lt' && !(metricValue < val)) { matches = false; }
                        if (op === '$eq' && !(metricValue === val)) { matches = false; }
                        if (op === '$ne' && !(metricValue !== val)) { matches = false; }
                    }
                }
                else
                {
                    if (metric[field] !== condition) matches = false;
                }
            }

            if (matches)
            {
                matched.push({ name: rule.name, priority: rule.priority });
            }
        }

        matched.sort((a, b) => b.priority - a.priority);

        const segmentNames = matched.map((m) => m.name);

        return {
            primary: segmentNames.length > 0 ? `SEGMENT_${segmentNames[0]}` : 'ALL_CUSTOMERS',
            all: segmentNames.length > 0 ? segmentNames.map((n) => `SEGMENT_${n}`) : ['ALL_CUSTOMERS'],
        };
    };

    /**
     * Computes the set of user IDs in the top X percentile by lifetimeSpend.
     */
    const getTopCustomerUserIds = async (percentile = 10) =>
    {
        const topCustomers = await customerMetricRepository.findTopPercentile(percentile);
        return new Set(topCustomers.map((c) => c.userId.toString()));
    };

    /**
     * Gets or computes the segment for a user.
     * Uses cached CustomerMetric if available and recent (< 1 hour).
     * Otherwise refreshes metrics and reassigns segment.
     */
    const getUserSegment = async (userId) =>
    {
        let metric = await customerMetricRepository.findByUserId(userId);

        const needsRefresh = !metric ||
            !metric.computedAt ||
            (Date.now() - new Date(metric.computedAt).getTime()) > 60 * 60 * 1000;

        if (needsRefresh)
        {
            metric = await refreshMetrics(userId);
        }

        const topCustomerIds = await getTopCustomerUserIds(10);
        const result = evaluateSegments(metric, topCustomerIds);

        if (result.primary !== (metric && metric.segment))
        {
            await customerMetricRepository.updateSegment(userId, result.primary, result.all);
            metric = await customerMetricRepository.findByUserId(userId);
        }

        return {
            userId,
            segment: result.primary,
            segments: result.all,
            totalOrders: metric ? metric.totalOrders : 0,
            lifetimeSpend: metric ? metric.lifetimeSpend : 0,
        };
    };

    /**
     * Batch-refreshes metrics for all users (for scheduled jobs).
     */
    const refreshAllMetrics = async () =>
    {
        const userIds = await orderModel.distinct('user', { paymentStatus: 'COMPLETED' });
        for (const userId of userIds)
        {
            await refreshMetrics(userId);
        }
        return { refreshed: userIds.length };
    };

    /**
     * Checks whether a user belongs to a given segment.
     */
    const userMatchesSegment = async (userId, targetSegment) =>
    {
        if (!targetSegment || targetSegment === 'ALL_CUSTOMERS')
        {
            return true;
        }

        if (!targetSegment.startsWith('SEGMENT_'))
        {
            return false;
        }

        const { segment } = await getUserSegment(userId);
        return segment === targetSegment;
    };

    return Object.freeze({
        refreshMetrics,
        evaluateSegments,
        getTopCustomerUserIds,
        getUserSegment,
        refreshAllMetrics,
        userMatchesSegment,
    });
};
