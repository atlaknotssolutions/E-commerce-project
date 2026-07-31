import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../Redux Toolkit/Store';
import {
    loadCookieConsent,
    submitCookieConsent,
    updateCookieConsentPreferences,
    withdrawCookieConsent,
    showBanner,
} from '../Redux Toolkit/Customer/cookieConsentSlice';
import { CookieConsentPreferences } from '../types/cookieConsentTypes';

const CONSENT_STORAGE_KEY = 'aiknots_cookie_consent';
const CONSENT_VERSION_KEY = 'aiknots_cookie_consent_version';
const POLICY_VERSION_KEY = 'aiknots_cookie_policy_version';
const CONSENT_DATE_KEY = 'aiknots_cookie_consent_date';

const CURRENT_CONSENT_VERSION = '1.0';
const CURRENT_POLICY_VERSION = '1.0';

export const useCookieConsent = () => {
    const dispatch = useAppDispatch();
    const { consent, loading, error, bannerVisible } = useAppSelector(
        (store) => store.cookieConsent
    );

    const checkVersionMismatch = useCallback((): boolean => {
        const savedConsentVersion = localStorage.getItem(CONSENT_VERSION_KEY);
        const savedPolicyVersion = localStorage.getItem(POLICY_VERSION_KEY);

        if (savedConsentVersion !== CURRENT_CONSENT_VERSION) return true;
        if (savedPolicyVersion !== CURRENT_POLICY_VERSION) return true;
        return false;
    }, []);

    const saveToLocalStorage = (preferences: CookieConsentPreferences) => {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
        localStorage.setItem(CONSENT_VERSION_KEY, CURRENT_CONSENT_VERSION);
        localStorage.setItem(POLICY_VERSION_KEY, CURRENT_POLICY_VERSION);
        localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    };

    const clearLocalStorage = () => {
        localStorage.removeItem(CONSENT_STORAGE_KEY);
        localStorage.removeItem(CONSENT_VERSION_KEY);
        localStorage.removeItem(POLICY_VERSION_KEY);
        localStorage.removeItem(CONSENT_DATE_KEY);
    };

    const hasLocalConsent = useCallback((): boolean => {
        const local = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!local) return false;
        if (checkVersionMismatch()) {
            clearLocalStorage();
            return false;
        }
        return true;
    }, [checkVersionMismatch]);

    useEffect(() => {
        dispatch(loadCookieConsent());
    }, [dispatch]);

    useEffect(() => {
        if (!loading && !consent && hasLocalConsent()) {
            const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
            if (saved) {
                try {
                    const prefs = JSON.parse(saved) as CookieConsentPreferences;
                    dispatch(submitCookieConsent({
                        analyticsAccepted: prefs.analytics,
                        marketingAccepted: prefs.marketing,
                        preferencesAccepted: prefs.preferences,
                    }));
                } catch {
                    dispatch(showBanner());
                }
            }
        } else if (!loading && !consent && !hasLocalConsent()) {
            dispatch(showBanner());
        }
    }, [loading, consent, dispatch, hasLocalConsent]);

    const handleAcceptAll = useCallback(() => {
        const prefs: CookieConsentPreferences = {
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true,
        };
        saveToLocalStorage(prefs);
        dispatch(submitCookieConsent({
            analyticsAccepted: true,
            marketingAccepted: true,
            preferencesAccepted: true,
            sourcePage: window.location.pathname,
        }));
    }, [dispatch]);

    const handleRejectOptional = useCallback(() => {
        const prefs: CookieConsentPreferences = {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false,
        };
        saveToLocalStorage(prefs);
        dispatch(submitCookieConsent({
            analyticsAccepted: false,
            marketingAccepted: false,
            preferencesAccepted: false,
            sourcePage: window.location.pathname,
        }));
    }, [dispatch]);

    const handleSaveCustom = useCallback((preferences: CookieConsentPreferences) => {
        saveToLocalStorage(preferences);
        dispatch(updateCookieConsentPreferences({
            analyticsAccepted: preferences.analytics,
            marketingAccepted: preferences.marketing,
            preferencesAccepted: preferences.preferences,
        }));
    }, [dispatch]);

    const handleWithdraw = useCallback(() => {
        clearLocalStorage();
        dispatch(withdrawCookieConsent());
    }, [dispatch]);

    const handleChangePreferences = useCallback(() => {
        dispatch(showBanner());
    }, [dispatch]);

    const getConsentPreferences = useCallback((): CookieConsentPreferences | null => {
        const local = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!local) return null;
        try {
            return JSON.parse(local) as CookieConsentPreferences;
        } catch {
            return null;
        }
    }, []);

    const isAnalyticsAccepted = useCallback((): boolean => {
        const prefs = getConsentPreferences();
        return prefs?.analytics ?? false;
    }, [getConsentPreferences]);

    const isMarketingAccepted = useCallback((): boolean => {
        const prefs = getConsentPreferences();
        return prefs?.marketing ?? false;
    }, [getConsentPreferences]);

    const isPreferencesAccepted = useCallback((): boolean => {
        const prefs = getConsentPreferences();
        return prefs?.preferences ?? false;
    }, [getConsentPreferences]);

    return {
        consent,
        loading,
        error,
        bannerVisible,
        handleAcceptAll,
        handleRejectOptional,
        handleSaveCustom,
        handleWithdraw,
        handleChangePreferences,
        getConsentPreferences,
        isAnalyticsAccepted,
        isMarketingAccepted,
        isPreferencesAccepted,
    };
};
