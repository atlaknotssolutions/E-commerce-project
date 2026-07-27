/**
 * Pure function-based routing factory representing the Enterprise Notification API gateways.
 * Preserves all legacy routes and adds new enterprise endpoints.
 */
export const createNotificationRoutes = ({
  router,
  notificationController,
  authenticate,
  authorizeRoles,
  asyncHandler
}) =>
{
  // ==========================================
  // LEGACY CUSTOMER NOTIFICATION GATEWAYS (/api/notifications/*)
  // ==========================================

  router.get(
    '/api/notifications',
    authenticate,
    asyncHandler(notificationController.getCustomerNotifications)
  );

  router.patch(
    '/api/notifications/:notificationId/read',
    authenticate,
    asyncHandler(notificationController.markAsRead)
  );

  // ==========================================
  // LEGACY SELLER NOTIFICATION GATEWAYS (/seller/notifications/*)
  // ==========================================

  router.get(
    '/seller/notifications',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.getSellerNotifications)
  );

  router.get(
    '/seller/notifications/unread-count',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.getUnreadSellerNotificationCount)
  );

  router.patch(
    '/seller/notifications/:notificationId/read',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.markSellerNotificationAsRead)
  );

  router.patch(
    '/seller/notifications/read-all',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.markAllSellerNotificationsAsRead)
  );

  router.delete(
    '/seller/notifications/:notificationId',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.deleteSellerNotification)
  );

  // ==========================================
  // SELLER DASHBOARD ACTIVITY GATEWAYS (/seller/dashboard/*)
  // ==========================================

  router.get(
    '/seller/dashboard/recent-activities',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.getRecentSellerActivities)
  );

  // ==========================================
  // ENTERPRISE NOTIFICATION GATEWAYS (/api/v1/notifications/*)
  // ==========================================

  // Send a single notification (admin/system)
  router.post(
    '/api/v1/notifications/send',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.sendNotification)
  );

  // Send bulk notifications (admin/system)
  router.post(
    '/api/v1/notifications/send-bulk',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.sendBulkNotifications)
  );

  // Send notification to all users of a role (admin/system)
  router.post(
    '/api/v1/notifications/send-to-role',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.sendToRole)
  );

  // Get authenticated user's notifications (paginated, filterable)
  router.get(
    '/api/v1/notifications',
    authenticate,
    asyncHandler(notificationController.getNotifications)
  );

  // Get authenticated user's unread count
  router.get(
    '/api/v1/notifications/unread-count',
    authenticate,
    asyncHandler(notificationController.getUnreadCount)
  );

  // Mark all as read for authenticated user
  router.patch(
    '/api/v1/notifications/read-all',
    authenticate,
    asyncHandler(notificationController.markAllAsRead)
  );

  // Archive (soft-delete) a notification
  router.patch(
    '/api/v1/notifications/:notificationId/archive',
    authenticate,
    asyncHandler(notificationController.archiveNotification)
  );

  // Delete a notification
  router.delete(
    '/api/v1/notifications/:notificationId',
    authenticate,
    asyncHandler(notificationController.deleteNotification)
  );

  // Retry a failed notification (admin)
  router.post(
    '/api/v1/notifications/:notificationId/retry',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.retryNotification)
  );

  // Schedule a notification for future delivery (admin)
  router.post(
    '/api/v1/notifications/schedule',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.scheduleNotification)
  );

  // Cancel a scheduled notification
  router.delete(
    '/api/v1/notifications/:notificationId/schedule',
    authenticate,
    asyncHandler(notificationController.cancelScheduledNotification)
  );

  // Process all due scheduled notifications (admin/system)
  router.post(
    '/api/v1/notifications/process-scheduled',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.processScheduledNotifications)
  );

  // Get notification analytics (admin)
  router.get(
    '/api/v1/notifications/analytics',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.getNotificationAnalytics)
  );

  // ==========================================
  // TEMPLATE MANAGEMENT GATEWAYS (/api/v1/notifications/templates/*)
  // ==========================================

  router.post(
    '/api/v1/notifications/templates',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.createTemplate)
  );

  router.get(
    '/api/v1/notifications/templates',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.getTemplates)
  );

  router.get(
    '/api/v1/notifications/templates/:templateId',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.getTemplate)
  );

  router.put(
    '/api/v1/notifications/templates/:templateId',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.updateTemplate)
  );

  router.delete(
    '/api/v1/notifications/templates/:templateId',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(notificationController.deleteTemplate)
  );

  // ==========================================
  // PREFERENCE MANAGEMENT GATEWAYS (/api/v1/notifications/preferences/*)
  // ==========================================

  router.get(
    '/api/v1/notifications/preferences',
    authenticate,
    asyncHandler(notificationController.getPreferences)
  );

  router.put(
    '/api/v1/notifications/preferences',
    authenticate,
    asyncHandler(notificationController.updatePreferences)
  );

  return router;
};
