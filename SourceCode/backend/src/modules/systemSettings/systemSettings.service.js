export const createSystemSettingsService = ({
    systemSettingsRepository,
    createApiError,
    mapSystemSettings,
}) => {

    const getSettings = async () => {
        const settings = await systemSettingsRepository.getSettings();
        return mapSystemSettings(settings);
    };

    const updateSection = async (section, data) => {
        const validSections = [
            'general', 'marketplace', 'orders', 'returns',
            'coupons', 'notifications', 'security', 'maintenance', 'appearance',
            'invoicing',
        ];
        if (!validSections.includes(section)) {
            createApiError(`Invalid settings section: ${section}`, 400);
        }

        if (!data || Object.keys(data).length === 0) {
            createApiError('No data provided for update', 400);
        }

        const settings = await systemSettingsRepository.updateSection(section, data);
        return mapSystemSettings(settings);
    };

    const resetSettings = async () => {
        const settings = await systemSettingsRepository.resetSettings();
        return mapSystemSettings(settings);
    };

    return Object.freeze({
        getSettings,
        updateSection,
        resetSettings,
    });
};
