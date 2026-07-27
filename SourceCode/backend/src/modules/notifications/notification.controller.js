/**
 * Pure function-based factory representing the Enterprise Notification HTTP API Controllers.
 * Thin controllers: delegate all logic to the service layer.
 */
export const createNotificationController = ({ notificationService }) =>
{
    // ──────────────────────────────────────────
    // LEGACY CUSTOMER ENDPOINTS
    // ──────────────────────────────────────────

    const getCustomerNotifications = async (req, res) =>
    {
        const customerId = req.user.id;
        const notifications = await notificationService.getCustomerNotifications({ customerId });
        res.status(200).json(notifications);
    };

    const markAsRead = async (req, res) =>
    {
        const userId = req.user.id;
        const { notificationId } = req.params;
        const updatedNotification = await notificationService.markAsRead({ notificationId, userId });
        res.status(200).json(updatedNotification);
    };

    // ──────────────────────────────────────────
    // LEGACY SELLER ENDPOINTS
    // ──────────────────────────────────────────

    const getSellerNotifications = async (req, res) =>
    {
        const sellerId = req.user.id;
        const notifications = await notificationService.getSellerNotifications({ sellerId });
        res.status(200).json(notifications);
    };

    const getUnreadSellerNotificationCount = async (req, res) =>
    {
        const sellerId = req.user.id;
        const result = await notificationService.getUnreadSellerNotificationCount({ sellerId });
        res.status(200).json(result);
    };

    const markSellerNotificationAsRead = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { notificationId } = req.params;
        const notification = await notificationService.markSellerNotificationAsRead({ notificationId, sellerId });
        res.status(200).json(notification);
    };

    const markAllSellerNotificationsAsRead = async (req, res) =>
    {
        const sellerId = req.user.id;
        const result = await notificationService.markAllSellerNotificationsAsRead({ sellerId });
        res.status(200).json(result);
    };

    const deleteSellerNotification = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { notificationId } = req.params;
        const result = await notificationService.deleteSellerNotification({ notificationId, sellerId });
        res.status(200).json(result);
    };

    const getRecentSellerActivities = async (req, res) =>
    {
        const sellerId = req.user.id;
        const activities = await notificationService.getRecentSellerActivities({ sellerId });
        res.status(200).json(activities);
    };

    // ──────────────────────────────────────────
    // ENTERPRISE NOTIFICATION ENDPOINTS
    // ──────────────────────────────────────────

    const sendNotification = async (req, res) =>
    {
        const { recipientId, recipientEmail, recipientPhone, type, title, body, channels, templateName, variables, metadata, priority } = req.body;
        const createdBy = req.user.id;
        const result = await notificationService.send({
            recipientId, recipientEmail, recipientPhone, type, title, body,
            channels, templateName, variables, metadata, priority, createdBy,
        });
        res.status(201).json(result);
    };

    const sendBulkNotifications = async (req, res) =>
    {
        const { recipientIds, type, title, body, channels, templateName, variables, metadata, priority } = req.body;
        const createdBy = req.user.id;
        const results = await notificationService.sendBulk({
            recipientIds, type, title, body, channels, templateName, variables, metadata, priority, createdBy,
        });
        res.status(201).json({ results });
    };

    const sendToRole = async (req, res) =>
    {
        const { role, type, title, body, channels, templateName, variables, metadata, priority } = req.body;
        const createdBy = req.user.id;
        const result = await notificationService.sendToRole({
            role, type, title, body, channels, templateName, variables, metadata, priority, createdBy,
        });
        res.status(201).json(result);
    };

    const getNotifications = async (req, res) =>
    {
        const recipientId = req.user.id;
        const { page = 1, limit = 20, type = null } = req.query;
        const result = await notificationService.getNotifications({
            recipientId, page: parseInt(page), limit: parseInt(limit), type,
        });
        res.status(200).json(result);
    };

    const getUnreadCount = async (req, res) =>
    {
        const recipientId = req.user.id;
        const result = await notificationService.getUnreadCount({ recipientId });
        res.status(200).json(result);
    };

    const markAllAsRead = async (req, res) =>
    {
        const recipientId = req.user.id;
        const result = await notificationService.markAllAsRead({ recipientId });
        res.status(200).json(result);
    };

    const archiveNotification = async (req, res) =>
    {
        const recipientId = req.user.id;
        const { notificationId } = req.params;
        const result = await notificationService.archive({ notificationId, recipientId });
        res.status(200).json(result);
    };

    const deleteNotification = async (req, res) =>
    {
        const recipientId = req.user.id;
        const { notificationId } = req.params;
        const result = await notificationService.deleteNotification({ notificationId, recipientId });
        res.status(200).json(result);
    };

    const retryNotification = async (req, res) =>
    {
        const { notificationId } = req.params;
        const result = await notificationService.retryFailed({ notificationId });
        res.status(200).json(result);
    };

    const scheduleNotification = async (req, res) =>
    {
        const { recipientId, type, title, body, channels, templateName, variables, metadata, priority, scheduledAt } = req.body;
        const createdBy = req.user.id;
        const result = await notificationService.schedule({
            recipientId, type, title, body, channels, templateName, variables, metadata, priority, scheduledAt, createdBy,
        });
        res.status(201).json(result);
    };

    const cancelScheduledNotification = async (req, res) =>
    {
        const recipientId = req.user.id;
        const { notificationId } = req.params;
        const result = await notificationService.cancelScheduled({ notificationId, recipientId });
        res.status(200).json(result);
    };

    const processScheduledNotifications = async (req, res) =>
    {
        const results = await notificationService.processScheduled();
        res.status(200).json({ processed: results.length, results });
    };

    const getNotificationAnalytics = async (req, res) =>
    {
        const { startDate, endDate } = req.query;
        const result = await notificationService.getAnalytics({ startDate, endDate });
        res.status(200).json(result);
    };

    // ──────────────────────────────────────────
    // TEMPLATE MANAGEMENT ENDPOINTS
    // ──────────────────────────────────────────

    const createTemplate = async (req, res) =>
    {
        const { name, type, channelContent, variables } = req.body;
        const template = await notificationService.createTemplate({ name, type, channelContent, variables });
        res.status(201).json(template);
    };

    const getTemplate = async (req, res) =>
    {
        const { templateId } = req.params;
        const template = await notificationService.getTemplate({ templateId });
        res.status(200).json(template);
    };

    const getTemplates = async (req, res) =>
    {
        const { page = 1, limit = 50, isActive = null } = req.query;
        const result = await notificationService.getTemplates({
            page: parseInt(page), limit: parseInt(limit), isActive: isActive !== null ? isActive === 'true' : null,
        });
        res.status(200).json(result);
    };

    const updateTemplate = async (req, res) =>
    {
        const { templateId } = req.params;
        const template = await notificationService.updateTemplate({ templateId, updateData: req.body });
        res.status(200).json(template);
    };

    const deleteTemplate = async (req, res) =>
    {
        const { templateId } = req.params;
        await notificationService.deleteTemplate({ templateId });
        res.status(200).json({ success: true, message: 'Template deleted.' });
    };

    // ──────────────────────────────────────────
    // PREFERENCE MANAGEMENT ENDPOINTS
    // ──────────────────────────────────────────

    const getPreferences = async (req, res) =>
    {
        const userId = req.user.id;
        const preferences = await notificationService.getPreferences({ userId });
        res.status(200).json(preferences);
    };

    const updatePreferences = async (req, res) =>
    {
        const userId = req.user.id;
        const { channels, quietHours, mutedTypes } = req.body;
        const preferences = await notificationService.updatePreferences({ userId, channels, quietHours, mutedTypes });
        res.status(200).json(preferences);
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
        sendNotification,
        sendBulkNotifications,
        sendToRole,
        getNotifications,
        getUnreadCount,
        markAllAsRead,
        archiveNotification,
        deleteNotification,
        retryNotification,
        scheduleNotification,
        cancelScheduledNotification,
        processScheduledNotifications,
        getNotificationAnalytics,
        createTemplate,
        getTemplate,
        getTemplates,
        updateTemplate,
        deleteTemplate,
        getPreferences,
        updatePreferences,
    });
};
