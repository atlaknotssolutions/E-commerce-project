export const createSettlementRepository = ({ Settlement }) =>
{
    const create = async (data, options = {}) =>
    {
        const [settlement] = await Settlement.create([data], options);
        return settlement ? settlement.toObject() : null;
    };

    const findById = async (id, options = {}) =>
    {
        return Settlement.findById(id, null, options)
            .populate('seller', 'sellerName email businessDetails')
            .populate('payout')
            .lean();
    };

    const findByPayout = async (payoutId, options = {}) =>
    {
        return Settlement.findOne({ payout: payoutId }, null, options)
            .populate('seller', 'sellerName email businessDetails')
            .lean();
    };

    const findBySeller = async (sellerId, { page = 1, limit = 20, status, type, startDate, endDate } = {}) =>
    {
        const match = { seller: sellerId };
        if (status) match.status = status;
        if (type) match.type = type;
        if (startDate || endDate)
        {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }
        const skip = (page - 1) * limit;
        const [settlements, total] = await Promise.all([
            Settlement.find(match)
                .populate('seller', 'sellerName email businessDetails')
                .populate('payout')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Settlement.countDocuments(match),
        ]);
        return {
            settlements,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    };

    const findAll = async ({ page = 1, limit = 20, status, seller, type, startDate, endDate } = {}) =>
    {
        const match = {};
        if (status) match.status = status;
        if (seller) match.seller = seller;
        if (type) match.type = type;
        if (startDate || endDate)
        {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }
        const skip = (page - 1) * limit;
        const [settlements, total] = await Promise.all([
            Settlement.find(match)
                .populate('seller', 'sellerName email businessDetails')
                .populate('payout')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Settlement.countDocuments(match),
        ]);
        return {
            settlements,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    };

    const updateStatus = async (id, status, extra = {}, options = {}) =>
    {
        return Settlement.findByIdAndUpdate(
            id,
            { $set: { status, ...extra } },
            { ...options, new: true }
        ).populate('seller', 'sellerName email businessDetails').lean();
    };

    const getSellerSettlementStats = async (sellerId) =>
    {
        const [stats] = await Settlement.aggregate([
            { $match: { seller: sellerId } },
            {
                $group: {
                    _id: null,
                    totalSettlements: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalCompleted: {
                        $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$amount', 0] },
                    },
                    totalPending: {
                        $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, '$amount', 0] },
                    },
                    totalFailed: {
                        $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, '$amount', 0] },
                    },
                },
            },
        ]);
        return stats || { totalSettlements: 0, totalAmount: 0, totalCompleted: 0, totalPending: 0, totalFailed: 0 };
    };

    const getAdminSettlementStats = async () =>
    {
        const [stats] = await Settlement.aggregate([
            {
                $group: {
                    _id: null,
                    totalSettlements: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalCompleted: {
                        $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$amount', 0] },
                    },
                    totalPending: {
                        $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, '$amount', 0] },
                    },
                    totalFailed: {
                        $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, '$amount', 0] },
                    },
                    totalProcessing: {
                        $sum: { $cond: [{ $eq: ['$status', 'PROCESSING'] }, '$amount', 0] },
                    },
                },
            },
        ]);
        return stats || { totalSettlements: 0, totalAmount: 0, totalCompleted: 0, totalPending: 0, totalFailed: 0, totalProcessing: 0 };
    };

    const findByGatewayPayoutId = async (gatewayPayoutId) =>
    {
        return Settlement.findOne({ gatewayPayoutId }).lean();
    };

    return Object.freeze({
        create,
        findById,
        findByPayout,
        findBySeller,
        findAll,
        updateStatus,
        getSellerSettlementStats,
        getAdminSettlementStats,
        findByGatewayPayoutId,
    });
};
