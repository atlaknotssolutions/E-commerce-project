/**
 * Pure function-based mapper for transforming Notification domain entities
 * into standardized API response payloads.
 */

export const mapNotification = (notification) =>
{
  if (!notification) return null;

  return {
    id: notification._id,
    title: notification.title || notification.message || 'Notification',
    message: notification.message,
    type: notification.type || 'GENERIC',
    priority: notification.priority || 'MEDIUM',
    status: notification.status || 'SENT',
    isRead: notification.readStatus ?? false,
    readAt: notification.readAt || null,
    channels: notification.channels || { inApp: true },
    metadata: notification.metadata || {},
    template: notification.template || null,
    scheduledAt: notification.scheduledAt || null,
    createdAt: notification.createdAt || notification.sentAt,
    updatedAt: notification.updatedAt,
  };
};

export const mapNotifications = (notifications) =>
{
  if (!Array.isArray(notifications)) return [];
  return notifications.map(mapNotification);
};

export const mapNotificationWithHistory = (notification) =>
{
  if (!notification) return null;

  return {
    ...mapNotification(notification),
    channelHistory: notification.channelHistory || [],
    retryCount: notification.retryCount || 0,
    maxRetries: notification.maxRetries || 3,
    deliveredAt: notification.deliveredAt || null,
    createdBy: notification.createdBy || null,
  };
};

export const mapNotificationListResponse = ({ notifications, total, page, limit }) =>
{
  return {
    notifications: mapNotifications(notifications),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const mapSellerNotification = (notification) =>
{
  if (!notification) return null;

  return {
    id: notification._id,
    title: notification.title || notification.message || 'Notification',
    type: notification.type || 'seller_notification',
    priority: notification.priority || 'medium',
    isRead: notification.readStatus ?? false,
    createdAt: notification.createdAt || notification.sentAt,
    metadata: notification.metadata || {},
  };
};

export const mapSellerNotifications = (notifications) =>
{
  if (!Array.isArray(notifications)) return [];
  return notifications.map(mapSellerNotification);
};

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

export const mapRecentActivities = (activities) =>
{
  if (!Array.isArray(activities)) return [];
  return activities.map(mapRecentActivity);
};
