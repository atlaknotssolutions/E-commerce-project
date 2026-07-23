import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import {
    Commission,
    CommissionStatistics,
    SellerCommissionState,
} from '../../types/adminCommissionTypes';

const API_URL = '/seller/commissions';

const initialState: SellerCommissionState = {
    commissions: [],
    selectedCommission: null,
    statistics: null,
    pagination: null,
    loading: false,
    error: null,
    loaded: false,
};

export const fetchSellerCommissions = createAsyncThunk<
    { data: Commission[]; pagination: any },
    { status?: string; search?: string; page: number; limit: number },
    { rejectValue: string }
>(
    'sellerCommission/fetchAll',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, any> = {};
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;
            params.page = filters.page;
            params.limit = filters.limit;
            const response = await api.get(API_URL, { params });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch commissions');
        }
    }
);

export const fetchSellerCommissionStats = createAsyncThunk<
    CommissionStatistics,
    void,
    { rejectValue: string }
>(
    'sellerCommission/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`${API_URL}/statistics`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
        }
    }
);

const handlePending = (state: SellerCommissionState) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (state: SellerCommissionState, action: { payload?: string }) => {
    state.loading = false;
    state.error = action.payload || 'An error occurred';
};

const sellerCommissionSlice = createSlice({
    name: 'sellerCommission',
    initialState,
    reducers: {
        clearSellerCommissionError: (state) => { state.error = null; },
        clearSelectedSellerCommission: (state) => { state.selectedCommission = null; },
        resetSellerCommissionState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSellerCommissions.pending, handlePending)
            .addCase(fetchSellerCommissions.fulfilled, (state, action) => {
                state.loading = false;
                state.commissions = action.payload.data;
                state.pagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchSellerCommissions.rejected, handleRejected)
            .addCase(fetchSellerCommissionStats.pending, handlePending)
            .addCase(fetchSellerCommissionStats.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload;
            })
            .addCase(fetchSellerCommissionStats.rejected, handleRejected);
    },
});

export const {
    clearSellerCommissionError,
    clearSelectedSellerCommission,
    resetSellerCommissionState,
} = sellerCommissionSlice.actions;

export default sellerCommissionSlice.reducer;
