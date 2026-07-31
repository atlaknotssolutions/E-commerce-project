export const createSettlementEngineController = ({ settlementEngineService }) => {
    const getSellerLedger = async (req, res) => {
        const { type, startDate, endDate, page, limit } = req.query;
        const sellerId = req.user.id;
        const result = await settlementEngineService.getSellerLedger(sellerId, {
            type, startDate, endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result.entries, pagination: result.pagination });
    };

    const getOrderLedger = async (req, res) => {
        const entries = await settlementEngineService.getOrderLedger(req.params.orderId);
        res.status(200).json({ success: true, data: entries });
    };

    const getAllLedger = async (req, res) => {
        const { type, seller, startDate, endDate, page, limit } = req.query;
        const result = await settlementEngineService.getAllLedger({
            type, seller, startDate, endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result.entries, pagination: result.pagination });
    };

    const getSellerLedgerStats = async (req, res) => {
        const sellerId = req.user.id;
        const stats = await settlementEngineService.getSellerLedgerStats(sellerId);
        res.status(200).json({ success: true, data: stats });
    };

    const recalculateSettlement = async (req, res) => {
        const { orderId } = req.params;
        const result = await settlementEngineService.recalculateSettlement({ orderId });
        res.status(200).json({ success: true, data: result });
    };

    return Object.freeze({
        getSellerLedger,
        getOrderLedger,
        getAllLedger,
        getSellerLedgerStats,
        recalculateSettlement,
    });
};
