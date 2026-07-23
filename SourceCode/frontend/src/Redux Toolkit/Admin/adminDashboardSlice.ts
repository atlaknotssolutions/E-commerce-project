import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import { RootState } from '../Store';
import {
    AdminDashboardAnalytics,
    AdminDashboardState,
} from '../../types/adminDashboardTypes';

// API base URL
const DASHBOARD_API = '/admin/dashboard';

// Initial state
const initialState: AdminDashboardState = {
    analytics: null,
    loading: false,
    error: null,
    loaded: false,
    lastUpdated: null,
};

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchAdminDashboard = createAsyncThunk<AdminDashboardAnalytics, void, { rejectValue: string }>(
    'adminDashboard/fetchAdminDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<AdminDashboardAnalytics>(DASHBOARD_API);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch admin dashboard analytics'
            );
        }
    }
);

// ==========================================
// HELPERS
// ==========================================

const handlePending = (state: AdminDashboardState) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (state: AdminDashboardState, action: { payload?: string }) => {
    state.loading = false;
    state.error = action.payload || 'An error occurred';
};

// ==========================================
// SLICE
// ==========================================

const adminDashboardSlice = createSlice({
    name: 'adminDashboard',
    initialState,
    reducers: {
        clearAdminDashboardError: (state) => {
            state.error = null;
        },
        resetAdminDashboard: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchAdminDashboard
            .addCase(fetchAdminDashboard.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
                state.loaded = true;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchAdminDashboard.rejected, (state, action) => {
                handleRejected(state, action);
            });
    },
});

// ==========================================
// REDUCERS
// ==========================================

export const { clearAdminDashboardError, resetAdminDashboard } = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;

// ==========================================
// SELECTORS
// ==========================================

export const selectAdminDashboardAnalytics = (state: RootState) => state.adminDashboard.analytics;
export const selectAdminDashboardLoading = (state: RootState) => state.adminDashboard.loading;
export const selectAdminDashboardError = (state: RootState) => state.adminDashboard.error;
export const selectAdminDashboardLoaded = (state: RootState) => state.adminDashboard.loaded;
export const selectAdminDashboardLastUpdated = (state: RootState) => state.adminDashboard.lastUpdated;
