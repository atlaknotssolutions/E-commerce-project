export const createAdminNotificationService = ({
    adminNotificationRepository,
    createApiError,
}) => {

    const getAllNotifications = async (filters) => {
        const result = await adminNotificationRepository.findAllWithFilters(filters);
        return result;
    };

    const getNotificationById = async (id) => {
        const notification = await adminNotificationRepository.findById(id);
        if (!notification) {
            createApiError('Notification not found', 404);
        }
        return notification;
    };

    const createNotification = async (data, createdBy) => {
        const validTypes = ['SYSTEM', 'PLATFORM_ANNOUNCEMENT', 'PROMOTIONAL', 'MAINTENANCE', 'SECURITY', 'ORDER', 'RETURN', 'COUPON'];
        if (!validTypes.includes(data.notificationType)) {
            createApiError('Invalid notification type', 400);
        }

        const validAudiences = ['ALL_USERS', 'ALL_CUSTOMERS', 'ALL_SELLERS', 'SPECIFIC_CUSTOMER', 'SPECIFIC_SELLER', 'SELECTED_CUSTOMERS', 'SELECTED_SELLERS'];
        if (!validAudiences.includes(data.targetAudience)) {
            createApiError('Invalid target audience', 400);
        }

        if (data.scheduledAt) {
            const scheduleDate = new Date(data.scheduledAt);
            if (scheduleDate <= new Date()) {
                createApiError('Scheduled date must be in the future', 400);
            }
            data.status = 'SCHEDULED';
        }

        const notification = await adminNotificationRepository.create({
            ...data,
            createdBy,
        });

        return notification;
    };

    const updateNotification = async (id, data) => {
        const existing = await adminNotificationRepository.findById(id);
        if (!existing) {
            createApiError('Notification not found', 404);
        }

        if (existing.status === 'DELIVERED' || existing.status === 'ARCHIVED') {
            createApiError('Cannot edit a delivered or archived notification', 400);
        }

        if (data.scheduledAt && data.status !== 'SCHEDULED') {
            const scheduleDate = new Date(data.scheduledAt);
            if (scheduleDate <= new Date()) {
                createApiError('Scheduled date must be in the future', 400);
            }
        }

        const notification = await adminNotificationRepository.update(id, data);
        return notification;
    };

    const deleteNotification = async (id) => {
        const existing = await adminNotificationRepository.findById(id);
        if (!existing) {
            createApiError('Notification not found', 404);
        }

        if (existing.status === 'DELIVERED') {
            createApiError('Cannot delete a delivered notification. Archive it instead.', 400);
        }

        await adminNotificationRepository.remove(id);
        return { message: 'Notification deleted successfully' };
    };

    const publishNotification = async (id) => {
        const existing = await adminNotificationRepository.findById(id);
        if (!existing) {
            createApiError('Notification not found', 404);
        }

        if (existing.status !== 'DRAFT' && existing.status !== 'SCHEDULED') {
            createApiError(`Cannot publish a notification with status ${existing.status}`, 400);
        }

        const notification = await adminNotificationRepository.update(id, {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            scheduledAt: null,
        });

        return notification;
    };

    const scheduleNotification = async (id, scheduledAt) => {
        const existing = await adminNotificationRepository.findById(id);
        if (!existing) {
            createApiError('Notification not found', 404);
        }

        if (existing.status !== 'DRAFT') {
            createApiError('Only draft notifications can be scheduled', 400);
        }

        if (!scheduledAt) {
            createApiError('Scheduled date is required', 400);
        }

        const scheduleDate = new Date(scheduledAt);
        if (scheduleDate <= new Date()) {
            createApiError('Scheduled date must be in the future', 400);
        }

        const notification = await adminNotificationRepository.update(id, {
            status: 'SCHEDULED',
            scheduledAt: scheduleDate,
        });

        return notification;
    };

    const archiveNotification = async (id) => {
        const existing = await adminNotificationRepository.findById(id);
        if (!existing) {
            createApiError('Notification not found', 404);
        }

        if (existing.status === 'DRAFT') {
            createApiError('Cannot archive a draft notification. Delete it instead.', 400);
        }

        const notification = await adminNotificationRepository.update(id, {
            status: 'ARCHIVED',
            archivedAt: new Date(),
        });

        return notification;
    };

    const getStatistics = async () => {
        const stats = await adminNotificationRepository.getStatistics();
        return stats;
    };

    return Object.freeze({
        getAllNotifications,
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
