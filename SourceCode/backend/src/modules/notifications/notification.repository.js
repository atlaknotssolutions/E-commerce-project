/**
 * Pure function-based factory representing the Enterprise Notification Persistence layer.
 * Supports pagination, filtering, bulk operations, soft-delete archival, and aggregation.
 * Backward-compatible: all legacy methods preserved.
 */
export const createNotificationRepository = ({
    Notification,
    Order,
    PaymentOrder,
    ReturnRequest,
    Product
}) =>
{
    const createNotification = async (notificationData, options = {}) =>
    {
        const [newNotification] = await Notification.create([notificationData], options);
        return newNotification ? newNotification.toObject() : null;
    };

    const findByCustomerId = async ({ customerId }, options = {}) =>
    {
        return Notification.find({ customer: customerId, deletedAt: null }, null, options)
            .sort({ sentAt: -1 })
            .lean();
    };

    const findById = async (id, options = {}) =>
    {
        return Notification.findById(id, null, options).lean();
    };

    const markAsRead = async ({ id }, options = {}) =>
    {
        return Notification.findByIdAndUpdate(
            id,
            { readStatus: true, readAt: new Date() },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    const deleteNotification = async (id, options = {}) =>
    {
        return Notification.findByIdAndDelete(id, options).lean();
    };

    // ==========================================
    // SELLER NOTIFICATION METHODS
    // ==========================================

    const findSellerNotifications = async ({ sellerId, limit = 50, offset = 0 }) =>
    {
        return Notification.find({ customer: sellerId, deletedAt: null })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean();
    };

    const countUnreadSellerNotifications = async ({ sellerId }) =>
    {
        return Notification.countDocuments({
            customer: sellerId,
            readStatus: false,
            deletedAt: null,
        });
    };

    const markSellerNotificationAsRead = async ({ notificationId, sellerId }) =>
    {
        return Notification.findOneAndUpdate(
            { _id: notificationId, customer: sellerId },
            { readStatus: true, readAt: new Date() },
            { new: true, runValidators: true }
        ).lean();
    };

    const markAllSellerNotificationsAsRead = async ({ sellerId }) =>
    {
        return Notification.updateMany(
            { customer: sellerId, readStatus: false, deletedAt: null },
            { readStatus: true, readAt: new Date() }
        );
    };

    const deleteSellerNotification = async ({ notificationId, sellerId }) =>
    {
        return Notification.findOneAndDelete({
            _id: notificationId,
            customer: sellerId
        }).lean();
    };

    const findRecentSellerActivities = async ({ sellerId, limit = 20 }) =>
    {
        const activities = [];

        const recentOrders = await Order.find({ seller: sellerId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('_id orderId orderStatus createdAt totalSellingPrice')
            .lean();

        recentOrders.forEach(order =>
        {
            activities.push({
                _id: order._id,
                type: 'NEW_ORDER',
                title: `Order ${order.orderId || order._id} received`,
                description: `New order placed for ₹${order.totalSellingPrice || 0}`,
                timestamp: order.createdAt,
                metadata: { orderId: order._id, amount: order.totalSellingPrice }
            });
        });

        const sellerOrderIds = recentOrders.map(o => o._id);

        if (sellerOrderIds.length > 0)
        {
            const recentPayments = await PaymentOrder.find({ orders: { $in: sellerOrderIds } })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('_id status createdAt amount orders')
                .lean();

            recentPayments.forEach(payment =>
            {
                if (payment.status === 'COMPLETED')
                {
                    activities.push({
                        _id: payment._id,
                        type: 'PAYMENT_RECEIVED',
                        title: `Payment of ₹${payment.amount || 0} confirmed`,
                        description: `Payment received and confirmed`,
                        timestamp: payment.createdAt,
                        metadata: { paymentId: payment._id, amount: payment.amount }
                    });
                }
            });
        }

        const recentReturns = await ReturnRequest.find({ seller: sellerId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('_id returnId returnStatus createdAt reason')
            .lean();

        recentReturns.forEach(returnReq =>
        {
            activities.push({
                _id: returnReq._id,
                type: 'RETURN_REQUEST',
                title: `Return request ${returnReq.returnId || returnReq._id}`,
                description: `Return requested: ${returnReq.reason || 'No reason provided'}`,
                timestamp: returnReq.createdAt,
                metadata: { returnId: returnReq._id, returnRequestId: returnReq.returnId }
            });
        });

        const recentProducts = await Product.find({ seller: sellerId })
            .sort({ updatedAt: -1 })
            .limit(limit)
            .select('_id title approvalStatus updatedAt sellingPrice')
            .lean();

        recentProducts.forEach(product =>
        {
            activities.push({
                _id: product._id,
                type: 'PRODUCT_UPDATE',
                title: `Product "${product.title}" updated`,
                description: `Product status: ${product.approvalStatus || 'updated'}`,
                timestamp: product.updatedAt,
                metadata: { productId: product._id, productName: product.title }
            });
        });

        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return activities.slice(0, limit);
    };

    // ==========================================
    // ENTERPRISE NOTIFICATION METHODS
    // ==========================================

    const findByRecipient = async ({ recipientId, page = 1, limit = 20, type = null } = {}) =>
    {
        const filter = { $or: [{ recipient: recipientId }, { customer: recipientId }], deletedAt: null };
        if (type) filter.type = type;

        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification.countDocuments(filter),
        ]);

        return { notifications, total, page, limit };
    };

    const countUnreadByRecipient = async ({ recipientId }) =>
    {
        const filter = {
            $or: [{ recipient: recipientId }, { customer: recipientId }],
            readStatus: false,
            deletedAt: null,
        };
        return Notification.countDocuments(filter);
    };

    const markAsReadByRecipient = async ({ notificationId, recipientId }) =>
    {
        return Notification.findOneAndUpdate(
            {
                _id: notificationId,
                $or: [{ recipient: recipientId }, { customer: recipientId }],
                deletedAt: null,
            },
            { readStatus: true, readAt: new Date() },
            { new: true, runValidators: true }
        ).lean();
    };

    const markAllAsReadByRecipient = async ({ recipientId }) =>
    {
        return Notification.updateMany(
            {
                $or: [{ recipient: recipientId }, { customer: recipientId }],
                readStatus: false,
                deletedAt: null,
            },
            { readStatus: true, readAt: new Date() }
        );
    };

    const softDelete = async ({ notificationId, recipientId }) =>
    {
        const filter = { _id: notificationId, deletedAt: null };
        if (recipientId)
        {
            filter.$or = [{ recipient: recipientId }, { customer: recipientId }];
        }
        return Notification.findOneAndUpdate(
            filter,
            { deletedAt: new Date() },
            { new: true }
        ).lean();
    };

    const bulkCreate = async (notificationsData, options = {}) =>
    {
        if (!notificationsData.length) return [];
        const created = await Notification.insertMany(notificationsData, options);
        return created.map(doc => doc.toObject());
    };

    const findScheduled = async (options = {}) =>
    {
        return Notification.find({
            scheduledAt: { $lte: new Date() },
            status: 'PENDING',
            deletedAt: null,
        }).lean();
    };

    const updateStatus = async ({ id, status, channelHistoryEntry = null }, options = {}) =>
    {
        const update = { status };
        if (channelHistoryEntry)
        {
            update.$push = { channelHistory: channelHistoryEntry };
        }
        if (status === 'DELIVERED')
        {
            update.deliveredAt = new Date();
        }
        return Notification.findByIdAndUpdate(id, update, { ...options, new: true }).lean();
    };

    const incrementRetryCount = async (id, options = {}) =>
    {
        return Notification.findByIdAndUpdate(
            id,
            { $inc: { retryCount: 1 }, status: 'RETRYING' },
            { ...options, new: true }
        ).lean();
    };

    const findByStatus = async ({ status, limit = 50 } = {}, options = {}) =>
    {
        return Notification.find({ status, deletedAt: null }, null, options)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    };

    const countByType = async ({ startDate, endDate } = {}, options = {}) =>
    {
        const match = { deletedAt: null };
        if (startDate || endDate)
        {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }

        return Notification.aggregate([
            { $match: match },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
    };

    return Object.freeze({
        createNotification,
        findByCustomerId,
        findById,
        markAsRead,
        delete: deleteNotification,
        findSellerNotifications,
        countUnreadSellerNotifications,
        markSellerNotificationAsRead,
        markAllSellerNotificationsAsRead,
        deleteSellerNotification,
        findRecentSellerActivities,
        findByRecipient,
        countUnreadByRecipient,
        markAsReadByRecipient,
        markAllAsReadByRecipient,
        softDelete,
        bulkCreate,
        findScheduled,
        updateStatus,
        incrementRetryCount,
        findByStatus,
        countByType,
    });
};
