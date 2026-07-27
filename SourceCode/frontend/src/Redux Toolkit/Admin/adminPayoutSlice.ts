import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import {
    AdminPayout,
    AdminPayoutStatistics,
    AdminPayoutFilters,
    AdminPayoutState,
} from '../../types/adminPayoutTypes';

const API_URL = '/admin/payouts';

const initialState: AdminPayoutState = {
    payouts: [],
    selectedPayout: null,
    statistics: null,
    pagination: null,
    loading: false,
    error: null,
    loaded: false,
    actionSuccess: false,
};

export const fetchAllPayouts = createAsyncThunk<
    { data: AdminPayout[]; pagination: any },
    AdminPayoutFilters,
    { rejectValue: string }
>(
    'adminPayout/fetchAll',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, any> = {};
            if (filters.status) params.status = filters.status;
            if (filters.seller) params.seller = filters.seller;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            params.page = filters.page;
            params.limit = filters.limit;
            const response = await api.get(API_URL, { params });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch payouts');
        }
    }
);

export const fetchPayout = createAsyncThunk<
    AdminPayout,
    string,
    { rejectValue: string }
>(
    'adminPayout/fetchOne',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch payout');
        }
    }
);

export const fetchPayoutStatistics = createAsyncThunk<
    AdminPayoutStatistics,
    void,
    { rejectValue: string }
>(
    'adminPayout/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`${API_URL}/statistics`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
        }
    }
);

export const approvePayoutAdmin = createAsyncThunk<
    AdminPayout,
    string,
    { rejectValue: string }
>(
    'adminPayout/approve',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.patch(`${API_URL}/${id}/approve`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve payout');
        }
    }
);

export const rejectPayoutAdmin = createAsyncThunk<
    AdminPayout,
    { id: string; reason?: string },
    { rejectValue: string }
>(
    'adminPayout/reject',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`${API_URL}/${id}/reject`, { reason });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject payout');
        }
    }
);

export const markPayoutPaidAdmin = createAsyncThunk<
    AdminPayout,
    string,
    { rejectValue: string }
>(
    'adminPayout/markPaid',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.patch(`${API_URL}/${id}/pay`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark payout as paid');
        }
    }
);

const handlePending = (state: AdminPayoutState) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (state: AdminPayoutState, action: { payload?: string }) => {
    state.loading = false;
    state.error = action.payload || 'An error occurred';
};

const adminPayoutSlice = createSlice({
    name: 'adminPayout',
    initialState,
    reducers: {
        clearAdminPayoutError: (state) => { state.error = null; },
        clearAdminPayoutActionSuccess: (state) => { state.actionSuccess = false; },
        clearSelectedPayout: (state) => { state.selectedPayout = null; },
        resetAdminPayoutState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPayouts.pending, handlePending)
            .addCase(fetchAllPayouts.fulfilled, (state, action) => {
                state.loading = false;
                state.payouts = action.payload.data;
                state.pagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchAllPayouts.rejected, handleRejected)
            .addCase(fetchPayout.pending, handlePending)
            .addCase(fetchPayout.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedPayout = action.payload;
            })
            .addCase(fetchPayout.rejected, handleRejected)
            .addCase(fetchPayoutStatistics.pending, handlePending)
            .addCase(fetchPayoutStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload;
            })
            .addCase(fetchPayoutStatistics.rejected, handleRejected)
            .addCase(approvePayoutAdmin.pending, handlePending)
            .addCase(approvePayoutAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.actionSuccess = true;
                state.payouts = state.payouts.map((p) =>
                    p.id === action.payload.id ? action.payload : p
                );
            })
            .addCase(approvePayoutAdmin.rejected, handleRejected)
            .addCase(rejectPayoutAdmin.pending, handlePending)
            .addCase(rejectPayoutAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.actionSuccess = true;
                state.payouts = state.payouts.map((p) =>
                    p.id === action.payload.id ? action.payload : p
                );
            })
            .addCase(rejectPayoutAdmin.rejected, handleRejected)
            .addCase(markPayoutPaidAdmin.pending, handlePending)
            .addCase(markPayoutPaidAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.actionSuccess = true;
                state.payouts = state.payouts.map((p) =>
                    p.id === action.payload.id ? action.payload : p
                );
            })
            .addCase(markPayoutPaidAdmin.rejected, handleRejected);
    },
});

export const {
    clearAdminPayoutError,
    clearAdminPayoutActionSuccess,
    clearSelectedPayout,
    resetAdminPayoutState,
} = adminPayoutSlice.actions;

export default adminPayoutSlice.reducer;
