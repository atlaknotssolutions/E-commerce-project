/**
 * Pure function-based factory representing the ReturnRequest Persistence database interface.
 * Decouples database collections lookup pipelines using Dependency Injection.
 */
export const createReturnRequestRepository = ({ ReturnRequest, User, Seller }) =>
{

    /**
     * Commits a new return request document directly into database.
     */
    const create = async (returnData, options = {}) =>
    {
        const [newReturn] = await ReturnRequest.create([returnData], options);
        return newReturn ? newReturn.toObject() : null;
    };

    /**
     * Discovers a single return request document by its unique database ObjectId.
     */
    const findById = async (id, options = {}) =>
    {
        return ReturnRequest.findById(id, null, options)
            .populate('order', 'orderId orderStatus totalSellingPrice')
            .populate('customer', 'fullName email mobile')
            .populate('seller', 'sellerName email mobile businessDetails')
            .populate('productId', 'title images sellingPrice')
            .lean();
    };

    /**
     * Pulls all return requests linked to a specific order.
     */
    const findByOrder = async ({ orderId }, options = {}) =>
    {
        return ReturnRequest.find({ order: orderId }, null, options)
            .sort({ requestedAt: -1 })
            .populate('customer', 'fullName email mobile')
            .populate('seller', 'sellerName email mobile businessDetails')
            .populate('productId', 'title images sellingPrice')
            .lean();
    };

    /**
     * Pulls customer return request history sorted newest first.
     */
    const findByCustomer = async ({ customerId }, options = {}) =>
    {
        return ReturnRequest.find({ customer: customerId }, null, options)
            .sort({ requestedAt: -1 })
            .populate('order', 'orderId orderStatus')
            .populate('seller', 'sellerName email mobile businessDetails')
            .populate('productId', 'title images sellingPrice')
            .lean();
    };

    /**
     * Pulls merchant return request board sorted newest first.
     */
    const findBySeller = async ({ sellerId }, options = {}) =>
    {
        return ReturnRequest.find({ seller: sellerId }, null, options)
            .sort({ requestedAt: -1 })
            .populate('order', 'orderId orderStatus')
            .populate('customer', 'fullName email mobile')
            .populate('productId', 'title images sellingPrice')
            .lean();
    };

    /**
     * Finds a return request by order and specific order item.
     * Used to prevent duplicate return requests for the same item.
     */
    const findByOrderAndItem = async ({ orderId, orderItemId }, options = {}) =>
    {
        return ReturnRequest.findOne(
            { order: orderId, orderItemId },
            null,
            options
        ).lean();
    };

    /**
     * Updates return status and appends a history entry atomically.
     */
    const updateStatus = async ({ returnId, returnStatus, historyEntry, sellerNote, resolvedAt }, options = {}) =>
    {
        const updateOps = {
            returnStatus,
            $push: { returnHistory: historyEntry },
        };

        if (sellerNote !== undefined) updateOps.sellerNote = sellerNote;
        if (resolvedAt) updateOps.resolvedAt = resolvedAt;

        return ReturnRequest.findByIdAndUpdate(
            returnId,
            updateOps,
            {
                ...options,
                new: true,
                runValidators: true,
            }
        )
            .populate('order', 'orderId orderStatus totalSellingPrice')
            .populate('customer', 'fullName email mobile')
            .populate('seller', 'sellerName email mobile businessDetails')
            .populate('productId', 'title images sellingPrice')
            .lean();
    };

    /**
     * Updates refund amount on a return request after refund calculation.
     */
    const updateWithRefund = async ({ returnId, refundAmount }, options = {}) =>
    {
        return ReturnRequest.findByIdAndUpdate(
            returnId,
            { refundAmount },
            {
                ...options,
                new: true,
                runValidators: true,
            }
        ).lean();
    };

    // ==========================================
    // ADMIN-SPECIFIC QUERIES
    // ==========================================

    /**
     * Discovers all return requests across the platform with search, filters, and pagination.
     * Used exclusively by admin return management.
     */
    const findAllReturns = async ({ page = 1, limit = 20, search, returnStatus, sellerId, customerId, sortBy = 'requestedAt', sortOrder = 'desc' } = {}) =>
    {
        const filter = {};

        if (returnStatus)
        {
            filter.returnStatus = returnStatus;
        }
        if (sellerId)
        {
            filter.seller = sellerId;
        }
        if (customerId)
        {
            filter.customer = customerId;
        }

        if (search)
        {
            const customerMatches = await User
                .find({ $or: [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] })
                .select('_id')
                .lean();
            const customerIds = customerMatches.map((u) => u._id);

            const sellerMatches = await Seller
                .find({ $or: [{ sellerName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] })
                .select('_id')
                .lean();
            const sellerIds = sellerMatches.map((s) => s._id);

            filter.$or = [
                { returnId: { $regex: search, $options: 'i' } },
                { reason: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                ...(customerIds.length ? [{ customer: { $in: customerIds } }] : []),
                ...(sellerIds.length ? [{ seller: { $in: sellerIds } }] : []),
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([
            ReturnRequest.find(filter, null, { lean: true })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('order', 'orderId orderStatus totalSellingPrice')
                .populate('customer', 'fullName email mobile')
                .populate('seller', 'sellerName email mobile businessDetails')
                .populate('productId', 'title images sellingPrice'),
            ReturnRequest.countDocuments(filter),
        ]);

        return {
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    };

    /**
     * Counts return requests grouped by status for analytics.
     */
    const countReturnsByStatus = async () =>
    {
        const counts = await ReturnRequest.aggregate([
            { $group: { _id: '$returnStatus', count: { $sum: 1 } } },
        ]);

        const result = {
            REQUESTED: 0,
            APPROVED: 0,
            REJECTED: 0,
            ITEM_RECEIVED: 0,
            REFUND_COMPLETED: 0,
            total: 0,
        };

        for (const item of counts)
        {
            if (result[item._id] !== undefined)
            {
                result[item._id] = item.count;
            }
            result.total += item.count;
        }

        return result;
    };

    /**
     * Computes aggregate refund amount statistics for analytics.
     */
    const getReturnRefundStats = async () =>
    {
        const stats = await ReturnRequest.aggregate([
            {
                $group: {
                    _id: null,
                    totalRefundAmount: { $sum: '$refundAmount' },
                    avgRefundAmount: { $avg: '$refundAmount' },
                    maxRefundAmount: { $max: '$refundAmount' },
                    minRefundAmount: { $min: '$refundAmount' },
                },
            },
        ]);

        return stats[0] || { totalRefundAmount: 0, avgRefundAmount: 0, maxRefundAmount: 0, minRefundAmount: 0 };
    };

    /**
     * Returns return requests grouped by reason for analytics breakdown.
     */
    const countReturnsByReason = async () =>
    {
        const counts = await ReturnRequest.aggregate([
            { $group: { _id: '$reason', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        return counts.map((item) => ({ reason: item._id, count: item.count }));
    };

    return Object.freeze({
        create,
        findById,
        findByOrder,
        findByCustomer,
        findBySeller,
        findByOrderAndItem,
        updateStatus,
        updateWithRefund,
        findAllReturns,
        countReturnsByStatus,
        getReturnRefundStats,
        countReturnsByReason,
    });
};
