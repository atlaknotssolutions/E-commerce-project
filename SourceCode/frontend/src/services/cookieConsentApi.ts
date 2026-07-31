import { api } from '../Config/Api';
import {
    CreateConsentPayload,
    UpdateConsentPayload,
    AdminConsentStats,
} from '../types/cookieConsentTypes';

const CONSENT_API = '/api/cookies/consent';

export const fetchCookieConsent = async (anonymousId?: string) => {
    const params: Record<string, string> = {};
    if (anonymousId) params.anonymousId = anonymousId;
    const response = await api.get(CONSENT_API, { params });
    return response.data;
};

export const createCookieConsent = async (payload: CreateConsentPayload) => {
    const response = await api.post(CONSENT_API, payload);
    return response.data;
};

export const updateCookieConsent = async (payload: UpdateConsentPayload) => {
    const response = await api.put(CONSENT_API, payload);
    return response.data;
};

export const deleteCookieConsent = async (anonymousId?: string) => {
    const params: Record<string, string> = {};
    if (anonymousId) params.anonymousId = anonymousId;
    const response = await api.delete(CONSENT_API, { params });
    return response.data;
};

export const fetchAdminConsentStats = async (page = 1, limit = 20): Promise<{ data: AdminConsentStats }> => {
    const response = await api.get(`${CONSENT_API}/stats`, { params: { page, limit } });
    return response.data;
};
