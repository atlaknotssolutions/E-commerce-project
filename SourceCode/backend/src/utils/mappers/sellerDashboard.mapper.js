/**
 * Pure mapper function that transforms raw dashboard aggregation data
 * into a clean, frontend-compatible Seller Dashboard Summary DTO.
 * Never exposes MongoDB _id or internal fields.
 */
export const mapSellerDashboardSummary = ({
    sales,
    orders,
    products,
    returns,
    reviews,
    notifications,
}) =>
{
    return {
        sales: {
            totalRevenue: sales?.totalRevenue ?? 0,
            todayRevenue: sales?.todayRevenue ?? 0,
            weeklyRevenue: sales?.weeklyRevenue ?? 0,
            monthlyRevenue: sales?.monthlyRevenue ?? 0,
        },
        orders: {
            totalOrders: orders?.totalOrders ?? 0,
            pendingOrders: orders?.pendingOrders ?? 0,
            confirmedOrders: orders?.confirmedOrders ?? 0,
            packedOrders: orders?.packedOrders ?? 0,
            shippedOrders: orders?.shippedOrders ?? 0,
            deliveredOrders: orders?.deliveredOrders ?? 0,
            cancelledOrders: orders?.cancelledOrders ?? 0,
        },
        products: {
            totalProducts: products?.totalProducts ?? 0,
            activeProducts: products?.activeProducts ?? 0,
            inactiveProducts: products?.inactiveProducts ?? 0,
            outOfStockProducts: products?.outOfStockProducts ?? 0,
            lowStockProducts: products?.lowStockProducts ?? 0,
        },
        returns: {
            totalReturns: returns?.totalReturns ?? 0,
            pendingReturns: returns?.pendingReturns ?? 0,
            approvedReturns: returns?.approvedReturns ?? 0,
            rejectedReturns: returns?.rejectedReturns ?? 0,
            completedRefunds: returns?.completedRefunds ?? 0,
        },
        reviews: {
            totalReviews: reviews?.totalReviews ?? 0,
            averageRating: reviews?.averageRating ?? 0,
        },
        notifications: {
            unreadNotifications: notifications?.unreadNotifications ?? 0,
        },
    };
};

/**
 * Pure mapper function that transforms raw revenue aggregation data
 * into a clean, frontend-compatible Revenue Analytics DTO.
 * Chart data is directly consumable by React chart libraries (Recharts, etc.).
 * Never exposes MongoDB _id or internal fields.
 */
export const mapRevenueAnalytics = ({ period, chartData, summary }) =>
{
    const labels = chartData.map((item) => item.label);
    const values = chartData.map((item) => item.revenue);

    return {
        period: period ?? 'monthly',
        summary: {
            totalRevenue: summary?.totalRevenue ?? 0,
            averageRevenue: summary?.averageRevenue ?? 0,
            highestRevenue: summary?.highestRevenue ?? 0,
            lowestRevenue: summary?.lowestRevenue ?? 0,
        },
        chart: {
            labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: values,
                },
            ],
        },
    };
};

/**
 * Pure mapper function that transforms raw product analytics aggregation data
 * into a clean, frontend-compatible Product Analytics DTO.
 * Never exposes MongoDB _id or internal fields.
 */
export const mapProductAnalytics = ({ overview, topSelling, lowestSelling, lowStock, outOfStock, newProducts }) =>
{
    return {
        overview: {
            totalProducts: overview?.totalProducts ?? 0,
            activeProducts: overview?.activeProducts ?? 0,
            inactiveProducts: overview?.inactiveProducts ?? 0,
            lowStockProducts: overview?.lowStockProducts ?? 0,
            outOfStockProducts: overview?.outOfStockProducts ?? 0,
        },
        topSelling: (topSelling || []).map((p) => ({
            id: p.id,
            title: p.title,
            thumbnail: p.thumbnail,
            totalSold: p.totalSold,
            revenue: p.revenue,
            remainingStock: p.remainingStock,
        })),
        lowestSelling: (lowestSelling || []).map((p) => ({
            id: p.id,
            title: p.title,
            thumbnail: p.thumbnail,
            totalSold: p.totalSold,
            remainingStock: p.remainingStock,
        })),
        lowStock: (lowStock || []).map((p) => ({
            id: p.id,
            title: p.title,
            stock: p.stock,
            status: p.stock === 0 ? 'Out of Stock' : 'Low Stock',
        })),
        outOfStock: (outOfStock || []).map((p) => ({
            id: p.id,
            title: p.title,
            thumbnail: p.thumbnail,
            category: p.category,
        })),
        newProducts: (newProducts || []).map((p) => ({
            id: p.id,
            title: p.title,
            createdAt: p.createdAt,
            status: p.status,
        })),
    };
};

/**
 * Pure mapper function that transforms raw order analytics aggregation data
 * into a clean, frontend-compatible Order Analytics DTO.
 * Never exposes MongoDB _id or internal fields.
 */
