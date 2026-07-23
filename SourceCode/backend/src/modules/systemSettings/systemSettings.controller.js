export const createSystemSettingsController = ({ systemSettingsService }) => {

    const getSettings = async (req, res) => {
        const settings = await systemSettingsService.getSettings();
        res.status(200).json({ success: true, data: settings });
    };

    const updateGeneral = async (req, res) => {
        const settings = await systemSettingsService.updateSection('general', req.body);
        res.status(200).json({ success: true, data: settings });
    };

    const updateMarketplace = async (req, res) => {
        const settings = await systemSettingsService.updateSection('marketplace', req.body);
        res.status(200).json({ success: true, data: settings });
    };

    const updateOrders = async (req, res) => {
        const settings = await systemSettingsService.updateSection('orders', req.body);
        res.status(200).json({ success: true, data: settings });
    };

    const updateReturns = async (req, res) => {
        const settings = await systemSettingsService.updateSection('returns', req.body);
        res.status(200).json({ success: true, data: settings });
    };

    const updateCoupons = async (req, res) => {
        const settings = await systemSettingsService.updateSection('coupons', req.body);
        res.status(200).json({ success: true, data: settings });
    };

    const updateNotifications = async (req, res) => {
        const settings = await systemSettingsService.updateSection('notifications', req.body);
        res.status(200).json({ success: true, data: settings });
    };

    const updateSecurity = async (req, res) => {
        const settings = await systemSettingsService.updateSection('security', req.body);
        res.status(200).json({ success: true, data: settings });
    };

    const updateMaintenance = async (req, res) => {
        const settings = await systemSettingsService.updateSection('maintenance', req.body);
        res.status(200).json({ success: true, data: settings });
    };

    const updateAppearance = async (req, res) => {
        const settings = await systemSettingsService.updateSection('appearance', req.body);
        res.status(200).json({ success: true, data: settings });
    };

    const resetSettings = async (req, res) => {
        const settings = await systemSettingsService.resetSettings();
        res.status(200).json({ success: true, data: settings });
    };

    return Object.freeze({
        getSettings,
        updateGeneral,
        updateMarketplace,
        updateOrders,
        updateReturns,
        updateCoupons,
        updateNotifications,
        updateSecurity,
        updateMaintenance,
        updateAppearance,
        resetSettings,
    });
};
