/**
 * Pure function-based factory representing the Refund Persistence database interface.
 * Decouples database collections lookup pipelines using Dependency Injection.
 */
export const createRefundRepository = ({ Refund }) =>
{

    /**
     * Commits a new refund document directly into database.
     */
    const create = async (refundData, options = {}) =>
    {
        const [newRefund] = await Refund.create([refundData], options);
        return newRefund ? newRefund.toObject() : null;
    };

    /**
     * Discovers a single refund document by its unique database ObjectId.
     */
    const findById = async (id, options = {}) =>
    {
        return Refund.findById(id, null, options)
            .populate('returnRequestId', 'returnId returnStatus')
            .populate('orderId', 'orderId')
            .lean();
    };

    /**
     * Finds the refund linked to a specific return request.
     */
    const findByReturnRequestId = async ({ returnRequestId }, options = {}) =>
    {
        return Refund.findOne({ returnRequestId }, null, options).lean();
    };

    /**
     * Finds the refund linked to a specific order.
     */
    const findByOrderId = async ({ orderId }, options = {}) =>
    {
        return Refund.findOne({ orderId }, null, options).lean();
    };

    // ==========================================
    // ADMIN-SPECIFIC QUERIES
    // ==========================================

    /**
     * Discovers all refunds across the platform with search, filters, and pagination.
     * Used exclusively by admin refund management.
     */
    const findAllRefunds = async ({ page = 1, limit = 20, search, status, method, sortBy = 'createdAt', sortOrder = 'desc' } = {}) =>
    {
        const filter = {};

        if (status)
        {
            filter.status = status;
        }
        if (method)
        {
            filter.method = method;
        }

        if (search)
        {
            filter.$or = [
                { providerRefundId: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([
            Refund.find(filter, null, { lean: true })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'returnRequestId',
                    select: 'returnId returnStatus refundAmount reason customer seller order productId',
                    populate: [
                        { path: 'customer', select: 'fullName email mobile' },
                        { path: 'seller', select: 'sellerName email businessDetails' },
                        { path: 'order', select: 'orderId orderStatus' },
                        { path: 'productId', select: 'title images sellingPrice' },
                    ],
                })
                .populate('orderId', 'orderId orderStatus totalSellingPrice')
                .populate('paymentOrderId', 'amount status paymentMethod providerPaymentId'),
            Refund.countDocuments(filter),
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
     * Counts refunds grouped by status for analytics.
     */
    const countRefundsByStatus = async () =>
    {
        const counts = await Refund.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const result = {
            PENDING: 0,
            PROCESSING: 0,
            COMPLETED: 0,
            FAILED: 0,
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
    const getRefundAggregateStats = async () =>
    {
        const stats = await Refund.aggregate([
            {
                $group: {
                    _id: null,
                    totalRefundAmount: { $sum: '$amount' },
                    avgRefundAmount: { $avg: '$amount' },
                    maxRefundAmount: { $max: '$amount' },
                    minRefundAmount: { $min: '$amount' },
                },
            },
        ]);

        return stats[0] || { totalRefundAmount: 0, avgRefundAmount: 0, maxRefundAmount: 0, minRefundAmount: 0 };
    };

    return Object.freeze({
        create,
        findById,
        findByReturnRequestId,
        findByOrderId,
        findAllRefunds,
        countRefundsByStatus,
        getRefundAggregateStats,
    });
};
