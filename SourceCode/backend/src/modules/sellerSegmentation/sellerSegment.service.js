import mongoose from 'mongoose';
import { SELLER_SEGMENT_RULES } from './sellerSegmentRule.config.js';

export const createSellerSegmentService = ({
    sellerMetricRepository,
    sellerModel,
    createApiError,
}) =>
{
    const refreshMetrics = async (sellerId) =>
    {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [currentStats] = await mongoose.model('Order').aggregate([
            { $match: { seller: new mongoose.Types.ObjectId(sellerId), paymentStatus: 'COMPLETED' } },
            {
                $group: {
                    _id: '$seller',
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalSellingPrice' },
                    cancelledOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'CANCELLED'] }, 1, 0] } },
                    deliveredOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'DELIVERED'] }, 1, 0] } },
                    onTimeDeliveries: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$orderStatus', 'DELIVERED'] }, { $lte: ['$deliveredAt', '$estimatedDelivery'] }] },
                                1,
                                0,
                            ],
                        },
                    },
                    lastOrderDate: { $max: '$orderDate' },
                    firstOrderDate: { $min: '$orderDate' },
                },
            },
        ]);

        const [previousStats] = await mongoose.model('Order').aggregate([
            {
                $match: {
                    seller: new mongoose.Types.ObjectId(sellerId),
                    paymentStatus: 'COMPLETED',
                    orderDate: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth },
                },
            },
            {
                $group: {
                    _id: '$seller',
                    previousRevenue: { $sum: '$totalSellingPrice' },
                    previousOrders: { $sum: 1 },
                },
            },
        ]);

        const [currentMonthStats] = await mongoose.model('Order').aggregate([
            {
                $match: {
                    seller: new mongoose.Types.ObjectId(sellerId),
                    paymentStatus: 'COMPLETED',
                    orderDate: { $gte: startOfCurrentMonth },
                },
            },
            {
                $group: {
                    _id: '$seller',
                    currentRevenue: { $sum: '$totalSellingPrice' },
                    currentOrders: { $sum: 1 },
                },
            },
        ]);

        const returnCount = await mongoose.model('ReturnRequest').countDocuments({
            seller: sellerId,
            returnStatus: 'REFUND_COMPLETED',
        });

        const sellerProductIds = await mongoose.model('Product').find({ seller: sellerId }, { _id: 1 }).lean();
        const productIds = sellerProductIds.map((p) => p._id);

        let avgRating = 0;
        let reviewCount = 0;
        if (productIds.length > 0)
        {
            const [reviewStats] = await mongoose.model('Review').aggregate([
                { $match: { product: { $in: productIds } } },
                { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
            ]);
            if (reviewStats)
            {
                avgRating = Math.round((reviewStats.avgRating || 0) * 10) / 10;
                reviewCount = reviewStats.count || 0;
            }
        }

        const seller = await sellerModel.findById(sellerId).select('createdAt').lean();
        const daysSinceRegistration = seller
            ? Math.floor((Date.now() - new Date(seller.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        if (!currentStats)
        {
            const existing = await sellerMetricRepository.findBySellerId(sellerId);
            if (existing)
            {
                const daysSince = existing.lastOrderDate
                    ? Math.floor((Date.now() - new Date(existing.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                await sellerMetricRepository.upsertMetrics(sellerId, {
                    totalOrders: 0,
                    totalRevenue: 0,
                    averageOrderValue: 0,
                    averageRating: avgRating,
                    reviewCount,
                    returnCount,
                    returnRate: 0,
                    cancellationCount: 0,
                    cancellationRate: 0,
                    fulfillmentRate: 0,
                    revenueGrowth: 0,
                    orderGrowth: 0,
                    lastOrderDate: existing.lastOrderDate,
                    daysSinceLastOrder: daysSince,
                    daysSinceRegistration,
                });
            }
            return sellerMetricRepository.findBySellerId(sellerId);
        }

        const totalOrders = currentStats.totalOrders;
        const totalRevenue = Math.round(currentStats.totalRevenue);
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
        const cancelledCount = currentStats.cancelledOrders || 0;
        const deliveredCount = currentStats.deliveredOrders || 0;
        const onTimeCount = currentStats.onTimeDeliveries || 0;
        const cancellationRate = totalOrders > 0 ? Math.round((cancelledCount / totalOrders) * 100 * 100) / 100 : 0;
        const returnRate = totalOrders > 0 ? Math.round((returnCount / totalOrders) * 100 * 100) / 100 : 0;
        const fulfillmentRate = deliveredCount > 0 ? Math.round((onTimeCount / deliveredCount) * 100 * 100) / 100 : 0;

        const prevRevenue = previousStats ? previousStats.previousRevenue || 0 : 0;
        const currentRevenue = currentMonthStats ? currentMonthStats.currentRevenue || 0 : 0;
        const revenueGrowth = prevRevenue > 0
            ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100 * 100) / 100
            : currentRevenue > 0
                ? 100
                : 0;

        const prevOrders = previousStats ? previousStats.previousOrders || 0 : 0;
        const currentOrders = currentMonthStats ? currentMonthStats.currentOrders || 0 : 0;
        const orderGrowth = prevOrders > 0
            ? Math.round(((currentOrders - prevOrders) / prevOrders) * 100 * 100) / 100
            : currentOrders > 0
                ? 100
                : 0;

        const lastOrderDate = currentStats.lastOrderDate;
        const daysSinceLastOrder = lastOrderDate
            ? Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        return sellerMetricRepository.upsertMetrics(sellerId, {
            totalOrders,
            totalRevenue,
            averageOrderValue: avgOrderValue,
            averageRating: avgRating,
            reviewCount,
            returnCount,
            returnRate,
            cancellationCount: cancelledCount,
            cancellationRate,
            fulfillmentRate,
            revenueGrowth,
            orderGrowth,
            lastOrderDate,
            daysSinceLastOrder,
            daysSinceRegistration,
        });
    };

    const evaluateSegments = (metric, topRevenueSellerIds = new Set(), topCompositeSellerIds = new Set()) =>
    {
        if (!metric) return { primary: 'ALL_SELLERS', all: ['ALL_SELLERS'] };

        const matched = [];

        for (const rule of SELLER_SEGMENT_RULES)
        {
            if (!rule.isActive) continue;

            let matches = true;

            for (const [field, condition] of Object.entries(rule.criteria))
            {
                if (field === 'isTopRevenuePercentile')
                {
                    if (!topRevenueSellerIds.has(metric.sellerId.toString()))
                    {
                        matches = false;
                    }
                }
                else if (field === 'isTopCompositeScore')
                {
                    if (!topCompositeSellerIds.has(metric.sellerId.toString()))
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
            primary: segmentNames.length > 0 ? `SEGMENT_${segmentNames[0]}` : 'ALL_SELLERS',
            all: segmentNames.length > 0 ? segmentNames.map((n) => `SEGMENT_${n}`) : ['ALL_SELLERS'],
        };
    };

    const getTopRevenueSellerIds = async (percentile = 10) =>
    {
        const topSellers = await sellerMetricRepository.findTopByRevenue(percentile);
        return new Set(topSellers.map((s) => s.sellerId.toString()));
    };

    const getTopCompositeSellerIds = async (percentile = 15) =>
    {
        const topSellers = await sellerMetricRepository.findTopByCompositeScore(percentile);
        return new Set(topSellers.map((s) => s.sellerId.toString()));
    };

    const getSellerSegment = async (sellerId) =>
    {
        let metric = await sellerMetricRepository.findBySellerId(sellerId);

        const needsRefresh = !metric ||
            !metric.computedAt ||
            (Date.now() - new Date(metric.computedAt).getTime()) > 60 * 60 * 1000;

        if (needsRefresh)
        {
            metric = await refreshMetrics(sellerId);
        }

        const topRevenueIds = await getTopRevenueSellerIds(10);
        const topCompositeIds = await getTopCompositeSellerIds(15);
        const result = evaluateSegments(metric, topRevenueIds, topCompositeIds);

        if (result.primary !== (metric && metric.segment))
        {
            await sellerMetricRepository.updateSegment(sellerId, result.primary, result.all);
            metric = await sellerMetricRepository.findBySellerId(sellerId);
        }

        return {
            sellerId,
            segment: result.primary,
            segments: result.all,
            totalOrders: metric ? metric.totalOrders : 0,
            totalRevenue: metric ? metric.totalRevenue : 0,
        };
    };

    const refreshAllMetrics = async () =>
    {
        const sellerIds = await mongoose.model('Order').distinct('seller', { paymentStatus: 'COMPLETED' });
        for (const sellerId of sellerIds)
        {
            await refreshMetrics(sellerId);
        }
        return { refreshed: sellerIds.length };
    };

    const sellerMatchesSegment = async (sellerId, targetSegment) =>
    {
        if (!targetSegment || targetSegment === 'ALL_SELLERS')
        {
            return true;
        }

        if (!targetSegment.startsWith('SEGMENT_'))
        {
            return false;
        }

        const { segment } = await getSellerSegment(sellerId);
        return segment === targetSegment;
    };

    return Object.freeze({
        refreshMetrics,
        evaluateSegments,
        getTopRevenueSellerIds,
        getTopCompositeSellerIds,
        getSellerSegment,
        refreshAllMetrics,
        sellerMatchesSegment,
    });
};
