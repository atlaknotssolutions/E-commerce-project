import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import {
    SystemSettings,
    AdminSystemSettingsState,
    GeneralSettings,
    MarketplaceSettings,
    OrderSettings,
    ReturnSettings,
    CouponSettings,
    NotificationSettings,
    SecuritySettings,
    MaintenanceSettings,
    AppearanceSettings,
    InvoiceSettings,
} from '../../types/adminSystemSettingsTypes';

const API_URL = '/admin/settings';

const initialState: AdminSystemSettingsState = {
    settings: null,
    loading: false,
    error: null,
    loaded: false,
    actionSuccess: false,
};

export const fetchSettings = createAsyncThunk<
    SystemSettings,
    void,
    { rejectValue: string }
>(
    'adminSystemSettings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<{ success: boolean; data: SystemSettings }>(API_URL);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch settings'
            );
        }
    }
);

export const updateGeneralSettings = createAsyncThunk<
    SystemSettings,
    Partial<GeneralSettings>,
    { rejectValue: string }
>(
    'adminSystemSettings/updateGeneral',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.patch<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/general`, data
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update general settings'
            );
        }
    }
);

export const updateMarketplaceSettings = createAsyncThunk<
    SystemSettings,
    Partial<MarketplaceSettings>,
    { rejectValue: string }
>(
    'adminSystemSettings/updateMarketplace',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.patch<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/marketplace`, data
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update marketplace settings'
            );
        }
    }
);

export const updateOrderSettings = createAsyncThunk<
    SystemSettings,
    Partial<OrderSettings>,
    { rejectValue: string }
>(
    'adminSystemSettings/updateOrders',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.patch<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/orders`, data
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update order settings'
            );
        }
    }
);

export const updateReturnSettings = createAsyncThunk<
    SystemSettings,
    Partial<ReturnSettings>,
    { rejectValue: string }
>(
    'adminSystemSettings/updateReturns',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.patch<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/returns`, data
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update return settings'
            );
        }
    }
);

export const updateCouponSettings = createAsyncThunk<
    SystemSettings,
    Partial<CouponSettings>,
    { rejectValue: string }
>(
    'adminSystemSettings/updateCoupons',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.patch<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/coupons`, data
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update coupon settings'
            );
        }
    }
);

export const updateNotificationSettings = createAsyncThunk<
    SystemSettings,
    Partial<NotificationSettings>,
    { rejectValue: string }
>(
    'adminSystemSettings/updateNotifications',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.patch<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/notifications`, data
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update notification settings'
            );
        }
    }
);

export const updateSecuritySettings = createAsyncThunk<
    SystemSettings,
    Partial<SecuritySettings>,
    { rejectValue: string }
>(
    'adminSystemSettings/updateSecurity',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.patch<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/security`, data
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update security settings'
            );
        }
    }
);

export const updateMaintenanceSettings = createAsyncThunk<
    SystemSettings,
    Partial<MaintenanceSettings>,
    { rejectValue: string }
>(
    'adminSystemSettings/updateMaintenance',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.patch<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/maintenance`, data
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update maintenance settings'
            );
        }
    }
);

export const updateAppearanceSettings = createAsyncThunk<
    SystemSettings,
    Partial<AppearanceSettings>,
    { rejectValue: string }
>(
    'adminSystemSettings/updateAppearance',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.patch<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/appearance`, data
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update appearance settings'
            );
        }
    }
);

export const updateInvoiceSettings = createAsyncThunk<
    SystemSettings,
    Partial<InvoiceSettings>,
    { rejectValue: string }
>(
    'adminSystemSettings/updateInvoice',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.patch<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/invoicing`, data
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update invoice settings'
            );
        }
    }
);

export const uploadLogo = createAsyncThunk<
    SystemSettings,
    FormData,
    { rejectValue: string }
>(
    'adminSystemSettings/uploadLogo',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/logo`, formData
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to upload logo'
            );
        }
    }
);

export const resetSettings = createAsyncThunk<
    SystemSettings,
    void,
    { rejectValue: string }
>(
    'adminSystemSettings/resetSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post<{ success: boolean; data: SystemSettings }>(
                `${API_URL}/reset`
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to reset settings'
            );
        }
    }
);

const handlePending = (state: AdminSystemSettingsState) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (state: AdminSystemSettingsState, action: { payload?: string }) => {
    state.loading = false;
    state.error = action.payload || 'An error occurred';
};

const adminSystemSettingsSlice = createSlice({
    name: 'adminSystemSettings',
    initialState,
    reducers: {
        clearAdminSystemSettingsError: (state) => {
            state.error = null;
        },
        clearAdminSystemSettingsActionSuccess: (state) => {
            state.actionSuccess = false;
        },
        resetAdminSystemSettingsState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.pending, handlePending)
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.loaded = true;
            })
            .addCase(fetchSettings.rejected, handleRejected)

            .addCase(updateGeneralSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateGeneralSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(updateGeneralSettings.rejected, handleRejected)

            .addCase(updateMarketplaceSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateMarketplaceSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(updateMarketplaceSettings.rejected, handleRejected)

            .addCase(updateOrderSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateOrderSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(updateOrderSettings.rejected, handleRejected)

            .addCase(updateReturnSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateReturnSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(updateReturnSettings.rejected, handleRejected)

            .addCase(updateCouponSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateCouponSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(updateCouponSettings.rejected, handleRejected)

            .addCase(updateNotificationSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateNotificationSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(updateNotificationSettings.rejected, handleRejected)

            .addCase(updateSecuritySettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateSecuritySettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(updateSecuritySettings.rejected, handleRejected)

            .addCase(updateMaintenanceSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateMaintenanceSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(updateMaintenanceSettings.rejected, handleRejected)

            .addCase(updateAppearanceSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateAppearanceSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(updateAppearanceSettings.rejected, handleRejected)

            .addCase(updateInvoiceSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateInvoiceSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(updateInvoiceSettings.rejected, handleRejected)

            .addCase(uploadLogo.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(uploadLogo.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(uploadLogo.rejected, handleRejected)

            .addCase(resetSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(resetSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.actionSuccess = true;
            })
            .addCase(resetSettings.rejected, handleRejected);
    },
});

export const {
    clearAdminSystemSettingsError,
    clearAdminSystemSettingsActionSuccess,
    resetAdminSystemSettingsState,
} = adminSystemSettingsSlice.actions;

export default adminSystemSettingsSlice.reducer;
