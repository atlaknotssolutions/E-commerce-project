/**
 * Pure function-based factory representing the Customer Notifications HTTP API Controllers.
 * Strictly enforces thin controller design principles, avoiding classes and context leaks.
 */
export const createNotificationController = ({ notificationService }) =>
{

    /**
     * Retrieves customer-specific notifications and alerts listings.
     * Maps exactly to: GET /api/notifications (Authentication required)
     */
    const getCustomerNotifications = async (req, res) =>
    {
        // Reads authenticated customer ID directly from decoded Bearer claims (req.user)
        const customerId = req.user.id;

        const notifications = await notificationService.getCustomerNotifications({ customerId });

        // 200 OK: Delivers complete feedback lists back to client UI
        res.status(200).json(notifications);
    };

    /**
     * Modifies an existing notification readStatus owned by the customer.
     * Maps exactly to: PATCH /api/notifications/:notificationId/read (Ownership required)
     */
    const markAsRead = async (req, res) =>
    {
        const userId = req.user.id;
        const { notificationId } = req.params;

        const updatedNotification = await notificationService.markAsRead({
            notificationId,
            userId,
        });

        res.status(200).json(updatedNotification);
    };

    // ==========================================
    // SELLER NOTIFICATION CONTROLLER METHODS
    // ==========================================

    /**
     * Retrieves seller-specific notifications.
     * Maps exactly to: GET /api/seller/notifications (ROLE_SELLER required)
     */
    const getSellerNotifications = async (req, res) =>
    {
        const sellerId = req.user.id;
        const notifications = await notificationService.getSellerNotifications({ sellerId });
        res.status(200).json(notifications);
    };

    /**
     * Returns unread notification count for seller.
     * Maps exactly to: GET /api/seller/notifications/unread-count (ROLE_SELLER required)
     */
    const getUnreadSellerNotificationCount = async (req, res) =>
    {
        const sellerId = req.user.id;
        const result = await notificationService.getUnreadSellerNotificationCount({ sellerId });
        res.status(200).json(result);
    };

    /**
     * Marks a single seller notification as read.
     * Maps exactly to: PATCH /api/seller/notifications/:notificationId/read (ROLE_SELLER required)
     */
    const markSellerNotificationAsRead = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { notificationId } = req.params;
        const notification = await notificationService.markSellerNotificationAsRead({
            notificationId,
            sellerId
        });
        res.status(200).json(notification);
    };

    /**
     * Marks all seller notifications as read.
     * Maps exactly to: PATCH /api/seller/notifications/read-all (ROLE_SELLER required)
     */
    const markAllSellerNotificationsAsRead = async (req, res) =>
    {
        const sellerId = req.user.id;
        const result = await notificationService.markAllSellerNotificationsAsRead({ sellerId });
        res.status(200).json(result);
    };

    /**
     * Deletes a specific seller notification.
     * Maps exactly to: DELETE /api/seller/notifications/:notificationId (ROLE_SELLER required)
     */
    const deleteSellerNotification = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { notificationId } = req.params;
        const result = await notificationService.deleteSellerNotification({
            notificationId,
            sellerId
        });
        res.status(200).json(result);
    };

    /**
     * Retrieves recent activities from multiple collections.
     * Maps exactly to: GET /api/seller/dashboard/recent-activities (ROLE_SELLER required)
     */
    const getRecentSellerActivities = async (req, res) =>
    {
        const sellerId = req.user.id;
        const activities = await notificationService.getRecentSellerActivities({ sellerId });
        res.status(200).json(activities);
    };

    return Object.freeze({
        getCustomerNotifications,
        markAsRead,
        getSellerNotifications,
        getUnreadSellerNotificationCount,
        markSellerNotificationAsRead,
        markAllSellerNotificationsAsRead,
        deleteSellerNotification,
        getRecentSellerActivities,
    });
};