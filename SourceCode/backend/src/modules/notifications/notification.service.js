/**
 * Pure function-based factory representing the Enterprise Notification Business Service layer.
 * Backward-compatible: all legacy methods preserved with identical signatures.
 * New enterprise methods for multi-channel dispatch, scheduling, retry, and preferences.
 */
export const createNotificationService = ({
    notificationRepository,
    notificationTemplateRepository,
    notificationPreferenceRepository,
    notificationDispatcher,
    userRepository,
    createApiError,
    mapSellerNotification,
    mapSellerNotifications,
    mapRecentActivity,
    mapRecentActivities,
    mapNotification,
    mapNotifications,
    mapNotificationListResponse,
    mapNotificationWithHistory,
}) =>
{
    // ──────────────────────────────────────────
    // LEGACY API (backward-compatible)
    // ──────────────────────────────────────────

    const createNotification = async ({ customerId, message }) =>
    {
        const customer = await userRepository.findById(customerId);
        if (!customer)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'Notification creation failed. The targeted customer account does not exist.'
            });
        }

        const preparedNotificationData = {
            customer: customerId,
            recipient: customerId,
            message,
            status: 'SENT',
            channels: { inApp: true, email: false, sms: false, push: false },
            readStatus: false,
            sentAt: new Date(),
            deliveredAt: new Date(),
        };

        return notificationRepository.createNotification(preparedNotificationData);
    };

    const markAsRead = async ({ notificationId, userId }) =>
    {
        const result = await notificationRepository.markAsReadByRecipient({
            notificationId,
            recipientId: userId,
        });

        if (!result)
        {
            const existingNotification = await notificationRepository.findByCustomerId({ customerId: userId });
            const found = existingNotification && existingNotification.find(n => n._id.toString() === notificationId);

            if (!found)
            {
                throw createApiError({
                    statusCode: 404,
                    code: 'NOTIFICATION_NOT_FOUND',
                    message: 'Modification failed. The requested notification alert was not found.'
                });
            }

            if (found.customer.toString() !== userId.toString())
            {
                throw createApiError({
                    statusCode: 403,
                    code: 'ACCESS_FORBIDDEN',
                    message: 'Access Denied: You do not possess authorizations to read another user\'s notification.'
                });
            }

            return notificationRepository.markAsRead({ id: notificationId });
        }

        return result;
    };

    const getCustomerNotifications = async ({ customerId }) =>
    {
        return notificationRepository.findByCustomerId({ customerId });
    };

    // ==========================================
    // SELLER NOTIFICATION SERVICE METHODS
    // ==========================================

    const getSellerNotifications = async ({ sellerId }) =>
    {
        const notifications = await notificationRepository.findSellerNotifications({
            sellerId,
            limit: 50
        });
        return mapSellerNotifications(notifications);
    };

    const getUnreadSellerNotificationCount = async ({ sellerId }) =>
    {
        const count = await notificationRepository.countUnreadSellerNotifications({ sellerId });
        return { count: count || 0 };
    };

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

    const markAllSellerNotificationsAsRead = async ({ sellerId }) =>
    {
        await notificationRepository.markAllSellerNotificationsAsRead({ sellerId });
        return { success: true, message: 'All notifications marked as read.' };
    };

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

    const getRecentSellerActivities = async ({ sellerId }) =>
    {
        const activities = await notificationRepository.findRecentSellerActivities({
            sellerId,
            limit: 20
        });
        return mapRecentActivities(activities);
    };

    // ──────────────────────────────────────────
    // ENTERPRISE NOTIFICATION METHODS
    // ──────────────────────────────────────────

    const send = async ({ recipientId, recipientEmail, recipientPhone, type, title, body, channels, templateName, variables = {}, metadata = {}, priority = 'MEDIUM', recipientRole = null, createdBy = null }) =>
    {
        if (!recipientId)
        {
            throw createApiError({
                statusCode: 400,
                code: 'RECIPIENT_REQUIRED',
                message: 'Recipient ID is required to send a notification.'
            });
        }

        const recipient = await userRepository.findById(recipientId);
        if (!recipient)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'The specified recipient does not exist.'
            });
        }

        return notificationDispatcher.dispatch({
            recipientId,
            recipientEmail: recipientEmail || recipient.email,
            recipientPhone,
            type,
            title,
            body,
            channels: channels || ['IN_APP'],
            templateName,
            variables,
            metadata,
            priority,
            recipientRole,
            createdBy,
        });
    };

    const sendBulk = async ({ recipientIds, type, title, body, channels, templateName, variables = {}, metadata = {}, priority = 'MEDIUM', createdBy = null }) =>
    {
        if (!Array.isArray(recipientIds) || !recipientIds.length)
        {
            throw createApiError({
                statusCode: 400,
                code: 'RECIPIENTS_REQUIRED',
                message: 'At least one recipient ID is required.'
            });
        }

        return notificationDispatcher.dispatchBulk({
            recipientIds,
            type,
            title,
            body,
            channels,
            templateName,
            variables,
            metadata,
            priority,
            createdBy,
        });
    };

    const sendToRole = async ({ role, type, title, body, channels, templateName, variables = {}, metadata = {}, priority = 'MEDIUM', createdBy = null }) =>
    {
        if (!role)
        {
            throw createApiError({
                statusCode: 400,
                code: 'ROLE_REQUIRED',
                message: 'A target role is required.'
            });
        }

        return notificationDispatcher.dispatchToRole({
            role,
            type,
            title,
            body,
            channels,
            templateName,
            variables,
            metadata,
            priority,
            createdBy,
        });
    };

    const getNotifications = async ({ recipientId, page = 1, limit = 20, type = null }) =>
    {
        const result = await notificationRepository.findByRecipient({ recipientId, page, limit, type });
        return mapNotificationListResponse(result);
    };

    const getUnreadCount = async ({ recipientId }) =>
    {
        const count = await notificationRepository.countUnreadByRecipient({ recipientId });
        return { count: count || 0 };
    };

    const markAllAsRead = async ({ recipientId }) =>
    {
        await notificationRepository.markAllAsReadByRecipient({ recipientId });
        return { success: true, message: 'All notifications marked as read.' };
    };

    const archive = async ({ notificationId, recipientId }) =>
    {
        const result = await notificationRepository.softDelete({ notificationId, recipientId });
        if (!result)
        {
            throw createApiError({
                statusCode: 404,
                code: 'NOTIFICATION_NOT_FOUND',
                message: 'Notification not found.'
            });
        }
        return { success: true, message: 'Notification archived.' };
    };

    const deleteNotification = async ({ notificationId, recipientId }) =>
    {
        const result = await notificationRepository.softDelete({ notificationId, recipientId });
        if (!result)
        {
            throw createApiError({
                statusCode: 404,
                code: 'NOTIFICATION_NOT_FOUND',
                message: 'Notification not found.'
            });
        }
        return { success: true, message: 'Notification deleted.' };
    };

    // ──────────────────────────────────────────
    // TEMPLATE MANAGEMENT
    // ──────────────────────────────────────────

    const createTemplate = async ({ name, type, channelContent, variables = [] }) =>
    {
        const existing = await notificationTemplateRepository.findByName(name);
        if (existing)
        {
            throw createApiError({
                statusCode: 409,
                code: 'TEMPLATE_EXISTS',
                message: `Template with name "${name}" already exists.`
            });
        }

        return notificationTemplateRepository.create({ name, type, channelContent, variables, isActive: true });
    };

    const getTemplate = async ({ templateId }) =>
    {
        const template = await notificationTemplateRepository.findById(templateId);
        if (!template)
        {
            throw createApiError({
                statusCode: 404,
                code: 'TEMPLATE_NOT_FOUND',
                message: 'Template not found.'
            });
        }
        return template;
    };

    const getTemplateByName = async ({ name }) =>
    {
        return notificationTemplateRepository.findByName(name);
    };

    const getTemplates = async ({ page = 1, limit = 50, isActive = null } = {}) =>
    {
        return notificationTemplateRepository.findAll({ page, limit, isActive });
    };

    const updateTemplate = async ({ templateId, updateData }) =>
    {
        const template = await notificationTemplateRepository.findById(templateId);
        if (!template)
        {
            throw createApiError({
                statusCode: 404,
                code: 'TEMPLATE_NOT_FOUND',
                message: 'Template not found.'
            });
        }
        return notificationTemplateRepository.updateById(templateId, updateData);
    };

    const deleteTemplate = async ({ templateId }) =>
    {
        const template = await notificationTemplateRepository.findById(templateId);
        if (!template)
        {
            throw createApiError({
                statusCode: 404,
                code: 'TEMPLATE_NOT_FOUND',
                message: 'Template not found.'
            });
        }
        return notificationTemplateRepository.deleteById(templateId);
    };

    // ──────────────────────────────────────────
    // PREFERENCE MANAGEMENT
    // ──────────────────────────────────────────

    const getPreferences = async ({ userId }) =>
    {
        return notificationPreferenceRepository.findOrCreateByUser(userId);
    };

    const updatePreferences = async ({ userId, channels, quietHours, mutedTypes }) =>
    {
        const updateData = {};
        if (channels) updateData.channels = channels;
        if (quietHours) updateData.quietHours = quietHours;
        if (mutedTypes) updateData.mutedTypes = mutedTypes;

        return notificationPreferenceRepository.upsertByUser(userId, updateData);
    };

    // ──────────────────────────────────────────
    // RETRY & SCHEDULED
    // ──────────────────────────────────────────

    const retryFailed = async ({ notificationId }) =>
    {
        const existing = await notificationRepository.findById(notificationId);

        if (!existing)
        {
            throw createApiError({
                statusCode: 404,
                code: 'NOTIFICATION_NOT_FOUND',
                message: 'Notification not found.'
            });
        }

        if (existing.retryCount >= (existing.maxRetries || 3))
        {
            throw createApiError({
                statusCode: 429,
                code: 'MAX_RETRIES_EXCEEDED',
                message: 'Maximum retry attempts exceeded for this notification.'
            });
        }

        await notificationRepository.incrementRetryCount(notificationId);

        const channels = [];
        if (existing.channels?.inApp) channels.push('IN_APP');
        if (existing.channels?.email) channels.push('EMAIL');
        if (existing.channels?.sms) channels.push('SMS');
        if (existing.channels?.push) channels.push('PUSH');

        return notificationDispatcher.dispatch({
            recipientId: existing.recipient || existing.customer,
            type: existing.type,
            title: existing.title,
            body: existing.message,
            channels: channels.length ? channels : ['IN_APP'],
            templateName: existing.template?.name || null,
            variables: existing.template?.variables || {},
            metadata: existing.metadata || {},
            priority: existing.priority || 'MEDIUM',
            createdBy: existing.createdBy,
        });
    };

    const schedule = async ({ recipientId, type, title, body, channels, templateName, variables = {}, metadata = {}, priority = 'MEDIUM', scheduledAt, createdBy = null }) =>
    {
        if (!scheduledAt || new Date(scheduledAt) <= new Date())
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_SCHEDULE',
                message: 'Scheduled time must be in the future.'
            });
        }

        const notification = await notificationRepository.createNotification({
            customer: recipientId,
            recipient: recipientId,
            message: body,
            title,
            type: type || 'GENERIC',
            priority,
            status: 'PENDING',
            channels: {
                inApp: channels?.includes('IN_APP'),
                email: channels?.includes('EMAIL'),
                sms: channels?.includes('SMS'),
                push: channels?.includes('PUSH'),
            },
            metadata,
            template: templateName ? { name: templateName, variables } : undefined,
            readStatus: false,
            sentAt: new Date(),
            scheduledAt: new Date(scheduledAt),
            createdBy,
        });

        return { notification, message: 'Notification scheduled successfully.' };
    };

    const cancelScheduled = async ({ notificationId, recipientId }) =>
    {
        const result = await notificationRepository.softDelete({ notificationId, recipientId });
        if (!result)
        {
            throw createApiError({
                statusCode: 404,
                code: 'NOTIFICATION_NOT_FOUND',
                message: 'Scheduled notification not found.'
            });
        }
        return { success: true, message: 'Scheduled notification cancelled.' };
    };

    const processScheduled = async () =>
    {
        const scheduled = await notificationRepository.findScheduled();
        const results = [];

        for (const notification of scheduled)
        {
            try
            {
                await notificationRepository.updateStatus({ id: notification._id, status: 'QUEUED' });

                const channels = [];
                if (notification.channels?.inApp) channels.push('IN_APP');
                if (notification.channels?.email) channels.push('EMAIL');
                if (notification.channels?.sms) channels.push('SMS');
                if (notification.channels?.push) channels.push('PUSH');

                const result = await notificationDispatcher.dispatch({
                    recipientId: notification.recipient || notification.customer,
                    type: notification.type,
                    title: notification.title,
                    body: notification.message,
                    channels: channels.length ? channels : ['IN_APP'],
                    templateName: notification.template?.name || null,
                    variables: notification.template?.variables || {},
                    metadata: notification.metadata || {},
                    priority: notification.priority || 'MEDIUM',
                    createdBy: notification.createdBy,
                });

                results.push({ id: notification._id, success: true });
            }
            catch (error)
            {
                await notificationRepository.updateStatus({
                    id: notification._id,
                    status: 'FAILED',
                    channelHistoryEntry: { channel: 'SYSTEM', status: 'FAILED', sentAt: new Date(), error: error.message },
                });
                results.push({ id: notification._id, success: false, error: error.message });
            }
        }

        return results;
    };

    // ──────────────────────────────────────────
    // ANALYTICS
    // ──────────────────────────────────────────

    const getAnalytics = async ({ startDate, endDate } = {}) =>
    {
        const typeCounts = await notificationRepository.countByType({ startDate, endDate });
        return { typeCounts };
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
        send,
        sendBulk,
        sendToRole,
        getNotifications,
        getUnreadCount,
        markAllAsRead,
        archive,
        deleteNotification,
        createTemplate,
        getTemplate,
        getTemplateByName,
        getTemplates,
        updateTemplate,
        deleteTemplate,
        getPreferences,
        updatePreferences,
        retryFailed,
        schedule,
        cancelScheduled,
        processScheduled,
        getAnalytics,
    });
};
