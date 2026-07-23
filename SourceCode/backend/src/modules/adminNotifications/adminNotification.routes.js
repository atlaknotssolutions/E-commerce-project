export const createAdminNotificationRoutes = ({
    router,
    controller,
    authenticate,
    authorizeRoles,
    asyncHandler,
}) => {

    router.get(
        '/admin/notifications/statistics',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getStatistics)
    );

    router.get(
        '/admin/notifications',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getNotifications)
    );

    router.get(
        '/admin/notifications/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getNotificationById)
    );

    router.post(
        '/admin/notifications',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.createNotification)
    );

    router.put(
        '/admin/notifications/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateNotification)
    );

    router.delete(
        '/admin/notifications/:id',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.deleteNotification)
    );

    router.post(
        '/admin/notifications/:id/publish',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.publishNotification)
    );

    router.post(
        '/admin/notifications/:id/schedule',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.scheduleNotification)
    );

    router.post(
        '/admin/notifications/:id/archive',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.archiveNotification)
    );

    return Object.freeze(router);
};
