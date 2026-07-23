export const createAdminNotificationController = ({ adminNotificationService }) => {

    const getNotifications = async (req, res) => {
        const { status, notificationType, targetAudience, search, startDate, endDate, page, limit } = req.query;
        const result = await adminNotificationService.getAllNotifications({
            status,
            notificationType,
            targetAudience,
            search,
            startDate,
            endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({
            success: true,
            data: result.notifications,
            pagination: result.pagination,
        });
    };

    const getNotificationById = async (req, res) => {
        const { id } = req.params;
        const notification = await adminNotificationService.getNotificationById(id);
        res.status(200).json({ success: true, data: notification });
    };

    const createNotification = async (req, res) => {
        const notification = await adminNotificationService.createNotification(
            req.body,
            req.user.id
        );
        res.status(201).json({ success: true, data: notification });
    };

    const updateNotification = async (req, res) => {
        const { id } = req.params;
        const notification = await adminNotificationService.updateNotification(id, req.body);
        res.status(200).json({ success: true, data: notification });
    };

    const deleteNotification = async (req, res) => {
        const { id } = req.params;
        const result = await adminNotificationService.deleteNotification(id);
        res.status(200).json({ success: true, ...result });
    };

    const publishNotification = async (req, res) => {
        const { id } = req.params;
        const notification = await adminNotificationService.publishNotification(id);
        res.status(200).json({ success: true, data: notification });
    };

    const scheduleNotification = async (req, res) => {
        const { id } = req.params;
        const { scheduledAt } = req.body;
        const notification = await adminNotificationService.scheduleNotification(id, scheduledAt);
        res.status(200).json({ success: true, data: notification });
    };

    const archiveNotification = async (req, res) => {
        const { id } = req.params;
        const notification = await adminNotificationService.archiveNotification(id);
        res.status(200).json({ success: true, data: notification });
    };

    const getStatistics = async (req, res) => {
        const stats = await adminNotificationService.getStatistics();
        res.status(200).json({ success: true, data: stats });
    };

    return Object.freeze({
        getNotifications,
        getNotificationById,
        createNotification,
        updateNotification,
        deleteNotification,
        publishNotification,
        scheduleNotification,
        archiveNotification,
        getStatistics,
    });
};
