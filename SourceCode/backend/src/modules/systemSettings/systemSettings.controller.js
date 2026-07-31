export const createSystemSettingsController = ({ systemSettingsService, cloudinaryClient, createApiError }) => {

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

    const updateInvoicing = async (req, res) => {
        const settings = await systemSettingsService.updateSection('invoicing', req.body);
        res.status(200).json({ success: true, data: settings });
    };

    const uploadLogo = async (req, res) => {
        const file = req.file;
        if (!file?.buffer) {
            throw createApiError({ statusCode: 400, message: 'No image file provided' });
        }
        const maxSize = req.body.maxSize
            ? parseInt(req.body.maxSize, 10) * 1024 * 1024
            : 2 * 1024 * 1024;
        if (file.size > maxSize) {
            throw createApiError({ statusCode: 400, message: `File size exceeds limit of ${Math.round(maxSize / 1024 / 1024)}MB` });
        }
        const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw createApiError({ statusCode: 400, message: 'Only PNG, JPEG, SVG, and WebP images are allowed' });
        }
        const uploadedAsset = await cloudinaryClient.uploadImageBuffer(file.buffer, 'AI_knots_Commerce/branding');
        const settings = await systemSettingsService.updateSection('appearance', {
            'brandingAssets.logo': uploadedAsset.secureUrl,
        });
        res.status(200).json({ success: true, data: settings, secureUrl: uploadedAsset.secureUrl });
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
        updateInvoicing,
        uploadLogo,
        resetSettings,
    });
};
