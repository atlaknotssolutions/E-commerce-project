export const createSystemSettingsRepository = ({ SystemSettings }) => {

    const getSettings = async () => {
        let settings = await SystemSettings.findOne().lean();
        if (!settings) {
            settings = await SystemSettings.create({});
            settings = settings.toObject();
        }
        return settings;
    };

    const updateSection = async (section, data) => {
        const update = {};
        Object.entries(data).forEach(([key, value]) => {
            update[`${section}.${key}`] = value;
        });
        update.$inc = { settingsVersion: 1 };

        const settings = await SystemSettings.findOneAndUpdate(
            {},
            { $set: update, $inc: { settingsVersion: 1 } },
            { new: true, upsert: true }
        ).lean();
        return settings;
    };

    const resetSettings = async () => {
        await SystemSettings.deleteMany({});
        const settings = await SystemSettings.create({});
        return settings.toObject();
    };

    return Object.freeze({
        getSettings,
        updateSection,
        resetSettings,
    });
};
