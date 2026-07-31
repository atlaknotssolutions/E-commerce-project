export interface GeneralSettings {
    platformName: string;
    platformLogo: string;
    supportEmail: string;
    supportPhone: string;
    timezone: string;
    currency: string;
    language: string;
    country: string;
    companyLegalName: string;
    GSTIN: string;
    PAN: string;
    CIN: string;
    website: string;
    address: string;
}

export interface MarketplaceSettings {
    marketplaceEnabled: boolean;
    sellerRegistrationEnabled: boolean;
    customerRegistrationEnabled: boolean;
    guestCheckout: boolean;
    autoApproveSeller: boolean;
    autoApproveProduct: boolean;
    commissionPercentage: number;
    gstPercentage: number;
    gstEnabled: boolean;
    commissionBase: 'selling_price' | 'post_coupon';
}

export interface OrderSettings {
    orderCancellationWindow: number;
    returnWindow: number;
    codEnabled: boolean;
    onlinePaymentEnabled: boolean;
    freeShippingThreshold: number;
}

export interface ReturnSettings {
    returnEnabled: boolean;
    refundEnabled: boolean;
    replacementEnabled: boolean;
    returnDays: number;
    autoRefund: boolean;
}

export interface CouponSettings {
    couponEnabled: boolean;
    maxDiscount: number;
    couponExpiryDefault: number;
}

export interface NotificationSettings {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    broadcastNotifications: boolean;
}

export interface SecuritySettings {
    passwordMinLength: number;
    sessionTimeout: number;
    loginAttemptLimit: number;
    twoFactorAuthEnabled: boolean;
}

export interface MaintenanceSettings {
    maintenanceMode: boolean;
    maintenanceMessage: string;
}

export interface BrandingAssets {
    logo: string;
    favicon: string;
    banner: string;
}

export interface AppearanceSettings {
    primaryColor: string;
    secondaryColor: string;
    theme: string;
    dateFormat: string;
    logoMaxSize: number;
    brandingAssets: BrandingAssets;
}

export interface InvoiceSettings {
    invoicePrefix: string;
    invoiceFooter: string;
    invoiceTerms: string;
    invoiceDefaultDueDays: number;
    invoiceShowGST: boolean;
    invoiceShowDiscount: boolean;
    invoiceAutoEmail: boolean;
}

export interface SystemSettings {
    id: string;
    general: GeneralSettings;
    marketplace: MarketplaceSettings;
    orders: OrderSettings;
    returns: ReturnSettings;
    coupons: CouponSettings;
    notifications: NotificationSettings;
    security: SecuritySettings;
    maintenance: MaintenanceSettings;
    appearance: AppearanceSettings;
    invoicing: InvoiceSettings;
    metadata: Record<string, any>;
    settingsVersion: number;
    createdAt: string;
    updatedAt: string;
}

export type SettingsSection =
    | 'general'
    | 'marketplace'
    | 'orders'
    | 'returns'
    | 'coupons'
    | 'notifications'
    | 'security'
    | 'maintenance'
    | 'appearance'
    | 'invoicing';

export interface AdminSystemSettingsState {
    settings: SystemSettings | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    actionSuccess: boolean;
}
