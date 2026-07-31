export const createGatewayController = ({ gatewayService }) => {

    const handlePayoutWebhook = async (req, res) => {
        const result = await gatewayService.handlePayoutWebhook(req.body);
        res.status(200).json({ success: true, data: result });
    };

    const handleRefundWebhook = async (req, res) => {
        const result = await gatewayService.handleRefundWebhook(req.body);
        res.status(200).json({ success: true, data: result });
    };

    const getDashboard = async (req, res) => {
        const { gateway, entityType, since } = req.query;
        const dashboard = await gatewayService.getDashboard({ gateway, entityType, since });
        res.status(200).json({ success: true, data: dashboard });
    };

    const getEvents = async (req, res) => {
        const { gateway, entityType, gatewayStatus, startDate, endDate, page, limit } = req.query;
        const result = await gatewayService.getEvents({
            gateway,
            entityType,
            gatewayStatus,
            startDate,
            endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result.events, pagination: result.pagination });
    };

    const getTimeline = async (req, res) => {
        const { entityType, entityId } = req.params;
        const timeline = await gatewayService.getTimeline(entityType, entityId);
        res.status(200).json({ success: true, data: timeline });
    };

    const handleRazorpayXWebhook = async (req, res) => {
        const result = await gatewayService.handleRazorpayXWebhook(req.body);
        res.status(200).json({ success: true, data: result });
    };

    const retryPayout = async (req, res) => {
        const result = await gatewayService.retryPayout(req.params.id);
        res.status(200).json({ success: true, data: result });
    };

    const getHealth = async (req, res) => {
        const health = await gatewayService.getHealth();
        res.status(200).json({ success: true, data: health });
    };

    return Object.freeze({
        handlePayoutWebhook,
        handleRefundWebhook,
        handleRazorpayXWebhook,
        getDashboard,
        getEvents,
        getTimeline,
        retryPayout,
        getHealth,
    });
};
