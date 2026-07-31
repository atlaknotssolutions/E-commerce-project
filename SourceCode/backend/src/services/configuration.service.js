export const createConfigurationService = ({ systemSettingsRepository }) => {
    let cache = null;
    let cacheTimestamp = 0;
    const CACHE_TTL_MS = 60000;

    const loadSettings = async () => {
        const now = Date.now();
        if (cache && now - cacheTimestamp < CACHE_TTL_MS) {
            return cache;
        }
        const settings = await systemSettingsRepository.getSettings();
        cache = settings;
        cacheTimestamp = now;
        return settings;
    };

    const invalidateCache = () => {
        cache = null;
        cacheTimestamp = 0;
    };

    const getGeneralConfig = async () => {
        const s = await loadSettings();
        const g = s.general || {};
        return {
            platformName: g.platformName || 'AI Knots Marketplace',
            platformLogo: g.platformLogo || '',
            companyLegalName: g.companyLegalName || '',
            GSTIN: g.GSTIN || '',
            PAN: g.PAN || '',
            CIN: g.CIN || '',
            supportEmail: g.supportEmail || '',
            supportPhone: g.supportPhone || '',
            website: g.website || '',
            address: g.address || '',
            timezone: g.timezone || 'UTC',
            currency: g.currency || 'INR',
            language: g.language || 'en',
            country: g.country || 'IN',
        };
    };

    const getCommissionConfig = async () => {
        const s = await loadSettings();
        const m = s.marketplace || {};
        return {
            commissionPercentage: m.commissionPercentage ?? 10,
            gstPercentage: m.gstPercentage ?? 18,
            gstEnabled: m.gstEnabled !== false,
            commissionBase: m.commissionBase || 'selling_price',
            currency: (s.general || {}).currency || 'INR',
        };
    };

    const getAppearanceConfig = async () => {
        const s = await loadSettings();
        const a = s.appearance || {};
        return {
            primaryColor: a.primaryColor || '#4F46E5',
            secondaryColor: a.secondaryColor || '#06B6D4',
            theme: a.theme || 'light',
            dateFormat: a.dateFormat || 'DD/MM/YYYY',
            logoMaxSize: a.logoMaxSize || 2,
            brandingAssets: a.brandingAssets || { logo: '', favicon: '', banner: '' },
        };
    };

    const getInvoicingConfig = async () => {
        const s = await loadSettings();
        const i = s.invoicing || {};
        const g = await getGeneralConfig();
        return {
            invoicePrefix: i.invoicePrefix || 'INV-',
            invoiceFooter: i.invoiceFooter || 'Thank you for your business!',
            invoiceTerms: i.invoiceTerms || 'Payment due within 30 days.',
            invoiceDefaultDueDays: i.invoiceDefaultDueDays ?? 30,
            invoiceShowGST: i.invoiceShowGST !== false,
            invoiceShowDiscount: i.invoiceShowDiscount !== false,
            invoiceAutoEmail: i.invoiceAutoEmail !== false,
            companyLegalName: g.companyLegalName || g.platformName,
            GSTIN: g.GSTIN,
            PAN: g.PAN,
            CIN: g.CIN,
            address: g.address,
            platformName: g.platformName,
            supportEmail: g.supportEmail,
            supportPhone: g.supportPhone,
            website: g.website,
            logo: g.platformLogo || '',
        };
    };

    const getMaintenanceConfig = async () => {
        const s = await loadSettings();
        const m = s.maintenance || {};
        return {
            maintenanceMode: m.maintenanceMode || false,
            maintenanceMessage: m.maintenanceMessage || '',
        };
    };

    const getOrderConfig = async () => {
        const s = await loadSettings();
        const o = s.orders || {};
        return {
            orderCancellationWindow: o.orderCancellationWindow ?? 24,
            returnWindow: o.returnWindow ?? 30,
            codEnabled: o.codEnabled !== false,
            onlinePaymentEnabled: o.onlinePaymentEnabled !== false,
            freeShippingThreshold: o.freeShippingThreshold || 0,
        };
    };

    const getRawSettings = async () => {
        return await loadSettings();
    };

    return Object.freeze({
        getGeneralConfig,
        getCommissionConfig,
        getAppearanceConfig,
        getInvoicingConfig,
        getMaintenanceConfig,
        getOrderConfig,
        getRawSettings,
        invalidateCache,
    });
};
