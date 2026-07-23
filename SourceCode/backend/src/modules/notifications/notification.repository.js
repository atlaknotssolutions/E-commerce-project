/**
 * Pure function-based factory representing the Notification Persistence database interface.
 * Decouples database collections lookup pipelines using Dependency Injection.
 */
export const createNotificationRepository = ({
    Notification,
    Order,
    PaymentOrder,
    ReturnRequest,
    Product
}) =>
{

    /**
     * Commits a new in-app alert notification document directly into database.
     * Supports array-wrap configurations to run smoothly inside transactions.
     */
    const createNotification = async (notificationData, options = {}) =>
    {
        const [newNotification] = await Notification.create([notificationData], options);
        return newNotification ? newNotification.toObject() : null;
    };

    /**
     * Pulls customer-specific notification statements chronologically descending (newest first).
     */
    const findByCustomerId = async ({ customerId }, options = {}) =>
    {
        return Notification.find({ customer: customerId }, null, options)
            .sort({ sentAt: -1 }) // Sorts chronologically newest first
            .lean(); // Returns plain lightweight JS objects for fast memory rendering
    };

    /**
     * Commits operational read status update (readStatus: true) atomically on specific notification document.
     */
    const markAsRead = async ({ id }, options = {}) =>
    {
        return Notification.findByIdAndUpdate(
            id,
            { readStatus: true },
            { ...options, new: true, runValidators: true } // Returns updated record enforcing schema validations
        ).lean();
    };

    /**
     * Erases a notification document permanently from the collection.
     */
    const deleteNotification = async (id, options = {}) =>
    {
        return Notification.findByIdAndDelete(id, options).lean();
    };

    // ==========================================
    // SELLER NOTIFICATION METHODS
    // ==========================================

    /**
     * Finds seller-specific notifications limited to 50 most recent.
     * Notifications are stored with seller userId in the customer field.
     */
    const findSellerNotifications = async ({ sellerId, limit = 50, offset = 0 }) =>
    {
        return Notification.find({ customer: sellerId })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean();
    };

    /**
     * Counts unread notifications for a specific seller.
     */
    const countUnreadSellerNotifications = async ({ sellerId }) =>
    {
        return Notification.countDocuments({
            customer: sellerId,
            readStatus: false
        });
    };

    /**
     * Marks a single notification as read with ownership verification.
     * Returns null if notification doesn't exist or doesn't belong to seller.
     */
    const markSellerNotificationAsRead = async ({ notificationId, sellerId }) =>
    {
        return Notification.findOneAndUpdate(
            { _id: notificationId, customer: sellerId },
            { readStatus: true },
            { new: true, runValidators: true }
        ).lean();
    };

    /**
     * Marks all seller notifications as read atomically.
     */
    const markAllSellerNotificationsAsRead = async ({ sellerId }) =>
    {
        return Notification.updateMany(
            { customer: sellerId, readStatus: false },
            { readStatus: true }
        );
    };

    /**
     * Deletes a specific notification with ownership verification.
     * Returns null if notification doesn't exist or doesn't belong to seller.
     */
    const deleteSellerNotification = async ({ notificationId, sellerId }) =>
    {
        return Notification.findOneAndDelete({
            _id: notificationId,
            customer: sellerId
        }).lean();
    };

    /**
     * Aggregates recent activities from Orders, Payments, Returns, and Products
     * for a specific seller. Composes a unified activity feed.
     */
    const findRecentSellerActivities = async ({ sellerId, limit = 20 }) =>
    {
        const activities = [];

        // Fetch recent orders for this seller
        const recentOrders = await Order.find({ seller: sellerId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('_id orderId status createdAt totalAmount')
            .lean();

        recentOrders.forEach(order =>
        {
            activities.push({
                _id: order._id,
                type: 'NEW_ORDER',
                title: `Order ${order.orderId || order._id} received`,
                description: `New order placed for $${order.totalAmount || 0}`,
                timestamp: order.createdAt,
                metadata: { orderId: order._id, amount: order.totalAmount }
            });
        });

        // Fetch recent payments for this seller's orders
        const recentPayments = await PaymentOrder.find({ seller: sellerId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('_id orderId status createdAt amount')
            .lean();

        recentPayments.forEach(payment =>
        {
            if (payment.status === 'completed' || payment.status === 'paid')
            {
                activities.push({
                    _id: payment._id,
                    type: 'PAYMENT_RECEIVED',
                    title: `Payment received for order ${payment.orderId || payment._id}`,
                    description: `Payment of $${payment.amount || 0} confirmed`,
                    timestamp: payment.createdAt,
                    metadata: { orderId: payment.orderId, amount: payment.amount }
                });
            }
        });

        // Fetch recent return requests for this seller's products
        const recentReturns = await ReturnRequest.find({ seller: sellerId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('_id orderId status createdAt reason')
            .lean();

        recentReturns.forEach(returnReq =>
        {
            activities.push({
                _id: returnReq._id,
                type: 'RETURN_REQUEST',
                title: `Return request for order ${returnReq.orderId || returnReq._id}`,
                description: `Return requested: ${returnReq.reason || 'No reason provided'}`,
                timestamp: returnReq.createdAt,
                metadata: { returnId: returnReq._id, orderId: returnReq.orderId }
            });
        });

        // Fetch recent product updates for this seller
        const recentProducts = await Product.find({ seller: sellerId })
            .sort({ updatedAt: -1 })
            .limit(limit)
            .select('_id name status updatedAt price')
            .lean();

        recentProducts.forEach(product =>
        {
            activities.push({
                _id: product._id,
                type: 'PRODUCT_UPDATE',
                title: `Product "${product.name}" updated`,
                description: `Product status: ${product.status || 'updated'}`,
                timestamp: product.updatedAt,
                metadata: { productId: product._id, productName: product.name }
            });
        });

        // Sort all activities by timestamp descending and limit
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return activities.slice(0, limit);
    };

    return Object.freeze({
        createNotification,
        findByCustomerId,
        markAsRead,
        delete: deleteNotification,
        findSellerNotifications,
        countUnreadSellerNotifications,
        markSellerNotificationAsRead,
        markAllSellerNotificationsAsRead,
        deleteSellerNotification,
        findRecentSellerActivities,
    });
};