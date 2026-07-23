export const createCommissionRepository = ({ Commission }) => {
    const create = async (data) => {
        const commission = await Commission.create(data);
        return Commission.findById(commission._id)
            .populate('order', 'orderId totalSellingPrice')
            .populate('seller', 'companyName email')
            .populate('customer', 'fullName email')
            .lean();
    };

    const findById = async (id) => {
        return Commission.findById(id)
            .populate('order', 'orderId totalSellingPrice totalMrpPrice orderStatus')
            .populate('seller', 'companyName email')
            .populate('customer', 'fullName email')
            .lean();
    };

    const findByOrder = async (orderId) => {
        return Commission.findOne({ order: orderId })
            .populate('order', 'orderId totalSellingPrice')
            .populate('seller', 'companyName email')
            .populate('customer', 'fullName email')
            .lean();
    };

    const findBySeller = async (sellerId, { page = 1, limit = 20, status, search } = {}) => {
        const match = { seller: sellerId };
        if (status) match.status = status;
        if (search) {
            match.$or = [
                { orderId: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [commissions, total] = await Promise.all([
            Commission.find(match)
                .populate('order', 'orderId totalSellingPrice')
                .populate('seller', 'companyName email')
                .populate('customer', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Commission.countDocuments(match),
        ]);
        return {
            commissions,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    };

    const findAll = async ({ page = 1, limit = 20, status, seller, search, startDate, endDate } = {}) => {
        const match = {};
        if (status) match.status = status;
        if (seller) match.seller = seller;
        if (search) {
            match.$or = [
                { orderId: { $regex: search, $options: 'i' } },
            ];
        }
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }
        const skip = (page - 1) * limit;
        const [commissions, total] = await Promise.all([
            Commission.find(match)
                .populate('order', 'orderId totalSellingPrice')
                .populate('seller', 'companyName email')
                .populate('customer', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Commission.countDocuments(match),
        ]);
        return {
            commissions,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    };

    const updateStatus = async (id, status) => {
        return Commission.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true }
        )
            .populate('order', 'orderId totalSellingPrice')
            .populate('seller', 'companyName email')
            .populate('customer', 'fullName email')
            .lean();
    };

    const getSellerCommissionStats = async (sellerId) => {
        const [stats] = await Promise.all([
            Commission.aggregate([
                { $match: { seller: sellerId } },
                {
                    $group: {
                        _id: null,
                        totalCommissions: { $sum: 1 },
                        totalOrderAmount: { $sum: '$orderAmount' },
                        totalCommissionAmount: { $sum: '$commissionAmount' },
                        totalGstAmount: { $sum: '$gstAmount' },
                        totalSellerAmount: { $sum: '$sellerAmount' },
                    },
                },
            ]),
        ]);
        const result = stats.length > 0 ? stats[0] : {
            totalCommissions: 0,
            totalOrderAmount: 0,
            totalCommissionAmount: 0,
            totalGstAmount: 0,
            totalSellerAmount: 0,
        };
        delete result._id;
        return result;
    };

    const getAdminCommissionStats = async () => {
        const [stats] = await Promise.all([
            Commission.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCommissions: { $sum: 1 },
                        totalOrderAmount: { $sum: '$orderAmount' },
                        totalCommissionAmount: { $sum: '$commissionAmount' },
                        totalGstAmount: { $sum: '$gstAmount' },
                        totalSellerAmount: { $sum: '$sellerAmount' },
                    },
                },
            ]),
            Commission.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
        ]);
        const result = stats.length > 0 ? {
            totalCommissions: stats[0].totalCommissions || 0,
            totalOrderAmount: stats[0].totalOrderAmount || 0,
            totalCommissionAmount: stats[0].totalCommissionAmount || 0,
            totalGstAmount: stats[0].totalGstAmount || 0,
            totalSellerAmount: stats[0].totalSellerAmount || 0,
        } : {
            totalCommissions: 0,
            totalOrderAmount: 0,
            totalCommissionAmount: 0,
            totalGstAmount: 0,
            totalSellerAmount: 0,
        };
        const statusCounts = {};
        if (stats.length > 1) {
            stats[1].forEach((item) => { statusCounts[item._id] = item.count; });
        }
        return { ...result, statusCounts };
    };

    return Object.freeze({
        create,
        findById,
        findByOrder,
        findBySeller,
        findAll,
        updateStatus,
        getSellerCommissionStats,
        getAdminCommissionStats,
    });
};
