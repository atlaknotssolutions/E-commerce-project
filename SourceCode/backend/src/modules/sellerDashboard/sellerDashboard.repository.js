/**
 * Pure function-based factory representing the Seller Dashboard Analytics Persistence database interface.
 * Queries existing collections (Order, Product, ReturnRequest, Review, Notification) for aggregated dashboard data.
 * No new models are created — analytics are computed from existing collections.
 */
export const createSellerDashboardRepository = ({ Order, Product, ReturnRequest, Review, Notification, User, PaymentOrder, Refund }) =>
{

    /**
     * Aggregates sales revenue data for a seller using MongoDB aggregation pipeline.
     * Returns totalRevenue, todayRevenue, weeklyRevenue, monthlyRevenue.
     */
    const getSalesSummary = async ({ sellerId }) =>
    {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalSellingPrice' },
                    todayRevenue: {
                        $sum: {
                            $cond: [{ $gte: ['$orderDate', startOfDay] }, '$totalSellingPrice', 0],
                        },
                    },
                    weeklyRevenue: {
                        $sum: {
                            $cond: [{ $gte: ['$orderDate', startOfWeek] }, '$totalSellingPrice', 0],
                        },
                    },
                    monthlyRevenue: {
                        $sum: {
                            $cond: [{ $gte: ['$orderDate', startOfMonth] }, '$totalSellingPrice', 0],
                        },
                    },
                },
            },
        ];

        const [result] = await Order.aggregate(pipeline).allowDiskUse(true);
        return result || { totalRevenue: 0, todayRevenue: 0, weeklyRevenue: 0, monthlyRevenue: 0 };
    };

    /**
     * Aggregates order status counts for a seller using MongoDB aggregation pipeline.
     * Returns counts for each order status.
     */
    const getOrderSummary = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
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
            pendingOrders: 0,
            confirmedOrders: 0,
            packedOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
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
                case 'CONFIRMED':
                    statusMap.confirmedOrders += entry.count;
                    break;
                case 'PACKED':
                    statusMap.packedOrders += entry.count;
                    break;
                case 'SHIPPED':
                case 'OUT_FOR_DELIVERY':
                    statusMap.shippedOrders += entry.count;
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
     * Aggregates product inventory data for a seller using MongoDB aggregation pipeline.
     * Returns totalProducts, activeProducts, inactiveProducts, outOfStockProducts, lowStockProducts.
     */
    const getInventorySummary = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
            {
                $addFields: {
                    totalStock: {
                        $cond: {
                            if: { $gt: [{ $size: { $ifNull: ['$variants', []] } }, 0] },
                            then: { $sum: '$variants.quantity' },
                            else: { $ifNull: ['$quantity', 0] },
                        },
                    },
                    hasVariants: { $gt: [{ $size: { $ifNull: ['$variants', []] } }, 0] },
                },
            },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    activeProducts: {
                        $sum: { $cond: [{ $eq: ['$hasVariants', false] }, 1, 0] },
                    },
                    outOfStockProducts: {
                        $sum: { $cond: [{ $eq: ['$totalStock', 0] }, 1, 0] },
                    },
                    lowStockProducts: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gt: ['$totalStock', 0] }, { $lte: ['$totalStock', 5] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ];

        const [result] = await Product.aggregate(pipeline).allowDiskUse(true);

        if (!result)
        {
            return {
                totalProducts: 0,
                activeProducts: 0,
                inactiveProducts: 0,
                outOfStockProducts: 0,
                lowStockProducts: 0,
            };
        }

        return {
            totalProducts: result.totalProducts,
            activeProducts: result.totalProducts - result.outOfStockProducts,
            inactiveProducts: result.outOfStockProducts,
            outOfStockProducts: result.outOfStockProducts,
            lowStockProducts: result.lowStockProducts,
        };
    };

    /**
     * Aggregates return request status counts for a seller using MongoDB aggregation pipeline.
     * Returns counts for each return status.
     */
    const getReturnSummary = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
            {
                $group: {
                    _id: '$returnStatus',
                    count: { $sum: 1 },
                },
            },
        ];

        const results = await ReturnRequest.aggregate(pipeline).allowDiskUse(true);

        const statusMap = {
            totalReturns: 0,
            pendingReturns: 0,
            approvedReturns: 0,
            rejectedReturns: 0,
            completedRefunds: 0,
        };

        for (const entry of results)
        {
            statusMap.totalReturns += entry.count;

            switch (entry._id)
            {
                case 'REQUESTED':
                    statusMap.pendingReturns += entry.count;
                    break;
                case 'APPROVED':
                case 'ITEM_RECEIVED':
                    statusMap.approvedReturns += entry.count;
                    break;
                case 'REJECTED':
                    statusMap.rejectedReturns += entry.count;
                    break;
                case 'REFUND_COMPLETED':
                    statusMap.completedRefunds += entry.count;
                    break;
            }
        }

        return statusMap;
    };

    /**
     * Aggregates review summary for all products belonging to a seller.
     * Uses a two-stage aggregation: first find seller's products, then aggregate reviews.
     * Returns totalReviews and averageRating.
     */
    const getReviewSummary = async ({ sellerId }) =>
    {
        const sellerProductIds = await Product.find({ seller: sellerId }, { _id: 1 }).lean();
        const productIds = sellerProductIds.map((p) => p._id);

        if (productIds.length === 0)
        {
            return { totalReviews: 0, averageRating: 0 };
        }

        const pipeline = [
            {
                $match: { product: { $in: productIds } },
            },
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

    /**
     * Counts unread notifications for a seller.
     * The notification model uses 'customer' field for recipient reference.
     * Since seller notifications may use the seller ID in the customer field,
     * we count notifications matching the seller's user context.
     */
    const getUnreadNotificationCount = async ({ sellerId }) =>
    {
        const count = await Notification.countDocuments({
            customer: sellerId,
            readStatus: false,
        });

        return count;
    };

    // ==========================================
    // REVENUE ANALYTICS AGGREGATIONS
    // ==========================================

    /**
     * Aggregates daily revenue for the current day broken into 24 hourly buckets.
     * Returns array of 24 entries: { label: "HH:00", revenue: number }.
     * Missing hours return 0 revenue.
     */
    const getDailyRevenue = async ({ sellerId }) =>
    {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                    orderDate: { $gte: startOfDay },
                },
            },
            {
                $group: {
                    _id: { $hour: '$orderDate' },
                    revenue: { $sum: '$totalSellingPrice' },
                },
            },
        ];

        const results = await Order.aggregate(pipeline).allowDiskUse(true);

        const revenueMap = {};
        for (const entry of results)
        {
            revenueMap[entry._id] = entry.revenue;
        }

        const chartData = [];
        for (let h = 0; h < 24; h++)
        {
            chartData.push({
                label: `${String(h).padStart(2, '0')}:00`,
                revenue: revenueMap[h] ?? 0,
            });
        }

        return chartData;
    };

    /**
     * Aggregates weekly revenue for the current week broken into 7 daily buckets.
     * Returns array of 7 entries: { label: "Mon", revenue: number }.
     * Days with no orders return 0 revenue.
     */
    const getWeeklyRevenue = async ({ sellerId }) =>
    {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                    orderDate: { $gte: startOfWeek },
                },
            },
            {
                $group: {
                    _id: { $dayOfWeek: '$orderDate' },
                    revenue: { $sum: '$totalSellingPrice' },
                },
            },
        ];

        const results = await Order.aggregate(pipeline).allowDiskUse(true);

        const revenueMap = {};
        for (const entry of results)
        {
            revenueMap[entry._id] = entry.revenue;
        }

        const chartData = [];
        for (let d = 1; d <= 7; d++)
        {
            chartData.push({
                label: dayNames[d - 1],
                revenue: revenueMap[d] ?? 0,
            });
        }

        return chartData;
    };

    /**
     * Aggregates monthly revenue for the current month broken into daily buckets.
     * Returns one entry per day of the current month.
     * Days with no orders return 0 revenue.
     */
    const getMonthlyRevenue = async ({ sellerId }) =>
    {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                    orderDate: { $gte: startOfMonth, $lte: endOfMonth },
                },
            },
            {
                $group: {
                    _id: { $dayOfMonth: '$orderDate' },
                    revenue: { $sum: '$totalSellingPrice' },
                },
            },
        ];

        const results = await Order.aggregate(pipeline).allowDiskUse(true);

        const revenueMap = {};
        for (const entry of results)
        {
            revenueMap[entry._id] = entry.revenue;
        }

        const daysInMonth = endOfMonth.getDate();
        const chartData = [];
        for (let d = 1; d <= daysInMonth; d++)
        {
            chartData.push({
                label: `${d}`,
                revenue: revenueMap[d] ?? 0,
            });
        }

        return chartData;
    };

    /**
     * Aggregates yearly revenue for the current year broken into 12 monthly buckets.
     * Returns array of 12 entries: { label: "Jan", revenue: number }.
     * Months with no orders return 0 revenue.
     */
    const getYearlyRevenue = async ({ sellerId }) =>
    {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                    orderDate: { $gte: startOfYear, $lte: endOfYear },
                },
            },
            {
                $group: {
                    _id: { $month: '$orderDate' },
                    revenue: { $sum: '$totalSellingPrice' },
                },
            },
        ];

        const results = await Order.aggregate(pipeline).allowDiskUse(true);

        const revenueMap = {};
        for (const entry of results)
        {
            revenueMap[entry._id] = entry.revenue;
        }

        const chartData = [];
        for (let m = 1; m <= 12; m++)
        {
            chartData.push({
                label: monthNames[m - 1],
                revenue: revenueMap[m] ?? 0,
            });
        }

        return chartData;
    };

    /**
     * Aggregates overall revenue summary statistics for a seller.
     * Returns totalRevenue, averageRevenue, highestRevenue, lowestRevenue
     * computed across all time-period buckets.
     */
    const getRevenueSummary = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalSellingPrice' },
                    averageRevenue: { $avg: '$totalSellingPrice' },
                    highestRevenue: { $max: '$totalSellingPrice' },
                    lowestRevenue: { $min: '$totalSellingPrice' },
                    orderCount: { $sum: 1 },
                },
            },
        ];

        const [result] = await Order.aggregate(pipeline).allowDiskUse(true);

        if (!result)
        {
            return {
                totalRevenue: 0,
                averageRevenue: 0,
                highestRevenue: 0,
                lowestRevenue: 0,
            };
        }

        return {
            totalRevenue: result.totalRevenue ?? 0,
            averageRevenue: Math.round((result.averageRevenue ?? 0) * 100) / 100,
            highestRevenue: result.highestRevenue ?? 0,
            lowestRevenue: result.lowestRevenue ?? 0,
        };
    };

    // ==========================================
    // PRODUCT ANALYTICS AGGREGATIONS
    // ==========================================

    /**
     * Helper: Computes total stock for a product considering variants.
     */
    const computeTotalStock = (product) =>
    {
        if (product.variants && product.variants.length > 0)
        {
            return product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
        }
        return product.quantity || 0;
    };

    /**
     * Aggregates product overview counts for a seller.
     * Returns totalProducts, activeProducts, inactiveProducts, lowStockProducts, outOfStockProducts.
     * active = totalStock > 0, inactive = totalStock = 0, lowStock = 0 < totalStock <= threshold.
     */
    const getProductOverview = async ({ sellerId, threshold = 10 }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
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
                    lowStockProducts: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gt: ['$totalStock', 0] }, { $lte: ['$totalStock', threshold] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ];

        const [result] = await Product.aggregate(pipeline).allowDiskUse(true);

        if (!result)
        {
            return {
                totalProducts: 0,
                activeProducts: 0,
                inactiveProducts: 0,
                lowStockProducts: 0,
                outOfStockProducts: 0,
            };
        }

        return {
            totalProducts: result.totalProducts,
            activeProducts: result.activeProducts,
            inactiveProducts: result.outOfStockProducts,
            lowStockProducts: result.lowStockProducts,
            outOfStockProducts: result.outOfStockProducts,
        };
    };

    /**
     * Aggregates top 10 selling products for a seller from completed orders.
     * Joins order items with current product stock for remainingStock.
     * Returns array of { id, title, thumbnail, totalSold, revenue, remainingStock }.
     */
    const getTopSellingProducts = async ({ sellerId }) =>
    {
        const salesPipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.product',
                    title: { $first: '$orderItems.title' },
                    totalSold: { $sum: '$orderItems.quantity' },
                    revenue: {
                        $sum: { $multiply: ['$orderItems.sellingPrice', '$orderItems.quantity'] },
                    },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
        ];

        const salesResults = await Order.aggregate(salesPipeline).allowDiskUse(true);

        if (salesResults.length === 0)
        {
            return [];
        }

        const productIds = salesResults.map((s) => s._id);
        const products = await Product.find({ _id: { $in: productIds } })
            .select('quantity variants images')
            .lean();

        const productMap = {};
        for (const p of products)
        {
            productMap[p._id.toString()] = {
                thumbnail: p.images?.[0]?.url || null,
                remainingStock: computeTotalStock(p),
            };
        }

        return salesResults.map((s) => ({
            id: s._id,
            title: s.title,
            thumbnail: productMap[s._id.toString()]?.thumbnail || null,
            totalSold: s.totalSold,
            revenue: s.revenue,
            remainingStock: productMap[s._id.toString()]?.remainingStock || 0,
        }));
    };

    /**
     * Aggregates lowest 10 selling products for a seller including products with zero sales.
     * Uses Order aggregation for sales data, then merges with all seller products.
     * Returns array of { id, title, thumbnail, totalSold, remainingStock }.
     */
    const getLowestSellingProducts = async ({ sellerId }) =>
    {
        const salesPipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.product',
                    totalSold: { $sum: '$orderItems.quantity' },
                },
            },
        ];

        const salesResults = await Order.aggregate(salesPipeline).allowDiskUse(true);

        const salesMap = {};
        for (const entry of salesResults)
        {
            salesMap[entry._id.toString()] = entry.totalSold;
        }

        const products = await Product.find({ seller: sellerId })
            .select('title images quantity variants')
            .lean();

        const results = products.map((p) => ({
            id: p._id,
            title: p.title,
            thumbnail: p.images?.[0]?.url || null,
            totalSold: salesMap[p._id.toString()] || 0,
            remainingStock: computeTotalStock(p),
        }));

        results.sort((a, b) => a.totalSold - b.totalSold || a.title.localeCompare(b.title));

        return results.slice(0, 10);
    };

    /**
     * Finds low stock products for a seller where 0 < totalStock <= threshold.
     * Default threshold is 10.
     * Returns array of { id, title, stock }.
     */
    const getLowStockProducts = async ({ sellerId, threshold = 10 }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
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
                $match: {
                    $and: [
                        { totalStock: { $gt: 0 } },
                        { totalStock: { $lte: threshold } },
                    ],
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title: 1,
                    stock: '$totalStock',
                },
            },
            { $sort: { stock: 1 } },
        ];

        return Product.aggregate(pipeline).allowDiskUse(true);
    };

    /**
     * Finds out-of-stock products for a seller where totalStock = 0.
     * Returns array of { id, title, thumbnail, category }.
     */
    const getOutOfStockProducts = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
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
                $match: { totalStock: 0 },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDoc',
                },
            },
            {
                $addFields: {
                    category: { $arrayElemAt: ['$categoryDoc.name', 0] },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title: 1,
                    thumbnail: { $arrayElemAt: ['$images.url', 0] },
                    category: 1,
                },
            },
            { $sort: { title: 1 } },
        ];

        return Product.aggregate(pipeline).allowDiskUse(true);
    };

    /**
     * Finds the latest 10 products for a seller ordered by creation date.
     * Returns array of { id, title, createdAt, status }.
     */
    const getNewestProducts = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
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
                $project: {
                    _id: 0,
                    id: '$_id',
                    title: 1,
                    createdAt: 1,
                    status: {
                        $cond: {
                            if: { $gt: ['$totalStock', 0] },
                            then: 'Active',
                            else: 'Out of Stock',
                        },
                    },
                },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
        ];

        return Product.aggregate(pipeline).allowDiskUse(true);
    };

    // ==========================================
    // ORDER ANALYTICS AGGREGATIONS
    // ==========================================

    /**
     * Aggregates order overview counts for a seller including today's orders.
     * Returns totalOrders, todayOrders, pendingOrders, confirmedOrders, packedOrders,
     * shippedOrders, deliveredOrders, cancelledOrders, returnedOrders.
     */
    const getOrderOverview = async ({ sellerId }) =>
    {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const orderPipeline = [
            {
                $match: { seller: sellerId },
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    todayOrders: {
                        $sum: { $cond: [{ $gte: ['$orderDate', startOfDay] }, 1, 0] },
                    },
                    pendingOrders: {
                        $sum: {
                            $cond: [{ $in: ['$orderStatus', ['PENDING', 'PLACED']] }, 1, 0],
                        },
                    },
                    confirmedOrders: {
                        $sum: { $cond: [{ $eq: ['$orderStatus', 'CONFIRMED'] }, 1, 0] },
                    },
                    packedOrders: {
                        $sum: { $cond: [{ $eq: ['$orderStatus', 'PACKED'] }, 1, 0] },
                    },
                    shippedOrders: {
                        $sum: {
                            $cond: [{ $in: ['$orderStatus', ['SHIPPED', 'OUT_FOR_DELIVERY']] }, 1, 0],
                        },
                    },
                    deliveredOrders: {
                        $sum: { $cond: [{ $eq: ['$orderStatus', 'DELIVERED'] }, 1, 0] },
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ['$orderStatus', 'CANCELLED'] }, 1, 0] },
                    },
                },
            },
        ];

        const [orderResult] = await Order.aggregate(orderPipeline).allowDiskUse(true);

        const returnedCount = await ReturnRequest.countDocuments({ seller: sellerId });

        if (!orderResult)
        {
            return {
                totalOrders: 0,
                todayOrders: 0,
                pendingOrders: 0,
                confirmedOrders: 0,
                packedOrders: 0,
                shippedOrders: 0,
                deliveredOrders: 0,
                cancelledOrders: 0,
                returnedOrders: 0,
            };
        }

        return {
            totalOrders: orderResult.totalOrders,
            todayOrders: orderResult.todayOrders,
            pendingOrders: orderResult.pendingOrders,
            confirmedOrders: orderResult.confirmedOrders,
            packedOrders: orderResult.packedOrders,
            shippedOrders: orderResult.shippedOrders,
            deliveredOrders: orderResult.deliveredOrders,
            cancelledOrders: orderResult.cancelledOrders,
            returnedOrders: returnedCount,
        };
    };

    /**
     * Aggregates revenue statistics for a seller from completed orders.
     * Returns totalRevenue, averageOrderValue, highestOrderValue, lowestOrderValue.
     */
    const getOrderRevenueStats = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalSellingPrice' },
                    averageOrderValue: { $avg: '$totalSellingPrice' },
                    highestOrderValue: { $max: '$totalSellingPrice' },
                    lowestOrderValue: { $min: '$totalSellingPrice' },
                },
            },
        ];

        const [result] = await Order.aggregate(pipeline).allowDiskUse(true);

        if (!result)
        {
            return {
                totalRevenue: 0,
                averageOrderValue: 0,
                highestOrderValue: 0,
                lowestOrderValue: 0,
            };
        }

        return {
            totalRevenue: result.totalRevenue ?? 0,
            averageOrderValue: Math.round((result.averageOrderValue ?? 0) * 100) / 100,
            highestOrderValue: result.highestOrderValue ?? 0,
            lowestOrderValue: result.lowestOrderValue ?? 0,
        };
    };

    /**
     * Aggregates order status distribution for a seller.
     * Returns array of { status, count } for each order status.
     */
    const getOrderStatusDistribution = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1,
                },
            },
            { $sort: { count: -1 } },
        ];

        return Order.aggregate(pipeline).allowDiskUse(true);
    };

    /**
     * Retrieves the latest 10 orders for a seller with customer and payment details.
     * Joins Order with User for customer info and PaymentOrder for paymentMethod.
     * Returns array of { id, orderId, customer, totalAmount, paymentMethod, paymentStatus, orderStatus, createdAt }.
     */
    const getRecentOrders = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
            { $sort: { orderDate: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDoc',
                },
            },
            {
                $addFields: {
                    customerName: { $arrayElemAt: ['$userDoc.fullName', 0] },
                    customerEmail: { $arrayElemAt: ['$userDoc.email', 0] },
                },
            },
            {
                $lookup: {
                    from: 'paymentorders',
                    let: { orderId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$$orderId', '$orders'] },
                            },
                        },
                        { $limit: 1 },
                    ],
                    as: 'paymentDoc',
                },
            },
            {
                $addFields: {
                    paymentMethod: { $arrayElemAt: ['$paymentDoc.paymentMethod', 0] },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    orderId: 1,
                    customer: {
                        $cond: {
                            if: { $ne: ['$customerName', null] },
                            then: '$customerName',
                            else: 'Guest',
                        },
                    },
                    totalAmount: '$totalSellingPrice',
                    paymentMethod: { $ifNull: ['$paymentMethod', 'N/A'] },
                    paymentStatus: 1,
                    orderStatus: 1,
                    createdAt: '$orderDate',
                },
            },
        ];

        return Order.aggregate(pipeline).allowDiskUse(true);
    };

    /**
     * Aggregates top 10 customers by total spend for a seller from completed orders.
     * Joins with User for customer identity.
     * Returns array of { id, fullName, email, totalOrders, totalSpent }.
     */
    const getTopCustomers = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: '$user',
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalSellingPrice' },
                },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDoc',
                },
            },
            {
                $addFields: {
                    fullName: { $arrayElemAt: ['$userDoc.fullName', 0] },
                    email: { $arrayElemAt: ['$userDoc.email', 0] },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    fullName: 1,
                    email: 1,
                    totalOrders: 1,
                    totalSpent: { $round: ['$totalSpent', 2] },
                },
            },
        ];

        return Order.aggregate(pipeline).allowDiskUse(true);
    };

    // ==========================================
    // CUSTOMER ANALYTICS AGGREGATIONS
    // ==========================================

    /**
     * Aggregates customer overview counts for a seller.
     * Returns totalCustomers, newCustomers (first order this month),
     * repeatCustomers (ordered more than once), activeCustomers (ordered in last 90 days),
     * inactiveCustomers (no order in last 90 days).
     */
    const getCustomerOverview = async ({ sellerId }) =>
    {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(now.getDate() - 90);

        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: '$user',
                    orderCount: { $sum: 1 },
                    firstOrderDate: { $min: '$orderDate' },
                    lastOrderDate: { $max: '$orderDate' },
                },
            },
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    newCustomers: {
                        $sum: { $cond: [{ $gte: ['$firstOrderDate', startOfMonth] }, 1, 0] },
                    },
                    repeatCustomers: {
                        $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] },
                    },
                    activeCustomers: {
                        $sum: { $cond: [{ $gte: ['$lastOrderDate', ninetyDaysAgo] }, 1, 0] },
                    },
                },
            },
        ];

        const [result] = await Order.aggregate(pipeline).allowDiskUse(true);

        if (!result)
        {
            return {
                totalCustomers: 0,
                newCustomers: 0,
                repeatCustomers: 0,
                activeCustomers: 0,
                inactiveCustomers: 0,
            };
        }

        return {
            totalCustomers: result.totalCustomers,
            newCustomers: result.newCustomers,
            repeatCustomers: result.repeatCustomers,
            activeCustomers: result.activeCustomers,
            inactiveCustomers: result.totalCustomers - result.activeCustomers,
        };
    };

    /**
     * Finds the latest 10 new customers by their first order date for a seller.
     * Returns array of { id, fullName, email, firstOrderDate }.
     */
    const getNewCustomers = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: '$user',
                    firstOrderDate: { $min: '$orderDate' },
                },
            },
            { $sort: { firstOrderDate: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDoc',
                },
            },
            {
                $addFields: {
                    fullName: { $arrayElemAt: ['$userDoc.fullName', 0] },
                    email: { $arrayElemAt: ['$userDoc.email', 0] },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    fullName: 1,
                    email: 1,
                    firstOrderDate: 1,
                },
            },
        ];

        return Order.aggregate(pipeline).allowDiskUse(true);
    };

    /**
     * Finds top 10 repeat customers (ordered more than once) for a seller.
     * Returns array of { id, fullName, totalOrders, totalSpent }.
     */
    const getRepeatCustomers = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: '$user',
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalSellingPrice' },
                },
            },
            { $match: { totalOrders: { $gt: 1 } } },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDoc',
                },
            },
            {
                $addFields: {
                    fullName: { $arrayElemAt: ['$userDoc.fullName', 0] },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    fullName: 1,
                    totalOrders: 1,
                    totalSpent: { $round: ['$totalSpent', 2] },
                },
            },
        ];

        return Order.aggregate(pipeline).allowDiskUse(true);
    };

    /**
     * Finds top 10 customers by total spend with mobile and lastOrderDate for a seller.
     * Returns array of { id, fullName, email, mobile, totalOrders, totalSpent, lastOrderDate }.
     */
    const getTopCustomersDetailed = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: '$user',
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalSellingPrice' },
                    lastOrderDate: { $max: '$orderDate' },
                },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDoc',
                },
            },
            {
                $addFields: {
                    fullName: { $arrayElemAt: ['$userDoc.fullName', 0] },
                    email: { $arrayElemAt: ['$userDoc.email', 0] },
                    mobile: { $arrayElemAt: ['$userDoc.mobile', 0] },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    fullName: 1,
                    email: 1,
                    mobile: 1,
                    totalOrders: 1,
                    totalSpent: { $round: ['$totalSpent', 2] },
                    lastOrderDate: 1,
                },
            },
        ];

        return Order.aggregate(pipeline).allowDiskUse(true);
    };

    /**
     * Computes customer growth comparing current month to previous month.
     * Returns { currentMonth, previousMonth, growthPercentage }.
     */
    const getCustomerGrowth = async ({ sellerId }) =>
    {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: '$user',
                    firstOrderDate: { $min: '$orderDate' },
                },
            },
            {
                $group: {
                    _id: null,
                    currentMonth: {
                        $sum: { $cond: [{ $and: [{ $gte: ['$firstOrderDate', startOfCurrentMonth] }] }, 1, 0] },
                    },
                    previousMonth: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ['$firstOrderDate', startOfPreviousMonth] },
                                        { $lt: ['$firstOrderDate', startOfCurrentMonth] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ];

        const [result] = await Order.aggregate(pipeline).allowDiskUse(true);

        const currentMonth = result?.currentMonth ?? 0;
        const previousMonth = result?.previousMonth ?? 0;
        const growthPercentage = previousMonth > 0
            ? Math.round(((currentMonth - previousMonth) / previousMonth) * 100 * 100) / 100
            : currentMonth > 0
                ? 100
                : 0;

        return { currentMonth, previousMonth, growthPercentage };
    };

    /**
     * Computes customer retention metrics for a seller.
     * repeatPurchaseRate: percentage of customers with more than 1 order.
     * retentionPercentage: percentage of customers active in the last 90 days.
     * Returns { repeatPurchaseRate, retentionPercentage }.
     */
    const getCustomerRetention = async ({ sellerId }) =>
    {
        const now = new Date();
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(now.getDate() - 90);

        const pipeline = [
            {
                $match: {
                    seller: sellerId,
                    paymentStatus: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: '$user',
                    orderCount: { $sum: 1 },
                    lastOrderDate: { $max: '$orderDate' },
                },
            },
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    repeatCustomers: {
                        $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] },
                    },
                    activeCustomers: {
                        $sum: { $cond: [{ $gte: ['$lastOrderDate', ninetyDaysAgo] }, 1, 0] },
                    },
                },
            },
        ];

        const [result] = await Order.aggregate(pipeline).allowDiskUse(true);

        if (!result || result.totalCustomers === 0)
        {
            return { repeatPurchaseRate: 0, retentionPercentage: 0 };
        }

        const repeatPurchaseRate = Math.round((result.repeatCustomers / result.totalCustomers) * 100 * 100) / 100;
        const retentionPercentage = Math.round((result.activeCustomers / result.totalCustomers) * 100 * 100) / 100;

        return { repeatPurchaseRate, retentionPercentage };
    };

    // ==========================================
    // RETURN & REFUND ANALYTICS AGGREGATIONS
    // ==========================================

    /**
     * Aggregates return overview counts for a seller from the ReturnRequest collection.
     * Also counts pending refunds from the Refund collection.
     * Returns totalReturns, approvedReturns, rejectedReturns, pendingReturns,
     * receivedReturns, completedRefunds, pendingRefunds.
     */
    const getReturnOverview = async ({ sellerId }) =>
    {
        const returnPipeline = [
            {
                $match: { seller: sellerId },
            },
            {
                $group: {
                    _id: '$returnStatus',
                    count: { $sum: 1 },
                },
            },
        ];

        const returnResults = await ReturnRequest.aggregate(returnPipeline).allowDiskUse(true);

        const statusMap = {
            totalReturns: 0,
            approvedReturns: 0,
            rejectedReturns: 0,
            pendingReturns: 0,
            receivedReturns: 0,
            completedRefunds: 0,
        };

        for (const entry of returnResults)
        {
            statusMap.totalReturns += entry.count;

            switch (entry._id)
            {
                case 'REQUESTED':
                    statusMap.pendingReturns += entry.count;
                    break;
                case 'APPROVED':
                    statusMap.approvedReturns += entry.count;
                    break;
                case 'REJECTED':
                    statusMap.rejectedReturns += entry.count;
                    break;
                case 'ITEM_RECEIVED':
                    statusMap.receivedReturns += entry.count;
                    break;
                case 'REFUND_COMPLETED':
                    statusMap.completedRefunds += entry.count;
                    break;
            }
        }

        const sellerReturnIds = await ReturnRequest.find({ seller: sellerId }, { _id: 1 }).lean();
        const returnIds = sellerReturnIds.map((r) => r._id);

        let pendingRefunds = 0;
        if (returnIds.length > 0)
        {
            pendingRefunds = await Refund.countDocuments({
                returnRequestId: { $in: returnIds },
                status: 'PENDING',
            });
        }

        return { ...statusMap, pendingRefunds };
    };

    /**
     * Aggregates return status distribution for a seller.
     * Returns array of { status, count } for each return status.
     */
    const getReturnStatusDistribution = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
            {
                $group: {
                    _id: '$returnStatus',
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1,
                },
            },
            { $sort: { count: -1 } },
        ];

        return ReturnRequest.aggregate(pipeline).allowDiskUse(true);
    };

    /**
     * Aggregates refund statistics from the Refund collection for a seller's returns.
     * Only includes COMPLETED refunds.
     * Returns totalRefundAmount, averageRefundAmount, largestRefund, smallestRefund.
     */
    const getRefundAnalytics = async ({ sellerId }) =>
    {
        const sellerReturnIds = await ReturnRequest.find({ seller: sellerId }, { _id: 1 }).lean();
        const returnIds = sellerReturnIds.map((r) => r._id);

        if (returnIds.length === 0)
        {
            return {
                totalRefundAmount: 0,
                averageRefundAmount: 0,
                largestRefund: 0,
                smallestRefund: 0,
            };
        }

        const pipeline = [
            {
                $match: {
                    returnRequestId: { $in: returnIds },
                    status: 'COMPLETED',
                },
            },
            {
                $group: {
                    _id: null,
                    totalRefundAmount: { $sum: '$amount' },
                    averageRefundAmount: { $avg: '$amount' },
                    largestRefund: { $max: '$amount' },
                    smallestRefund: { $min: '$amount' },
                },
            },
        ];

        const [result] = await Refund.aggregate(pipeline).allowDiskUse(true);

        if (!result)
        {
            return {
                totalRefundAmount: 0,
                averageRefundAmount: 0,
                largestRefund: 0,
                smallestRefund: 0,
            };
        }

        return {
            totalRefundAmount: result.totalRefundAmount ?? 0,
            averageRefundAmount: Math.round((result.averageRefundAmount ?? 0) * 100) / 100,
            largestRefund: result.largestRefund ?? 0,
            smallestRefund: result.smallestRefund ?? 0,
        };
    };

    /**
     * Retrieves the latest 10 returns for a seller with customer and product details.
     * Returns array of { id, returnId, orderId, customer, product, refundAmount, reason, returnStatus, requestedAt }.
     */
    const getRecentReturns = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
            { $sort: { requestedAt: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'customer',
                    foreignField: '_id',
                    as: 'customerDoc',
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productDoc',
                },
            },
            {
                $addFields: {
                    customerName: { $arrayElemAt: ['$customerDoc.fullName', 0] },
                    productTitle: { $arrayElemAt: ['$productDoc.title', 0] },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    returnId: 1,
                    orderId: 1,
                    customer: { $ifNull: ['$customerName', 'Unknown'] },
                    product: { $ifNull: ['$productTitle', 'Unknown'] },
                    refundAmount: 1,
                    reason: 1,
                    returnStatus: 1,
                    requestedAt: 1,
                },
            },
        ];

        return ReturnRequest.aggregate(pipeline).allowDiskUse(true);
    };

    /**
     * Aggregates top 10 most returned products for a seller.
     * Returns array of { id, title, returnCount, refundAmount }.
     */
    const getTopReturnedProducts = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
            {
                $group: {
                    _id: '$productId',
                    returnCount: { $sum: 1 },
                    refundAmount: { $sum: '$refundAmount' },
                },
            },
            { $sort: { returnCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDoc',
                },
            },
            {
                $addFields: {
                    title: { $arrayElemAt: ['$productDoc.title', 0] },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title: { $ifNull: ['$title', 'Unknown'] },
                    returnCount: 1,
                    refundAmount: { $round: ['$refundAmount', 2] },
                },
            },
        ];

        return ReturnRequest.aggregate(pipeline).allowDiskUse(true);
    };

    /**
     * Aggregates return reasons for a seller with count and percentage.
     * Returns array of { reason, count, percentage }.
     */
    const getReturnReasons = async ({ sellerId }) =>
    {
        const pipeline = [
            {
                $match: { seller: sellerId },
            },
            {
                $group: {
                    _id: '$reason',
                    count: { $sum: 1 },
                },
            },
            {
                $facet: {
                    reasons: [
                        { $project: { _id: 0, reason: '$_id', count: 1 } },
                        { $sort: { count: -1 } },
                    ],
                    total: [
                        { $group: { _id: null, total: { $sum: '$count' } } },
                    ],
                },
            },
            { $unwind: '$total' },
            { $unwind: '$reasons' },
            {
                $project: {
                    _id: 0,
                    reason: '$reasons.reason',
                    count: '$reasons.count',
                    percentage: {
                        $round: [
                            { $multiply: [{ $divide: ['$reasons.count', '$total.total'] }, 100] },
                            2,
                        ],
                    },
                },
            },
            { $sort: { count: -1 } },
        ];

        return ReturnRequest.aggregate(pipeline).allowDiskUse(true);
    };

    return Object.freeze({
        getSalesSummary,
        getOrderSummary,
        getInventorySummary,
        getReturnSummary,
        getReviewSummary,
        getUnreadNotificationCount,
        getDailyRevenue,
        getWeeklyRevenue,
        getMonthlyRevenue,
        getYearlyRevenue,
        getRevenueSummary,
        getProductOverview,
        getTopSellingProducts,
        getLowestSellingProducts,
        getLowStockProducts,
        getOutOfStockProducts,
        getNewestProducts,
        getOrderOverview,
        getOrderRevenueStats,
        getOrderStatusDistribution,
        getRecentOrders,
        getTopCustomers,
        getCustomerOverview,
        getNewCustomers,
        getRepeatCustomers,
        getTopCustomersDetailed,
        getCustomerGrowth,
        getCustomerRetention,
        getReturnOverview,
        getReturnStatusDistribution,
        getRefundAnalytics,
        getRecentReturns,
        getTopReturnedProducts,
        getReturnReasons,
    });
};
