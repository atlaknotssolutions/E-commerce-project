/**
 * Pure function-based factory representing the Customer Notifications Business Service layer.
 * Enforces strict security recipient checks and account verification workflows.
 */
export const createNotificationService = ({
    notificationRepository,
    userRepository,
    createApiError,
    mapSellerNotification,
    mapSellerNotifications,
    mapRecentActivity,
    mapRecentActivities
}) =>
{

    /**
     * Onboards a brand-new in-app alert notification.
     * Validates customer existence prior to creation.
     */
    const createNotification = async ({ customerId, message }) =>
    {

        // 1. Core Validation: Ensure targeted customer exists in database registries
        const customer = await userRepository.findById(customerId);
        if (!customer)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'Notification creation failed. The targeted customer account does not exist.'
            });
        }

        // 2. Prepare notification attributes linking active customer ID
        const preparedNotificationData = {
            customer: customerId,
            message,
        };

        // 3. Commit notification write operations
        return notificationRepository.createNotification(preparedNotificationData);
    };

    /**
     * Modifies an existing notification readStatus record safely.
     * Enforces strict recipient-ownership checks prior to writing updates.
     */
    const markAsRead = async ({ notificationId, userId }) =>
    {

        // 1. Locate dynamic targeted notification document
        const notification = await notificationRepository.markAsRead({ id: notificationId }); // We need findById first inside repository, but we can safely call findById if we expose findById or directly query updateStatus with user check inside findOneAndUpdate!
        // To maintain strictly decoupled transactional boundaries, we can query updateStatus directly if we enforce user match!
        // Let's first verify if the notification exists and belongs to the user:
        const MongooseModel = mongoose.model('Notification');
        const existingNotification = await MongooseModel.findById(notificationId).lean();

        if (!existingNotification)
        {
            throw createApiError({
                statusCode: 404,
                code: 'NOTIFICATION_NOT_FOUND',
                message: 'Modification failed. The requested notification alert was not found.'
            });
        }

        // 2. Core Security Check: Validate that the requesting user is the recipient of this alert
        const isRecipient = existingNotification.customer.toString() === userId.toString();
        if (!isRecipient)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: 'Access Denied: You do not possess authorizations to read another user’s notification.'
            });
        }

        // 3. Commit updates safely in database
        return notificationRepository.markAsRead({ id: notificationId });
    };

    /**
     * Displays customer-specific notifications list.
     */
    const getCustomerNotifications = async ({ customerId }) =>
    {
        return notificationRepository.findByCustomerId({ customerId });
    };

    // ==========================================
    // SELLER NOTIFICATION SERVICE METHODS
    // ==========================================

    /**
     * Retrieves seller-specific notifications with limit of 50.
     * Returns empty array if seller has no notifications.
     */
    const getSellerNotifications = async ({ sellerId }) =>
    {
        const notifications = await notificationRepository.findSellerNotifications({
            sellerId,
            limit: 50
        });
        return mapSellerNotifications(notifications);
    };

    /**
     * Returns unread notification count for seller.
     * Returns { count: 0 } if no unread notifications.
     */
    const getUnreadSellerNotificationCount = async ({ sellerId }) =>
    {
        const count = await notificationRepository.countUnreadSellerNotifications({ sellerId });
        return { count: count || 0 };
    };

    /**
     * Marks a single seller notification as read with ownership verification.
     * Throws 404 if notification doesn't exist or doesn't belong to seller.
     */
    const markSellerNotificationAsRead = async ({ notificationId, sellerId }) =>
    {
        const notification = await notificationRepository.markSellerNotificationAsRead({
            notificationId,
            sellerId
        });

        if (!notification)
        {
            throw createApiError({
                statusCode: 404,
                code: 'NOTIFICATION_NOT_FOUND',
                message: 'Notification not found or does not belong to this seller.'
            });
        }

        return mapSellerNotification(notification);
    };

    /**
     * Marks all seller notifications as read atomically.
     * Returns success confirmation without throwing for empty datasets.
     */
    const markAllSellerNotificationsAsRead = async ({ sellerId }) =>
    {
        await notificationRepository.markAllSellerNotificationsAsRead({ sellerId });
        return { success: true, message: 'All notifications marked as read.' };
    };

    /**
     * Deletes a specific seller notification with ownership verification.
     * Throws 404 if notification doesn't exist or doesn't belong to seller.
     * Does not affect activity history.
     */
    const deleteSellerNotification = async ({ notificationId, sellerId }) =>
    {
        const notification = await notificationRepository.deleteSellerNotification({
            notificationId,
            sellerId
        });

        if (!notification)
        {
            throw createApiError({
                statusCode: 404,
                code: 'NOTIFICATION_NOT_FOUND',
                message: 'Notification not found or does not belong to this seller.'
            });
        }

        return { success: true, message: 'Notification deleted successfully.' };
    };

    /**
     * Retrieves recent activities from multiple collections.
     * Returns empty array if no activities found.
     */
    const getRecentSellerActivities = async ({ sellerId }) =>
    {
        const activities = await notificationRepository.findRecentSellerActivities({
            sellerId,
            limit: 20
        });
        return mapRecentActivities(activities);
    };

    return Object.freeze({
        createNotification,
        markAsRead,
        getCustomerNotifications,
        getSellerNotifications,
        getUnreadSellerNotificationCount,
        markSellerNotificationAsRead,
        markAllSellerNotificationsAsRead,
        deleteSellerNotification,
        getRecentSellerActivities,
    });
};