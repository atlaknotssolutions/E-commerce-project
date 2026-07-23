/**
 * Pure function-based factory representing the Admin Dashboard Analytics Business Logic layer.
 * Composes data from the dashboard repository using parallel aggregation pipelines.
 * No Mongo queries inside service — all data access is delegated to the repository.
 */
export const createAdminDashboardService = ({
    adminDashboardRepository,
    createApiError,
}) =>
{

    /**
     * Composes the complete admin dashboard analytics by executing all aggregation
     * pipelines in parallel via Promise.all for maximum performance.
     * Returns a clean DTO — never returns raw data.
     */
    const getDashboardAnalytics = async () =>
    {
        const [
            users,
            sellers,
            products,
            orders,
            revenue,
            reviews,
        ] = await Promise.all([
            adminDashboardRepository.getUserSummary(),
            adminDashboardRepository.getSellerSummary(),
            adminDashboardRepository.getProductSummary(),
            adminDashboardRepository.getOrderSummary(),
            adminDashboardRepository.getRevenueSummary(),
            adminDashboardRepository.getReviewSummary(),
        ]);

        return {
            users: {
                totalUsers: users.totalUsers,
                totalCustomers: users.totalCustomers,
                totalSellers: users.totalSellers,
                pendingSellers: sellers.pendingSellers,
            },
            sellers: {
                totalSellers: sellers.totalSellers,
                pendingSellers: sellers.pendingSellers,
            },
            customers: {
                totalCustomers: users.totalCustomers,
            },
            products: {
                totalProducts: products.totalProducts,
                activeProducts: products.activeProducts,
                outOfStockProducts: products.outOfStockProducts,
            },
            orders: {
                totalOrders: orders.totalOrders,
                deliveredOrders: orders.deliveredOrders,
                pendingOrders: orders.pendingOrders,
                cancelledOrders: orders.cancelledOrders,
            },
            revenue: {
                totalRevenue: revenue.totalRevenue,
                todayRevenue: revenue.todayRevenue,
                thisMonthRevenue: revenue.thisMonthRevenue,
                averageOrderValue: revenue.averageOrderValue,
            },
            reviews: {
                totalReviews: reviews.totalReviews,
                averageRating: reviews.averageRating,
            },
        };
    };

    return Object.freeze({
        getDashboardAnalytics,
    });
};
