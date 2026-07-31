/**
 * Pure function-based factory representing the Admin Dashboard Analytics Persistence database interface.
 * Queries existing collections (User, Seller, Product, Order, Review) for aggregated dashboard data.
 * No new models are created — analytics are computed from existing collections using MongoDB aggregation pipelines.
 */
export const createAdminDashboardRepository = ({ User, Seller, Product, Order, Review }) =>
{

    /**
     * Aggregates user counts by role using MongoDB aggregation pipeline.
     * Returns totalUsers, totalCustomers, totalSellers, pendingSellers.
     * No loops — uses $group + $cond for conditional counting.
     */
    const getUserSummary = async () =>
    {
        const pipeline = [
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    totalCustomers: {
                        $sum: { $cond: [{ $eq: ['$role', 'ROLE_CUSTOMER'] }, 1, 0] },
                    },
                    totalSellers: {
                        $sum: { $cond: [{ $eq: ['$role', 'ROLE_SELLER'] }, 1, 0] },
                    },
                },
            },
        ];

        const [result] = await User.aggregate(pipeline).allowDiskUse(true);
        return result || { totalUsers: 0, totalCustomers: 0, totalSellers: 0 };
    };

    /**
     * Aggregates seller account status counts using MongoDB aggregation pipeline.
     * Returns totalSellers, pendingSellers.
     * No loops — uses $group + $cond for conditional counting.
     */
    const getSellerSummary = async () =>
    {
        const pipeline = [
            {
                $group: {
                    _id: null,
                    totalSellers: { $sum: 1 },
                    pendingSellers: {
                        $sum: { $cond: [{ $eq: ['$accountStatus', 'PENDING_VERIFICATION'] }, 1, 0] },
                    },
                },
            },
        ];

        const [result] = await Seller.aggregate(pipeline).allowDiskUse(true);
        return result || { totalSellers: 0, pendingSellers: 0 };
    };

    /**
     * Aggregates product inventory data using MongoDB aggregation pipeline.
     * Returns totalProducts, activeProducts, outOfStockProducts.
     * No loops — uses $addFields + $cond for stock computation across variants.
     */
    const getProductSummary = async () =>
    {
        const pipeline = [
            {
                $addFields: {
                    totalStock: {
                        $cond: {
                            if: { $gt: [{ $size: { $ifNull: ['$variants', []] } }, 0] },
                            then: { $sum: '$variants.quantity' },
                            else: { $ifNull: ['$quantity', 0] },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    activeProducts: {
                        $sum: { $cond: [{ $gt: ['$totalStock', 0] }, 1, 0] },
                    },
                    outOfStockProducts: {
                        $sum: { $cond: [{ $eq: ['$totalStock', 0] }, 1, 0] },
                    },
                },
            },
        ];

        const [result] = await Product.aggregate(pipeline).allowDiskUse(true);
        return result || { totalProducts: 0, activeProducts: 0, outOfStockProducts: 0 };
    };

    /**
     * Aggregates order status counts using MongoDB aggregation pipeline.
     * Returns totalOrders, deliveredOrders, pendingOrders, cancelledOrders.
     * No loops — uses $group + $cond for conditional counting.
     */
    const getOrderSummary = async () =>
    {
        const pipeline = [
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 },
                },
            },
        ];

        const results = await Order.aggregate(pipeline).allowDiskUse(true);

        const statusMap = {
            totalOrders: 0,
            deliveredOrders: 0,
            pendingOrders: 0,
            cancelledOrders: 0,
        };

        for (const entry of results)
        {
            statusMap.totalOrders += entry.count;

            switch (entry._id)
            {
                case 'PENDING':
                case 'PLACED':
                    statusMap.pendingOrders += entry.count;
                    break;
                case 'DELIVERED':
                    statusMap.deliveredOrders += entry.count;
                    break;
                case 'CANCELLED':
                    statusMap.cancelledOrders += entry.count;
                    break;
            }
        }

        return statusMap;
    };

    /**
     * Aggregates revenue data using MongoDB aggregation pipeline.
     * Returns totalRevenue, todayRevenue, thisMonthRevenue, averageOrderValue.
     * No loops — uses $group with $cond for conditional revenue computation.
     */
    const getRevenueSummary = async () =>
    {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const pipeline = [
            {
                $match: {
                    paymentStatus: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalSellingPrice' },
                    totalPaidOrders: { $sum: 1 },
                    todayRevenue: {
                        $sum: {
                            $cond: [{ $gte: ['$orderDate', startOfDay] }, '$totalSellingPrice', 0],
                        },
                    },
                    thisMonthRevenue: {
                        $sum: {
                            $cond: [{ $gte: ['$orderDate', startOfMonth] }, '$totalSellingPrice', 0],
                        },
                    },
                },
            },
        ];

        const [result] = await Order.aggregate(pipeline).allowDiskUse(true);

        if (!result)
        {
            return { totalRevenue: 0, todayRevenue: 0, thisMonthRevenue: 0, averageOrderValue: 0 };
        }

        return {
            totalRevenue: result.totalRevenue,
            todayRevenue: result.todayRevenue,
            thisMonthRevenue: result.thisMonthRevenue,
            averageOrderValue: result.totalPaidOrders > 0
                ? parseFloat((result.totalRevenue / result.totalPaidOrders).toFixed(2))
                : 0,
        };
    };

    /**
     * Aggregates review statistics using MongoDB aggregation pipeline.
     * Returns totalReviews, averageRating.
     * No loops — uses $group for aggregation.
     */
    const getReviewSummary = async () =>
    {
        const pipeline = [
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                },
            },
        ];

        const [result] = await Review.aggregate(pipeline).allowDiskUse(true);

        if (!result)
        {
            return { totalReviews: 0, averageRating: 0 };
        }

        return {
            totalReviews: result.totalReviews,
            averageRating: Math.round(result.averageRating * 10) / 10,
        };
    };

    return Object.freeze({
        getUserSummary,
        getSellerSummary,
        getProductSummary,
        getOrderSummary,
        getRevenueSummary,
        getReviewSummary,
    });
};
