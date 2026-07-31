export const createCustomerSegmentController = ({ customerSegmentService }) =>
{
    /**
     * Returns the segment for the authenticated user.
     * GET /customer/segment
     */
    const getMySegment = async (req, res) =>
    {
        const userId = req.user.id;
        const result = await customerSegmentService.getUserSegment(userId);
        res.status(200).json({ success: true, data: result });
    };

    /**
     * Refreshes metrics and reassigns segment for the authenticated user.
     * POST /customer/segment/refresh
     */
    const refreshMySegment = async (req, res) =>
    {
        const userId = req.user.id;
        const metric = await customerSegmentService.refreshMetrics(userId);
        const topCustomerIds = await customerSegmentService.getTopCustomerUserIds(10);
        const { primary } = customerSegmentService.evaluateSegments(metric, topCustomerIds);

        res.status(200).json({
            success: true,
            data: { segment: primary, refreshedAt: new Date() },
        });
    };

    /**
     * Returns segment distribution for admin dashboard.
     * GET /admin/segments/distribution
     */
    const getSegmentDistribution = async (req, res) =>
    {
        const { customerMetricRepository } = req.app.locals;
        const distribution = await customerMetricRepository.countBySegment();
        res.status(200).json({ success: true, data: distribution });
    };

    /**
     * Returns the segment for a specific user (admin).
     * GET /admin/users/:userId/segment
     */
    const getUserSegmentAdmin = async (req, res) =>
    {
        const { userId } = req.params;
        const result = await customerSegmentService.getUserSegment(userId);
        res.status(200).json({ success: true, data: result });
    };

    return Object.freeze({
        getMySegment,
        refreshMySegment,
        getSegmentDistribution,
        getUserSegmentAdmin,
    });
};
