export const mapSystemSettings = (settings) => {
    if (!settings) return null;
    return {
        id: settings._id,
        general: settings.general,
        marketplace: settings.marketplace,
        orders: settings.orders,
        returns: settings.returns,
        coupons: settings.coupons,
        notifications: settings.notifications,
        security: settings.security,
        maintenance: settings.maintenance,
        appearance: settings.appearance,
        settingsVersion: settings.settingsVersion,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
    };
};