export const mapOrderAnalytics = ({ overview, revenue, statusDistribution, recentOrders, topCustomers }) =>
{
    return {
        overview: {
            totalOrders: overview?.totalOrders ?? 0,
            todayOrders: overview?.todayOrders ?? 0,
            pendingOrders: overview?.pendingOrders ?? 0,
            confirmedOrders: overview?.confirmedOrders ?? 0,
            packedOrders: overview?.packedOrders ?? 0,
            shippedOrders: overview?.shippedOrders ?? 0,
            deliveredOrders: overview?.deliveredOrders ?? 0,
            cancelledOrders: overview?.cancelledOrders ?? 0,
            returnedOrders: overview?.returnedOrders ?? 0,
        },
        revenue: {
            totalRevenue: revenue?.totalRevenue ?? 0,
            averageOrderValue: revenue?.averageOrderValue ?? 0,
            highestOrderValue: revenue?.highestOrderValue ?? 0,
            lowestOrderValue: revenue?.lowestOrderValue ?? 0,
        },
        statusDistribution: (statusDistribution || []).map((s) => ({
            status: s.status,
            count: s.count,
        })),
        recentOrders: (recentOrders || []).map((o) => ({
            id: o.id,
            orderId: o.orderId,
            customer: o.customer,
            totalAmount: o.totalAmount,
            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus,
            orderStatus: o.orderStatus,
            createdAt: o.createdAt,
        })),
        topCustomers: (topCustomers || []).map((c) => ({
            id: c.id,
            fullName: c.fullName,
            email: c.email,
            totalOrders: c.totalOrders,
            totalSpent: c.totalSpent,
        })),
    };
};

/**
 * Pure mapper function that transforms raw customer analytics aggregation data
 * into a clean, frontend-compatible Customer Analytics DTO.
 * Never exposes MongoDB _id or internal fields.
 */
export const mapCustomerAnalytics = ({ overview, growth, retention, topCustomers, newCustomers, repeatCustomers }) =>
{
    return {
        overview: {
            totalCustomers: overview?.totalCustomers ?? 0,
            newCustomers: overview?.newCustomers ?? 0,
            repeatCustomers: overview?.repeatCustomers ?? 0,
            activeCustomers: overview?.activeCustomers ?? 0,
            inactiveCustomers: overview?.inactiveCustomers ?? 0,
        },
        growth: {
            currentMonth: growth?.currentMonth ?? 0,
            previousMonth: growth?.previousMonth ?? 0,
            growthPercentage: growth?.growthPercentage ?? 0,
        },
        retention: {
            repeatPurchaseRate: retention?.repeatPurchaseRate ?? 0,
            retentionPercentage: retention?.retentionPercentage ?? 0,
        },
        topCustomers: (topCustomers || []).map((c) => ({
            id: c.id,
            fullName: c.fullName,
            email: c.email,
            mobile: c.mobile,
            totalOrders: c.totalOrders,
            totalSpent: c.totalSpent,
            lastOrderDate: c.lastOrderDate,
        })),
        newCustomers: (newCustomers || []).map((c) => ({
            id: c.id,
            fullName: c.fullName,
            email: c.email,
            firstOrderDate: c.firstOrderDate,
        })),
        repeatCustomers: (repeatCustomers || []).map((c) => ({
            id: c.id,
            fullName: c.fullName,
            totalOrders: c.totalOrders,
            totalSpent: c.totalSpent,
        })),
    };
};

/**
 * Pure mapper function that transforms raw return & refund analytics aggregation data
 * into a clean, frontend-compatible Return & Refund Analytics DTO.
 * Never exposes MongoDB _id or internal fields.
 */
export const mapReturnRefundAnalytics = ({ overview, refundSummary, statusDistribution, recentReturns, topReturnedProducts, returnReasons }) =>
{
    return {
        overview: {
            totalReturns: overview?.totalReturns ?? 0,
            approvedReturns: overview?.approvedReturns ?? 0,
            rejectedReturns: overview?.rejectedReturns ?? 0,
            pendingReturns: overview?.pendingReturns ?? 0,
            receivedReturns: overview?.receivedReturns ?? 0,
            completedRefunds: overview?.completedRefunds ?? 0,
            pendingRefunds: overview?.pendingRefunds ?? 0,
        },
        refundSummary: {
            totalRefundAmount: refundSummary?.totalRefundAmount ?? 0,
            averageRefundAmount: refundSummary?.averageRefundAmount ?? 0,
            largestRefund: refundSummary?.largestRefund ?? 0,
            smallestRefund: refundSummary?.smallestRefund ?? 0,
        },
        statusDistribution: (statusDistribution || []).map((s) => ({
            status: s.status,
            count: s.count,
        })),
        recentReturns: (recentReturns || []).map((r) => ({
            id: r.id,
            returnId: r.returnId,
            orderId: r.orderId,
            customer: r.customer,
            product: r.product,
            refundAmount: r.refundAmount,
            reason: r.reason,
            returnStatus: r.returnStatus,
            requestedAt: r.requestedAt,
        })),
        topReturnedProducts: (topReturnedProducts || []).map((p) => ({
            id: p.id,
            title: p.title,
            returnCount: p.returnCount,
            refundAmount: p.refundAmount,
        })),
        returnReasons: (returnReasons || []).map((r) => ({
            reason: r.reason,
            count: r.count,
            percentage: r.percentage,
        })),
    };
};
