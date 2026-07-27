import { PAYOUT_STATUS } from '../../constants/enums.js';

export const createPayoutRepository = ({ Payout }) => {
    const create = async (data) => {
        const payout = await Payout.create(data);
        return Payout.findById(payout._id)
            .populate('seller', 'sellerName businessDetails email')
            .populate('approvedBy', 'fullName email')
            .lean();
    };

    const findById = async (id) => {
        return Payout.findById(id)
            .populate('seller', 'sellerName businessDetails email')
            .populate('approvedBy', 'fullName email')
            .lean();
    };

    const findBySeller = async (sellerId, { page = 1, limit = 20, status } = {}) => {
        const match = { seller: sellerId };
        if (status) match.status = status;
        const skip = (page - 1) * limit;
        const [payouts, total] = await Promise.all([
            Payout.find(match)
                .populate('seller', 'sellerName businessDetails email')
                .populate('approvedBy', 'fullName email')
                .sort({ requestedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Payout.countDocuments(match),
        ]);
        return {
            payouts,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    };

    const findAll = async ({ page = 1, limit = 20, status, seller, search, startDate, endDate } = {}) => {
        const match = {};
        if (status) match.status = status;
        if (seller) match.seller = seller;
        if (startDate || endDate) {
            match.requestedAt = {};
            if (startDate) match.requestedAt.$gte = new Date(startDate);
            if (endDate) match.requestedAt.$lte = new Date(endDate);
        }
        const skip = (page - 1) * limit;
        const [payouts, total] = await Promise.all([
            Payout.find(match)
                .populate('seller', 'sellerName businessDetails email')
                .populate('approvedBy', 'fullName email')
                .sort({ requestedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Payout.countDocuments(match),
        ]);
        return {
            payouts,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    };

    const updateStatus = async (id, status, extra = {}, options = {}) => {
        return Payout.findByIdAndUpdate(
            id,
            { $set: { status, ...extra } },
            { ...options, new: true }
        )
            .populate('seller', 'sellerName businessDetails email')
            .populate('approvedBy', 'fullName email')
            .lean();
    };

    const updateGatewayStatus = async (id, { gateway, gatewayPayoutId, referenceId, gatewayStatus, gatewayEventId }, options = {}) => {
        const $set = {};
        if (gateway !== undefined) $set.gateway = gateway;
        if (gatewayPayoutId !== undefined) $set.gatewayPayoutId = gatewayPayoutId;
        if (referenceId !== undefined) $set.referenceId = referenceId;
        if (gatewayStatus !== undefined) $set.gatewayStatus = gatewayStatus;
        if (gatewayEventId !== undefined) $set.gatewayEventId = gatewayEventId;

        return Payout.findByIdAndUpdate(id, { $set }, { ...options, new: true })
            .populate('seller', 'sellerName businessDetails email')
            .populate('approvedBy', 'fullName email')
            .lean();
    };

    const getPendingBySeller = async (sellerId) => {
        return Payout.findOne({ seller: sellerId, status: PAYOUT_STATUS.PENDING })
            .lean();
    };

    const getTotalPayoutBySeller = async (sellerId) => {
        const [result] = await Payout.aggregate([
            { $match: { seller: sellerId, status: { $in: [PAYOUT_STATUS.PENDING, PAYOUT_STATUS.APPROVED] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return result ? result.total : 0;
    };

    const getTotalCompletedPayoutBySeller = async (sellerId) => {
        const [result] = await Payout.aggregate([
            { $match: { seller: sellerId, status: PAYOUT_STATUS.COMPLETED } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return result ? result.total : 0;
    };

    const getSellerPayoutStats = async (sellerId) => {
        const [stats] = await Payout.aggregate([
            { $match: { seller: sellerId } },
            {
                $group: {
                    _id: null,
                    totalPayouts: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalCompleted: {
                        $sum: { $cond: [{ $eq: ['$status', PAYOUT_STATUS.COMPLETED] }, '$amount', 0] },
                    },
                    totalPending: {
                        $sum: { $cond: [{ $eq: ['$status', PAYOUT_STATUS.PENDING] }, '$amount', 0] },
                    },
                    totalApproved: {
                        $sum: { $cond: [{ $eq: ['$status', PAYOUT_STATUS.APPROVED] }, '$amount', 0] },
                    },
                    totalRejected: {
                        $sum: { $cond: [{ $eq: ['$status', PAYOUT_STATUS.REJECTED] }, '$amount', 0] },
                    },
                },
            },
        ]);
        return stats || {
            totalPayouts: 0,
            totalAmount: 0,
            totalCompleted: 0,
            totalPending: 0,
            totalApproved: 0,
            totalRejected: 0,
        };
    };

    const getAdminPayoutStats = async () => {
        const [stats] = await Payout.aggregate([
            {
                $group: {
                    _id: null,
                    totalPayouts: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalCompleted: {
                        $sum: { $cond: [{ $eq: ['$status', PAYOUT_STATUS.COMPLETED] }, '$amount', 0] },
                    },
                    totalPending: {
                        $sum: { $cond: [{ $eq: ['$status', PAYOUT_STATUS.PENDING] }, '$amount', 0] },
                    },
                    totalApproved: {
                        $sum: { $cond: [{ $eq: ['$status', PAYOUT_STATUS.APPROVED] }, '$amount', 0] },
                    },
                    totalRejected: {
                        $sum: { $cond: [{ $eq: ['$status', PAYOUT_STATUS.REJECTED] }, '$amount', 0] },
                    },
                },
            },
        ]);
        const result = stats || {
            totalPayouts: 0,
            totalAmount: 0,
            totalCompleted: 0,
            totalPending: 0,
            totalApproved: 0,
            totalRejected: 0,
        };
        delete result._id;
        return result;
    };

    const countByStatus = async (status) => {
        return Payout.countDocuments({ status });
    };

    const countByGatewayStatus = async (gatewayStatus) => {
        return Payout.countDocuments({ gatewayStatus });
    };

    const claimForDisbursement = async (id, gatewayData) => {
        return Payout.findOneAndUpdate(
            {
                _id: id,
                status: PAYOUT_STATUS.APPROVED,
                gatewayPayoutId: null,
            },
            { $set: gatewayData },
            { new: true }
        )
            .populate('seller', 'sellerName businessDetails email')
            .populate('approvedBy', 'fullName email')
            .lean();
    };

    return Object.freeze({
        create,
        findById,
        findBySeller,
        findAll,
        updateStatus,
        updateGatewayStatus,
        getPendingBySeller,
        getTotalPayoutBySeller,
        getTotalCompletedPayoutBySeller,
        getSellerPayoutStats,
        getAdminPayoutStats,
        countByStatus,
        countByGatewayStatus,
        claimForDisbursement,
    });
};
