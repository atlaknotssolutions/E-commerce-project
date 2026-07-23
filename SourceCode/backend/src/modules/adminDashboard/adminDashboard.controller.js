/**
 * Pure function-based factory representing the Admin Dashboard Analytics HTTP API Controllers.
 * Strictly enforces thin controller design principles — zero business logic.
 */
export const createAdminDashboardController = ({ adminDashboardService }) =>
{

    /**
     * Retrieves aggregated admin dashboard analytics including users, sellers,
     * customers, products, orders, revenue, and reviews.
     * Maps exactly to: GET /admin/dashboard (Admin authorization required)
     */
    const getDashboardAnalytics = async (req, res) =>
    {
        const analytics = await adminDashboardService.getDashboardAnalytics();

        res.status(200).json(analytics);
    };

    return Object.freeze({
        getDashboardAnalytics,
    });
};
