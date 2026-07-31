import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchCookieConsent,
    createCookieConsent,
    updateCookieConsent,
    deleteCookieConsent,
    fetchAdminConsentStats,
} from '../../services/cookieConsentApi';
import {
    CookieConsent,
    CreateConsentPayload,
    UpdateConsentPayload,
    AdminConsentStats,
    CookieConsentState,
} from '../../types/cookieConsentTypes';

const ANONYMOUS_ID_KEY = 'aiknots_anonymous_id';
const CONSENT_VERSION = '1.0';
const POLICY_VERSION = '1.0';

const getAnonymousId = (): string => {
    let id = localStorage.getItem(ANONYMOUS_ID_KEY);
    if (!id) {
        id = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(ANONYMOUS_ID_KEY, id);
    }
    return id;
};

const initialState: CookieConsentState = {
    consent: null,
    adminStats: null,
    loading: false,
    error: null,
    bannerVisible: false,
};

export const loadCookieConsent = createAsyncThunk<
    CookieConsent | null,
    void,
    { rejectValue: string }
>(
    'cookieConsent/load',
    async (_, { rejectWithValue }) => {
        try {
            const anonymousId = getAnonymousId();
            const response = await fetchCookieConsent(anonymousId);
            return response.data || null;
        } catch (error) {
            return rejectWithValue('Failed to load consent');
        }
    }
);

export const submitCookieConsent = createAsyncThunk<
    CookieConsent,
    CreateConsentPayload,
    { rejectValue: string }
>(
    'cookieConsent/submit',
    async (payload, { rejectWithValue }) => {
        try {
            const anonymousId = getAnonymousId();
            const data: CreateConsentPayload = {
                ...payload,
                anonymousId,
                consentVersion: CONSENT_VERSION,
                policyVersion: POLICY_VERSION,
            };
            const response = await createCookieConsent(data);
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to save consent');
        }
    }
);

export const updateCookieConsentPreferences = createAsyncThunk<
    CookieConsent,
    UpdateConsentPayload,
    { rejectValue: string }
>(
    'cookieConsent/update',
    async (payload, { rejectWithValue }) => {
        try {
            const anonymousId = getAnonymousId();
            const data: UpdateConsentPayload = {
                ...payload,
                anonymousId,
            };
            const response = await updateCookieConsent(data);
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to update consent');
        }
    }
);

export const withdrawCookieConsent = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>(
    'cookieConsent/withdraw',
    async (_, { rejectWithValue }) => {
        try {
            const anonymousId = getAnonymousId();
            await deleteCookieConsent(anonymousId);
        } catch (error) {
            return rejectWithValue('Failed to withdraw consent');
        }
    }
);

export const loadAdminConsentStats = createAsyncThunk<
    AdminConsentStats,
    { page?: number; limit?: number },
    { rejectValue: string }
>(
    'cookieConsent/adminStats',
    async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
        try {
            const response = await fetchAdminConsentStats(page, limit);
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to load admin consent statistics');
        }
    }
);

const cookieConsentSlice = createSlice({
    name: 'cookieConsent',
    initialState,
    reducers: {
        showBanner: (state) => {
            state.bannerVisible = true;
        },
        hideBanner: (state) => {
            state.bannerVisible = false;
        },
        clearConsentError: (state) => {
            state.error = null;
        },
        resetConsentState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadCookieConsent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadCookieConsent.fulfilled, (state, action) => {
                state.loading = false;
                state.consent = action.payload;
            })
            .addCase(loadCookieConsent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            .addCase(submitCookieConsent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitCookieConsent.fulfilled, (state, action) => {
                state.loading = false;
                state.consent = action.payload;
                state.bannerVisible = false;
            })
            .addCase(submitCookieConsent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            .addCase(updateCookieConsentPreferences.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCookieConsentPreferences.fulfilled, (state, action) => {
                state.loading = false;
                state.consent = action.payload;
                state.bannerVisible = false;
            })
            .addCase(updateCookieConsentPreferences.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            .addCase(withdrawCookieConsent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(withdrawCookieConsent.fulfilled, (state) => {
                state.loading = false;
                state.consent = null;
                state.bannerVisible = true;
            })
            .addCase(withdrawCookieConsent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            .addCase(loadAdminConsentStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadAdminConsentStats.fulfilled, (state, action) => {
                state.loading = false;
                state.adminStats = action.payload;
            })
            .addCase(loadAdminConsentStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            });
    },
});

export const {
    showBanner,
    hideBanner,
    clearConsentError,
    resetConsentState,
} = cookieConsentSlice.actions;

export default cookieConsentSlice.reducer;
