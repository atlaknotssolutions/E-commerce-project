/**
 * Pure function-based factory representing the Seller Dashboard Analytics HTTP API Controllers.
 * Strictly enforces thin controller design principles — zero business logic.
 */
export const createSellerDashboardController = ({ sellerDashboardService }) =>
{

    /**
     * Retrieves aggregated seller dashboard summary including sales, orders, products,
     * returns, reviews, and notifications analytics.
     * Maps exactly to: GET /seller/dashboard/summary (Seller authorization required)
     */
    const getDashboardSummary = async (req, res) =>
    {
        const sellerId = req.user.id;

        const summary = await sellerDashboardService.getDashboardSummary({ sellerId });

        res.status(200).json(summary);
    };

    /**
     * Retrieves revenue analytics with chart data for a specific period.
     * Supports daily, weekly, monthly, yearly periods via query parameter.
     * Maps exactly to: GET /seller/dashboard/revenue (Seller authorization required)
     */
    const getRevenueAnalytics = async (req, res) =>
    {
        const sellerId = req.user.id;
        const period = req.query.period || 'monthly';

        const analytics = await sellerDashboardService.getRevenueAnalytics({ sellerId, period });

        res.status(200).json(analytics);
    };

    /**
     * Retrieves product analytics including overview, top/lowest selling,
     * low stock, out of stock, and newest products.
     * Supports optional threshold query parameter for low stock default 10.
     * Maps exactly to: GET /seller/dashboard/products (Seller authorization required)
     */
    const getProductAnalytics = async (req, res) =>
    {
        const sellerId = req.user.id;
        const threshold = parseInt(req.query.threshold, 10) || 10;

        const analytics = await sellerDashboardService.getProductAnalytics({ sellerId, threshold });

        res.status(200).json(analytics);
    };

    /**
     * Retrieves order analytics including overview, revenue stats,
     * status distribution, recent orders, and top customers.
     * Maps exactly to: GET /seller/dashboard/orders (Seller authorization required)
     */
    const getOrderAnalytics = async (req, res) =>
    {
        const sellerId = req.user.id;

        const analytics = await sellerDashboardService.getOrderAnalytics({ sellerId });

        res.status(200).json(analytics);
    };

    /**
     * Retrieves customer analytics including overview, growth, retention,
     * top customers, new customers, and repeat customers.
     * Maps exactly to: GET /seller/dashboard/customers (Seller authorization required)
     */
    const getCustomerAnalytics = async (req, res) =>
    {
        const sellerId = req.user.id;

        const analytics = await sellerDashboardService.getCustomerAnalytics({ sellerId });

        res.status(200).json(analytics);
    };

    /**
     * Retrieves return & refund analytics including overview, refund summary,
     * status distribution, recent returns, top returned products, and return reasons.
     * Maps exactly to: GET /seller/dashboard/returns (Seller authorization required)
     */
    const getReturnRefundAnalytics = async (req, res) =>
    {
        const sellerId = req.user.id;

        const analytics = await sellerDashboardService.getReturnRefundAnalytics({ sellerId });

        res.status(200).json(analytics);
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
