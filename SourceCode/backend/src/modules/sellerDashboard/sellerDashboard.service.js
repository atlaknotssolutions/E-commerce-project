/**
 * Pure function-based factory representing the Seller Dashboard Analytics Business Logic layer.
 * Composes data from the dashboard repository using parallel aggregation pipelines.
 * No Mongo queries inside service — all data access is delegated to the repository.
 */
export const createSellerDashboardService = ({
    sellerDashboardRepository,
    createApiError,
    mapSellerDashboardSummary,
    mapRevenueAnalytics,
    mapProductAnalytics,
    mapOrderAnalytics,
    mapCustomerAnalytics,
    mapReturnRefundAnalytics,
}) =>
{

    /**
     * Composes the complete seller dashboard summary by executing all aggregation
     * pipelines in parallel via Promise.all for maximum performance.
     * Returns a clean DTO through the mapper — never returns raw data.
     */
    const getDashboardSummary = async ({ sellerId }) =>
    {
        if (!sellerId)
        {
            throw createApiError({
                statusCode: 400,
                code: 'SELLER_ID_REQUIRED',
                message: 'Seller ID is required to fetch dashboard summary.',
            });
        }

        const [sales, orders, products, returns, reviews, notifications] = await Promise.all([
            sellerDashboardRepository.getSalesSummary({ sellerId }),
            sellerDashboardRepository.getOrderSummary({ sellerId }),
            sellerDashboardRepository.getInventorySummary({ sellerId }),
            sellerDashboardRepository.getReturnSummary({ sellerId }),
            sellerDashboardRepository.getReviewSummary({ sellerId }),
            sellerDashboardRepository.getUnreadNotificationCount({ sellerId }),
        ]);

        const summary = mapSellerDashboardSummary({
            sales,
            orders,
            products,
            returns,
            reviews,
            notifications: { unreadNotifications: notifications },
        });

        return summary;
    };

    /**
     * Valid revenue period values.
     */
    const VALID_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];

    /**
     * Maps period to the corresponding repository method.
     */
    const PERIOD_METHOD_MAP = {
        daily: 'getDailyRevenue',
        weekly: 'getWeeklyRevenue',
        monthly: 'getMonthlyRevenue',
        yearly: 'getYearlyRevenue',
    };

    /**
     * Composes the revenue analytics by executing the period-specific chart query
     * and the overall summary query in parallel via Promise.all.
     * Returns a clean DTO through the mapper — never returns raw data.
     */
    const getRevenueAnalytics = async ({ sellerId, period = 'monthly' }) =>
    {
        if (!sellerId)
        {
            throw createApiError({
                statusCode: 400,
                code: 'SELLER_ID_REQUIRED',
                message: 'Seller ID is required to fetch revenue analytics.',
            });
        }

        if (!VALID_PERIODS.includes(period))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_PERIOD',
                message: `Invalid period "${period}". Allowed values: ${VALID_PERIODS.join(', ')}.`,
            });
        }

        const repositoryMethod = PERIOD_METHOD_MAP[period];

        const [chartData, summary] = await Promise.all([
            sellerDashboardRepository[repositoryMethod]({ sellerId }),
            sellerDashboardRepository.getRevenueSummary({ sellerId }),
        ]);

        const analytics = mapRevenueAnalytics({ period, chartData, summary });

        return analytics;
    };

    /**
     * Composes the product analytics by executing all product insight queries
     * in parallel via Promise.all for maximum performance.
     * Returns a clean DTO through the mapper — never returns raw data.
     * If seller has no products, returns zeroed overview and empty arrays (no throw).
     */
    const getProductAnalytics = async ({ sellerId, threshold = 10 }) =>
    {
        if (!sellerId)
        {
            throw createApiError({
                statusCode: 400,
                code: 'SELLER_ID_REQUIRED',
                message: 'Seller ID is required to fetch product analytics.',
            });
        }

        const [
            overview,
            topSelling,
            lowestSelling,
            lowStock,
            outOfStock,
            newProducts,
        ] = await Promise.all([
            sellerDashboardRepository.getProductOverview({ sellerId, threshold }),
            sellerDashboardRepository.getTopSellingProducts({ sellerId }),
            sellerDashboardRepository.getLowestSellingProducts({ sellerId }),
            sellerDashboardRepository.getLowStockProducts({ sellerId, threshold }),
            sellerDashboardRepository.getOutOfStockProducts({ sellerId }),
            sellerDashboardRepository.getNewestProducts({ sellerId }),
        ]);

        const analytics = mapProductAnalytics({
            overview,
            topSelling,
            lowestSelling,
            lowStock,
            outOfStock,
            newProducts,
        });

        return analytics;
    };

    /**
     * Composes the order analytics by executing all order insight queries
     * in parallel via Promise.all for maximum performance.
     * Returns a clean DTO through the mapper — never returns raw data.
     * If seller has no orders, returns zeroed overview/revenue and empty arrays (no throw).
     */
    const getOrderAnalytics = async ({ sellerId }) =>
    {
        if (!sellerId)
        {
            throw createApiError({
                statusCode: 400,
                code: 'SELLER_ID_REQUIRED',
                message: 'Seller ID is required to fetch order analytics.',
            });
        }

        const [
            overview,
            revenue,
            statusDistribution,
            recentOrders,
            topCustomers,
        ] = await Promise.all([
            sellerDashboardRepository.getOrderOverview({ sellerId }),
            sellerDashboardRepository.getOrderRevenueStats({ sellerId }),
            sellerDashboardRepository.getOrderStatusDistribution({ sellerId }),
            sellerDashboardRepository.getRecentOrders({ sellerId }),
            sellerDashboardRepository.getTopCustomers({ sellerId }),
        ]);

        const analytics = mapOrderAnalytics({
            overview,
            revenue,
            statusDistribution,
            recentOrders,
            topCustomers,
        });

        return analytics;
    };

    /**
     * Composes the customer analytics by executing all customer insight queries
     * in parallel via Promise.all for maximum performance.
     * Returns a clean DTO through the mapper — never returns raw data.
     * If seller has no customers, returns zeroed overview/growth/retention and empty arrays (no throw).
     */
    const getCustomerAnalytics = async ({ sellerId }) =>
    {
        if (!sellerId)
        {
            throw createApiError({
                statusCode: 400,
                code: 'SELLER_ID_REQUIRED',
                message: 'Seller ID is required to fetch customer analytics.',
            });
        }

        const [
            overview,
            growth,
            retention,
            topCustomers,
            newCustomers,
            repeatCustomers,
        ] = await Promise.all([
            sellerDashboardRepository.getCustomerOverview({ sellerId }),
            sellerDashboardRepository.getCustomerGrowth({ sellerId }),
            sellerDashboardRepository.getCustomerRetention({ sellerId }),
            sellerDashboardRepository.getTopCustomersDetailed({ sellerId }),
            sellerDashboardRepository.getNewCustomers({ sellerId }),
            sellerDashboardRepository.getRepeatCustomers({ sellerId }),
        ]);

        const analytics = mapCustomerAnalytics({
            overview,
            growth,
            retention,
            topCustomers,
            newCustomers,
            repeatCustomers,
        });

        return analytics;
    };

    /**
     * Composes the return & refund analytics by executing all return/refund insight queries
     * in parallel via Promise.all for maximum performance.
     * Returns a clean DTO through the mapper — never returns raw data.
     * If seller has no returns, returns zeroed overview/refundSummary and empty arrays (no throw).
     */
    const getReturnRefundAnalytics = async ({ sellerId }) =>
    {
        if (!sellerId)
        {
            throw createApiError({
                statusCode: 400,
                code: 'SELLER_ID_REQUIRED',
                message: 'Seller ID is required to fetch return & refund analytics.',
            });
        }

        const [
            overview,
            refundSummary,
            statusDistribution,
            recentReturns,
            topReturnedProducts,
            returnReasons,
        ] = await Promise.all([
            sellerDashboardRepository.getReturnOverview({ sellerId }),
            sellerDashboardRepository.getRefundAnalytics({ sellerId }),
            sellerDashboardRepository.getReturnStatusDistribution({ sellerId }),
            sellerDashboardRepository.getRecentReturns({ sellerId }),
            sellerDashboardRepository.getTopReturnedProducts({ sellerId }),
            sellerDashboardRepository.getReturnReasons({ sellerId }),
        ]);

        const analytics = mapReturnRefundAnalytics({
            overview,
            refundSummary,
            statusDistribution,
            recentReturns,
            topReturnedProducts,
            returnReasons,
        });

        return analytics;
    };

    return Object.freeze({
        getDashboardSummary,
        getRevenueAnalytics,
        getProductAnalytics,
        getOrderAnalytics,
        getCustomerAnalytics,
        getReturnRefundAnalytics,
    });
};
