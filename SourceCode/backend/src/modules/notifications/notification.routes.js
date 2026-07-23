/**
 * Pure function-based routing factory representing the Customer Notifications API gateways.
 * Binds notification paths directly to authenticators filters using dependency injection.
 */
export const createNotificationRoutes = ({ 
  router, 
  notificationController, 
  authenticate,
  authorizeRoles,
  asyncHandler 
}) => {

  // ==========================================
  // SECURED NOTIFICATIONS GATEWAYS (/api/notifications/*)
  // ==========================================

  // Customer Endpoint: Recalculates and pulls active user notification alerts details (Authentication required)
  router.get(
    '/api/notifications', 
    authenticate, 
    asyncHandler(notificationController.getCustomerNotifications)
  );

  // Customer Endpoint: Toggles notification readStatus inside user alerts array
  router.patch(
    '/api/notifications/:notificationId/read', 
    authenticate, 
    asyncHandler(notificationController.markAsRead)
  );

  // ==========================================
  // SELLER NOTIFICATION GATEWAYS (/seller/notifications/*)
  // ==========================================

  // Seller Endpoint: Get seller notifications (limit 50)
  router.get(
    '/seller/notifications',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.getSellerNotifications)
  );

  // Seller Endpoint: Get unread notification count
  router.get(
    '/seller/notifications/unread-count',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.getUnreadSellerNotificationCount)
  );

  // Seller Endpoint: Mark single notification as read
  router.patch(
    '/seller/notifications/:notificationId/read',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.markSellerNotificationAsRead)
  );

  // Seller Endpoint: Mark all notifications as read
  router.patch(
    '/seller/notifications/read-all',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.markAllSellerNotificationsAsRead)
  );

  // Seller Endpoint: Delete a notification
  router.delete(
    '/seller/notifications/:notificationId',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.deleteSellerNotification)
  );

  // ==========================================
  // SELLER DASHBOARD ACTIVITY GATEWAYS (/seller/dashboard/*)
  // ==========================================

  // Seller Endpoint: Get recent activities from multiple collections
  router.get(
    '/seller/dashboard/recent-activities',
    authenticate,
    authorizeRoles('ROLE_SELLER'),
    asyncHandler(notificationController.getRecentSellerActivities)
  );

  return router;
};