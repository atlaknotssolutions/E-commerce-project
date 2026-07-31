import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import {
    SellerVerificationState,
    SellerVerificationListResponse,
    SellerDetailResponse,
    SellerVerificationStatsResponse,
    SellerActionResponse,
} from '../../types/sellerVerificationTypes';

const API_URL = '/admin/sellers';

const initialState: SellerVerificationState = {
    pendingSellers: [],
    approvedSellers: [],
    rejectedSellers: [],
    suspendedSellers: [],
    selectedSeller: null,
    stats: null,
    pendingPagination: null,
    approvedPagination: null,
    rejectedPagination: null,
    suspendedPagination: null,
    loading: false,
    error: null,
    loaded: false,
    actionSuccess: false,
};

export const fetchPendingSellers = createAsyncThunk<
    SellerVerificationListResponse,
    { page?: number; limit?: number; search?: string },
    { rejectValue: string }
>(
    'sellerVerification/fetchPendingSellers',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<SellerVerificationListResponse>(
                `${API_URL}/pending`,
                { params }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch pending sellers'
            );
        }
    }
);

export const fetchApprovedSellers = createAsyncThunk<
    SellerVerificationListResponse,
    { page?: number; limit?: number; search?: string },
    { rejectValue: string }
>(
    'sellerVerification/fetchApprovedSellers',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<SellerVerificationListResponse>(
                `${API_URL}/approved`,
                { params }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch approved sellers'
            );
        }
    }
);

export const fetchRejectedSellers = createAsyncThunk<
    SellerVerificationListResponse,
    { page?: number; limit?: number; search?: string },
    { rejectValue: string }
>(
    'sellerVerification/fetchRejectedSellers',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<SellerVerificationListResponse>(
                `${API_URL}/rejected`,
                { params }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch rejected sellers'
            );
        }
    }
);

export const fetchSuspendedSellers = createAsyncThunk<
    SellerVerificationListResponse,
    { page?: number; limit?: number; search?: string },
    { rejectValue: string }
>(
    'sellerVerification/fetchSuspendedSellers',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<SellerVerificationListResponse>(
                `${API_URL}/suspended`,
                { params }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch suspended sellers'
            );
        }
    }
);

export const fetchSellerDetails = createAsyncThunk<
    SellerDetailResponse,
    string,
    { rejectValue: string }
>(
    'sellerVerification/fetchSellerDetails',
    async (sellerId, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<SellerDetailResponse>(
                `${API_URL}/${sellerId}`
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch seller details'
            );
        }
    }
);

export const approveSeller = createAsyncThunk<
    SellerActionResponse,
    { sellerId: string; note?: string },
    { rejectValue: string }
>(
    'sellerVerification/approveSeller',
    async ({ sellerId, note }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<SellerActionResponse>(
                `${API_URL}/${sellerId}/approve`,
                { note }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to approve seller'
            );
        }
    }
);

export const rejectSeller = createAsyncThunk<
    SellerActionResponse,
    { sellerId: string; reason: string },
    { rejectValue: string }
>(
    'sellerVerification/rejectSeller',
    async ({ sellerId, reason }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<SellerActionResponse>(
                `${API_URL}/${sellerId}/reject`,
                { reason }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to reject seller'
            );
        }
    }
);

export const suspendSellerAction = createAsyncThunk<
    SellerActionResponse,
    { sellerId: string; reason: string },
    { rejectValue: string }
>(
    'sellerVerification/suspendSeller',
    async ({ sellerId, reason }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<SellerActionResponse>(
                `${API_URL}/${sellerId}/suspend`,
                { reason }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to suspend seller'
            );
        }
    }
);

export const restoreSellerAction = createAsyncThunk<
    SellerActionResponse,
    string,
    { rejectValue: string }
>(
    'sellerVerification/restoreSeller',
    async (sellerId, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<SellerActionResponse>(
                `${API_URL}/${sellerId}/restore`
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to restore seller'
            );
        }
    }
);

export const fetchSellerVerificationStats = createAsyncThunk<
    SellerVerificationStatsResponse,
    void,
    { rejectValue: string }
>(
    'sellerVerification/fetchStats',
    async (_, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<SellerVerificationStatsResponse>(
                `${API_URL}/stats`
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch verification stats'
            );
        }
    }
);

const handlePending = (state: SellerVerificationState) =>
{
    state.loading = true;
    state.error = null;
};

const handleRejected = (state: SellerVerificationState, action: { payload?: string }) =>
{
    state.loading = false;
    state.error = action.payload || 'An error occurred';
};

const sellerVerificationSlice = createSlice({
    name: 'sellerVerification',
    initialState,
    reducers: {
        clearSellerVerificationError: (state) =>
        {
            state.error = null;
        },
        clearActionSuccess: (state) =>
        {
            state.actionSuccess = false;
        },
        clearSelectedSeller: (state) =>
        {
            state.selectedSeller = null;
        },
        resetSellerVerificationState: () =>
        {
            return initialState;
        },
    },
    extraReducers: (builder) =>
    {
        builder
            // fetchPendingSellers
            .addCase(fetchPendingSellers.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchPendingSellers.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.pendingSellers = action.payload.data;
                state.pendingPagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchPendingSellers.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchApprovedSellers
            .addCase(fetchApprovedSellers.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchApprovedSellers.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.approvedSellers = action.payload.data;
                state.approvedPagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchApprovedSellers.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchRejectedSellers
            .addCase(fetchRejectedSellers.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchRejectedSellers.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.rejectedSellers = action.payload.data;
                state.rejectedPagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchRejectedSellers.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchSuspendedSellers
            .addCase(fetchSuspendedSellers.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchSuspendedSellers.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.suspendedSellers = action.payload.data;
                state.suspendedPagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchSuspendedSellers.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchSellerDetails
            .addCase(fetchSellerDetails.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchSellerDetails.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.selectedSeller = action.payload.data;
            })
            .addCase(fetchSellerDetails.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // approveSeller
            .addCase(approveSeller.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(approveSeller.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload.data;

                state.pendingSellers = state.pendingSellers.filter(
                    (s) => s.id !== updated.id
                );
                state.selectedSeller = updated;
            })
            .addCase(approveSeller.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // rejectSeller
            .addCase(rejectSeller.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(rejectSeller.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload.data;

                state.pendingSellers = state.pendingSellers.filter(
                    (s) => s.id !== updated.id
                );
                state.selectedSeller = updated;
            })
            .addCase(rejectSeller.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // suspendSeller
            .addCase(suspendSellerAction.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(suspendSellerAction.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload.data;

                state.approvedSellers = state.approvedSellers.filter(
                    (s) => s.id !== updated.id
                );
                state.selectedSeller = updated;
            })
            .addCase(suspendSellerAction.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // restoreSeller
            .addCase(restoreSellerAction.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(restoreSellerAction.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload.data;

                state.suspendedSellers = state.suspendedSellers.filter(
                    (s) => s.id !== updated.id
                );
                state.selectedSeller = updated;
            })
            .addCase(restoreSellerAction.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchSellerVerificationStats
            .addCase(fetchSellerVerificationStats.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchSellerVerificationStats.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.stats = action.payload.data;
            })
            .addCase(fetchSellerVerificationStats.rejected, (state, action) =>
            {
                handleRejected(state, action);
            });
    },
});

export const {
    clearSellerVerificationError,
    clearActionSuccess,
    clearSelectedSeller,
    resetSellerVerificationState,
} = sellerVerificationSlice.actions;

export default sellerVerificationSlice.reducer;
