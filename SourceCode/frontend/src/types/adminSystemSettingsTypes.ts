export interface GeneralSettings {
    platformName: string;
    platformLogo: string;
    supportEmail: string;
    supportPhone: string;
    timezone: string;
    currency: string;
    language: string;
    country: string;
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
    brandingAssets: BrandingAssets;
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
    | 'appearance';

export interface AdminSystemSettingsState {
    settings: SystemSettings | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    actionSuccess: boolean;
}
