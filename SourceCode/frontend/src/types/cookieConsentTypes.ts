export type ConsentStatus = 'accepted' | 'customized' | 'rejected';

export type UserRole = 'ROLE_CUSTOMER' | 'ROLE_SELLER' | 'ROLE_ADMIN';

export interface PopulatedUser {
    _id: string;
    fullName: string;
    email: string;
    role: UserRole;
}

export interface CookieConsent {
    _id: string;
    userId: string | PopulatedUser | null;
    anonymousId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    browser: string | null;
    os: string | null;
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    country: string | null;
    city: string | null;
    language: string | null;
    timezone: string | null;
    consentVersion: string;
    policyVersion: string;
    necessaryCookies: boolean;
    analyticsAccepted: boolean;
    marketingAccepted: boolean;
    preferencesAccepted: boolean;
    acceptedAt: string;
    sourcePage: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CookieConsentPreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
}

export interface CreateConsentPayload {
    anonymousId?: string;
    analyticsAccepted: boolean;
    marketingAccepted: boolean;
    preferencesAccepted: boolean;
    consentVersion?: string;
    policyVersion?: string;
    sourcePage?: string;
    country?: string;
    city?: string;
    language?: string;
    timezone?: string;
}

export interface UpdateConsentPayload {
    anonymousId?: string;
    analyticsAccepted?: boolean;
    marketingAccepted?: boolean;
    preferencesAccepted?: boolean;
    consentVersion?: string;
    policyVersion?: string;
}

export interface ConsentStatistics {
    totalConsents: number;
    totalAccepted: number;
    totalRejected: number;
    acceptedToday: number;
    analyticsPercentage: number;
    marketingPercentage: number;
    preferencesPercentage: number;
}

export interface CountryDistribution {
    country: string;
    count: number;
}

export interface ConsentPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AdminConsentStats {
    statistics: ConsentStatistics;
    countryDistribution: CountryDistribution[];
    recentConsents: CookieConsent[];
    pagination: ConsentPagination;
}

export interface CookieConsentState {
    consent: CookieConsent | null;
    adminStats: AdminConsentStats | null;
    loading: boolean;
    error: string | null;
    bannerVisible: boolean;
}

export const CONSENT_STATUS_LABELS: Record<ConsentStatus, string> = {
    accepted: 'Accepted',
    customized: 'Customized',
    rejected: 'Rejected',
};

export const USER_TYPE_LABELS: Record<string, string> = {
    ROLE_CUSTOMER: 'Customer',
    ROLE_SELLER: 'Seller',
    ROLE_ADMIN: 'Admin',
};
