import mongoose from 'mongoose';

const SystemSettingsSchema = new mongoose.Schema({
    general: {
        platformName: { type: String, default: 'AI Knots Marketplace' },
        platformLogo: { type: String, default: '' },
        supportEmail: { type: String, default: 'support@aiknots.com' },
        supportPhone: { type: String, default: '' },
        timezone: { type: String, default: 'UTC' },
        currency: { type: String, default: 'INR' },
        language: { type: String, default: 'en' },
        country: { type: String, default: 'IN' },
        companyLegalName: { type: String, default: '' },
        GSTIN: { type: String, default: '' },
        PAN: { type: String, default: '' },
        CIN: { type: String, default: '' },
        website: { type: String, default: '' },
        address: { type: String, default: '' },
    },
    marketplace: {
        marketplaceEnabled: { type: Boolean, default: true },
        sellerRegistrationEnabled: { type: Boolean, default: true },
        customerRegistrationEnabled: { type: Boolean, default: true },
        guestCheckout: { type: Boolean, default: false },
        autoApproveSeller: { type: Boolean, default: false },
        autoApproveProduct: { type: Boolean, default: false },
        commissionPercentage: { type: Number, default: 10, min: 0, max: 100 },
        gstPercentage: { type: Number, default: 18, min: 0, max: 100 },
        gstEnabled: { type: Boolean, default: true },
        commissionBase: { type: String, enum: ['selling_price', 'post_coupon'], default: 'selling_price' },
    },
    orders: {
        orderCancellationWindow: { type: Number, default: 24 },
        returnWindow: { type: Number, default: 30 },
        codEnabled: { type: Boolean, default: true },
        onlinePaymentEnabled: { type: Boolean, default: true },
        freeShippingThreshold: { type: Number, default: 0 },
    },
    returns: {
        returnEnabled: { type: Boolean, default: true },
        refundEnabled: { type: Boolean, default: true },
        replacementEnabled: { type: Boolean, default: true },
        returnDays: { type: Number, default: 30 },
        autoRefund: { type: Boolean, default: false },
    },
    coupons: {
        couponEnabled: { type: Boolean, default: true },
        maxDiscount: { type: Number, default: 50 },
        couponExpiryDefault: { type: Number, default: 30 },
    },
    notifications: {
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false },
        pushNotifications: { type: Boolean, default: true },
        broadcastNotifications: { type: Boolean, default: true },
    },
    security: {
        passwordMinLength: { type: Number, default: 8 },
        sessionTimeout: { type: Number, default: 30 },
        loginAttemptLimit: { type: Number, default: 5 },
        twoFactorAuthEnabled: { type: Boolean, default: false },
    },
    maintenance: {
        maintenanceMode: { type: Boolean, default: false },
        maintenanceMessage: { type: String, default: 'We are currently undergoing scheduled maintenance. Please check back later.' },
    },
    appearance: {
        primaryColor: { type: String, default: '#4F46E5' },
        secondaryColor: { type: String, default: '#06B6D4' },
        theme: { type: String, default: 'light' },
        dateFormat: { type: String, default: 'DD/MM/YYYY' },
        logoMaxSize: { type: Number, default: 2 },
        brandingAssets: {
            logo: { type: String, default: '' },
            favicon: { type: String, default: '' },
            banner: { type: String, default: '' },
        },
    },
    invoicing: {
        invoicePrefix: { type: String, default: 'INV-' },
        invoiceFooter: { type: String, default: 'Thank you for your business!' },
        invoiceTerms: { type: String, default: 'Payment due within 30 days.' },
        invoiceDefaultDueDays: { type: Number, default: 30 },
        invoiceShowGST: { type: Boolean, default: true },
        invoiceShowDiscount: { type: Boolean, default: true },
        invoiceAutoEmail: { type: Boolean, default: true },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    settingsVersion: { type: Number, default: 1 },
}, {
    timestamps: true,
});

SystemSettingsSchema.index({}, { unique: true });

export const SystemSettings = mongoose.model('SystemSettings', SystemSettingsSchema);
