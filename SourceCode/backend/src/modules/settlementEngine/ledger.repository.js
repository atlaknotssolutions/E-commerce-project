export const createLedgerRepository = ({ LedgerEntry }) => {
    const createEntry = async (data, options = {}) => {
        const [entry] = await LedgerEntry.create([data], options);
        return entry ? entry.toObject() : null;
    };

    const findBySeller = async (sellerId, { page = 1, limit = 20, type, startDate, endDate } = {}) => {
        const match = { seller: sellerId };
        if (type) match.type = type;
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }
        const skip = (page - 1) * limit;
        const [entries, total] = await Promise.all([
            LedgerEntry.find(match)
                .populate('order', 'orderId totalSellingPrice orderStatus')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            LedgerEntry.countDocuments(match),
        ]);
        return {
            entries,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    };

    const findByOrder = async (orderId) => {
        return LedgerEntry.find({ order: orderId })
            .sort({ createdAt: 1 })
            .lean();
    };

    const findAll = async ({ page = 1, limit = 20, type, seller, startDate, endDate } = {}) => {
        const match = {};
        if (type) match.type = type;
        if (seller) match.seller = seller;
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }
        const skip = (page - 1) * limit;
        const [entries, total] = await Promise.all([
            LedgerEntry.find(match)
                .populate('seller', 'sellerName email')
                .populate('order', 'orderId totalSellingPrice orderStatus')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            LedgerEntry.countDocuments(match),
        ]);
        return {
            entries,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    };

    const getSellerLedgerStats = async (sellerId) => {
        const [stats] = await LedgerEntry.aggregate([
            { $match: { seller: sellerId } },
            {
                $group: {
                    _id: null,
                    totalCredits: {
                        $sum: { $cond: [{ $eq: ['$direction', 'CREDIT'] }, '$amount', 0] },
                    },
                    totalDebits: {
                        $sum: { $cond: [{ $eq: ['$direction', 'DEBIT'] }, '$amount', 0] },
                    },
                    entryCount: { $sum: 1 },
                },
            },
        ]);
        return stats || { totalCredits: 0, totalDebits: 0, entryCount: 0 };
    };

    return Object.freeze({
        createEntry,
        findBySeller,
        findByOrder,
        findAll,
        getSellerLedgerStats,
    });
};
