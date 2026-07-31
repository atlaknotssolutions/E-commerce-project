export const createSystemSettingsRoutes = ({
    router,
    controller,
    authenticate,
    authorizeRoles,
    asyncHandler,
    upload,
}) => {

    router.get(
        '/admin/settings',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getSettings)
    );

    router.patch(
        '/admin/settings/general',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateGeneral)
    );

    router.patch(
        '/admin/settings/marketplace',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateMarketplace)
    );

    router.patch(
        '/admin/settings/orders',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateOrders)
    );

    router.patch(
        '/admin/settings/returns',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateReturns)
    );

    router.patch(
        '/admin/settings/coupons',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateCoupons)
    );

    router.patch(
        '/admin/settings/notifications',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateNotifications)
    );

    router.patch(
        '/admin/settings/security',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateSecurity)
    );

    router.patch(
        '/admin/settings/maintenance',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateMaintenance)
    );

    router.patch(
        '/admin/settings/appearance',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateAppearance)
    );

    router.patch(
        '/admin/settings/invoicing',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.updateInvoicing)
    );

    router.post(
        '/admin/settings/logo',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        upload.single('logo'),
        asyncHandler(controller.uploadLogo)
    );

    router.post(
        '/admin/settings/reset',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.resetSettings)
    );

    return Object.freeze(router);
};
