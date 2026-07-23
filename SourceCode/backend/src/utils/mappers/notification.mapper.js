/**
 * Pure function-based mapper for transforming Notification domain entities
 * into seller dashboard response payloads.
 */

/**
 * Maps a single notification document into seller notification response shape.
 */
export const mapSellerNotification = (notification) =>
{
    if (!notification) return null;

    return {
        id: notification._id,
        title: notification.message || 'Notification',
        type: notification.type || 'seller_notification',
        priority: notification.priority || 'medium',
        isRead: notification.readStatus ?? false,
        createdAt: notification.createdAt || notification.sentAt,
        metadata: notification.metadata || {},
    };
};

/**
 * Maps an array of notification documents into seller notification response shapes.
 */
export const mapSellerNotifications = (notifications) =>
{
    if (!Array.isArray(notifications)) return [];
    return notifications.map(mapSellerNotification);
};

/**
 * Maps a single recent activity document into activity response shape.
 */
export const mapRecentActivity = (activity) =>
{
    if (!activity) return null;

    return {
        id: activity._id,
        type: activity.type,
        title: activity.title,
        description: activity.description || '',
        timestamp: activity.timestamp,
        metadata: activity.metadata || {},
    };
};

/**
 * Maps an array of recent activity documents into activity response shapes.
 */
export const mapRecentActivities = (activities) =>
{
    if (!Array.isArray(activities)) return [];
    return activities.map(mapRecentActivity);
};
