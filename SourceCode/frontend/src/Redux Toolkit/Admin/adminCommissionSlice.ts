import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import {
    Commission,
    CommissionStatistics,
    CommissionFilters,
    AdminCommissionState,
} from '../../types/adminCommissionTypes';

const API_URL = '/admin/commissions';

const initialState: AdminCommissionState = {
    commissions: [],
    selectedCommission: null,
    statistics: null,
    pagination: null,
    loading: false,
    error: null,
    loaded: false,
    actionSuccess: false,
};

export const fetchAllCommissions = createAsyncThunk<
    { data: Commission[]; pagination: any },
    CommissionFilters,
    { rejectValue: string }
>(
    'adminCommission/fetchAll',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, any> = {};
            if (filters.status) params.status = filters.status;
            if (filters.seller) params.seller = filters.seller;
            if (filters.search) params.search = filters.search;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            params.page = filters.page;
            params.limit = filters.limit;
            const response = await api.get(API_URL, { params });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch commissions');
        }
    }
);

export const fetchCommission = createAsyncThunk<
    Commission,
    string,
    { rejectValue: string }
>(
    'adminCommission/fetchOne',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch commission');
        }
    }
);

export const calculateCommission = createAsyncThunk<
    Commission,
    string,
    { rejectValue: string }
>(
    'adminCommission/calculate',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await api.post(`${API_URL}/calculate/${orderId}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to calculate commission');
        }
    }
);

export const fetchCommissionStatistics = createAsyncThunk<
    CommissionStatistics,
    void,
    { rejectValue: string }
>(
    'adminCommission/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`${API_URL}/statistics`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
        }
    }
);

const handlePending = (state: AdminCommissionState) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (state: AdminCommissionState, action: { payload?: string }) => {
    state.loading = false;
    state.error = action.payload || 'An error occurred';
};

const adminCommissionSlice = createSlice({
    name: 'adminCommission',
    initialState,
    reducers: {
        clearAdminCommissionError: (state) => { state.error = null; },
        clearAdminCommissionActionSuccess: (state) => { state.actionSuccess = false; },
        clearSelectedCommission: (state) => { state.selectedCommission = null; },
        resetAdminCommissionState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllCommissions.pending, handlePending)
            .addCase(fetchAllCommissions.fulfilled, (state, action) => {
                state.loading = false;
                state.commissions = action.payload.data;
                state.pagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchAllCommissions.rejected, handleRejected)
            .addCase(fetchCommission.pending, handlePending)
            .addCase(fetchCommission.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedCommission = action.payload;
            })
            .addCase(fetchCommission.rejected, handleRejected)
            .addCase(calculateCommission.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(calculateCommission.fulfilled, (state, action) => {
                state.loading = false;
                state.actionSuccess = true;
                state.commissions.unshift(action.payload);
            })
            .addCase(calculateCommission.rejected, handleRejected)
            .addCase(fetchCommissionStatistics.pending, handlePending)
            .addCase(fetchCommissionStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload;
            })
            .addCase(fetchCommissionStatistics.rejected, handleRejected);
    },
});

export const {
    clearAdminCommissionError,
    clearAdminCommissionActionSuccess,
    clearSelectedCommission,
    resetAdminCommissionState,
} = adminCommissionSlice.actions;

export default adminCommissionSlice.reducer;
