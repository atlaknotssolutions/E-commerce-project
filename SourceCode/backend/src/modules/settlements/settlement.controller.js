export const createSettlementController = ({ settlementService }) =>
{
    const getSettlement = async (req, res) =>
    {
        const settlement = await settlementService.getSettlement(req.params.id);
        res.status(200).json({ success: true, data: settlement });
    };

    const getSellerSettlements = async (req, res) =>
    {
        const { status, type, startDate, endDate, page, limit } = req.query;
        const sellerId = req.user.id;
        const result = await settlementService.getSellerSettlements(sellerId, {
            status, type, startDate, endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result.settlements, pagination: result.pagination });
    };

    const getAllSettlements = async (req, res) =>
    {
        const { status, seller, type, startDate, endDate, page, limit } = req.query;
        const result = await settlementService.getAllSettlements({
            status, seller, type, startDate, endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result.settlements, pagination: result.pagination });
    };

    const getSettlementStats = async (req, res) =>
    {
        const stats = await settlementService.getSettlementStats();
        res.status(200).json({ success: true, data: stats });
    };

    const getSellerSettlementStats = async (req, res) =>
    {
        const sellerId = req.user.id;
        const stats = await settlementService.getSellerSettlementStats(sellerId);
        res.status(200).json({ success: true, data: stats });
    };

    const exportSettlements = async (req, res) =>
    {
        const { status, seller, type, startDate, endDate } = req.query;
        const result = await settlementService.getAllSettlements({
            status, seller, type, startDate, endDate,
            page: 1,
            limit: 10000,
        });

        const csvHeader = 'ID,Seller,Type,Amount,Status,UTR,GatewayPayoutID,SettledAt,CreatedAt\n';
        const csvRows = result.settlements.map((s) =>
            [
                s._id,
                s.seller?.sellerName || '',
                s.type,
                s.amount,
                s.status,
                s.utr || '',
                s.gatewayPayoutId || '',
                s.settledAt || '',
                s.createdAt || '',
            ].join(',')
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=settlements-${Date.now()}.csv`);
        res.status(200).send(csvHeader + csvRows);
    };

    return Object.freeze({
        getSettlement,
        getSellerSettlements,
        getAllSettlements,
        getSettlementStats,
        getSellerSettlementStats,
        exportSettlements,
    });
};
