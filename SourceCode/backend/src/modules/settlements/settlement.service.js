export const createSettlementService = ({
    settlementRepository,
    payoutRepository,
    sellerRepository,
    createApiError,
    mapSettlement,
    mapSettlements,
}) =>
{
    const getSettlement = async (id) =>
    {
        const settlement = await settlementRepository.findById(id);
        if (!settlement)
        {
            throw createApiError({ statusCode: 404, message: 'Settlement not found' });
        }
        return mapSettlement(settlement);
    };

    const getSellerSettlements = async (sellerId, filters) =>
    {
        const result = await settlementRepository.findBySeller(sellerId, filters);
        return {
            settlements: mapSettlements(result.settlements),
            pagination: result.pagination,
        };
    };

    const getAllSettlements = async (filters) =>
    {
        const result = await settlementRepository.findAll(filters);
        return {
            settlements: mapSettlements(result.settlements),
            pagination: result.pagination,
        };
    };

    const getSettlementStats = async () =>
    {
        return await settlementRepository.getAdminSettlementStats();
    };

    const getSellerSettlementStats = async (sellerId) =>
    {
        return await settlementRepository.getSellerSettlementStats(sellerId);
    };

    const createSettlementRecord = async ({ payoutId, sellerId, type, amount, gatewayPayoutId, referenceId, bankAccount }) =>
    {
        return settlementRepository.create({
            payout: payoutId,
            seller: sellerId,
            type,
            amount,
            status: 'PROCESSING',
            gatewayPayoutId,
            referenceId,
            bankAccount,
        });
    };

    const completeSettlement = async (settlementId, { utr, gatewaySettlementId, settledAt } = {}) =>
    {
        return settlementRepository.updateStatus(settlementId, 'COMPLETED', {
            utr: utr || null,
            gatewaySettlementId: gatewaySettlementId || null,
            settledAt: settledAt || new Date(),
        });
    };

    const failSettlement = async (settlementId, reason) =>
    {
        return settlementRepository.updateStatus(settlementId, 'FAILED', {
            'metadata.failureReason': reason,
        });
    };

    return Object.freeze({
        getSettlement,
        getSellerSettlements,
        getAllSettlements,
        getSettlementStats,
        getSellerSettlementStats,
        createSettlementRecord,
        completeSettlement,
        failSettlement,
    });
};
