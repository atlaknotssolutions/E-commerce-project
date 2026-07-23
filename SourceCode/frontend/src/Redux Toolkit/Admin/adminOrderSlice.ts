import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import {
    AdminOrderState,
    AdminOrderListResponse,
    AdminOrderDetailResponse,
    AdminOrderStatsResponse,
    AdminOrderActionResponse,
} from '../../types/adminOrderTypes';

const API_URL = '/admin/orders';

const initialState: AdminOrderState = {
    orders: [],
    selectedOrder: null,
    stats: null,
    pagination: null,
    loading: false,
    error: null,
    loaded: false,
    actionSuccess: false,
};

export const fetchAdminOrders = createAsyncThunk<
    AdminOrderListResponse,
    {
        page?: number;
        limit?: number;
        search?: string;
        orderStatus?: string;
        paymentStatus?: string;
        sortBy?: string;
        sortOrder?: string;
    },
    { rejectValue: string }
>(
    'adminOrder/fetchOrders',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<AdminOrderListResponse>(
                API_URL,
                { params }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch orders'
            );
        }
    }
);

export const fetchAdminOrderDetails = createAsyncThunk<
    AdminOrderDetailResponse,
    string,
    { rejectValue: string }
>(
    'adminOrder/fetchOrderDetails',
    async (orderId, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<AdminOrderDetailResponse>(
                `${API_URL}/${orderId}`
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch order details'
            );
        }
    }
);

export const updateAdminOrderStatus = createAsyncThunk<
    AdminOrderActionResponse,
    { orderId: string; orderStatus: string; adminNote?: string },
    { rejectValue: string }
>(
    'adminOrder/updateStatus',
    async ({ orderId, orderStatus, adminNote }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<AdminOrderActionResponse>(
                `${API_URL}/${orderId}/status`,
                { orderStatus, adminNote }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update order status'
            );
        }
    }
);

export const fetchAdminOrderStats = createAsyncThunk<
    AdminOrderStatsResponse,
    void,
    { rejectValue: string }
>(
    'adminOrder/fetchStats',
    async (_, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<AdminOrderStatsResponse>(
                `${API_URL}/stats`
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch order stats'
            );
        }
    }
);

const handlePending = (state: AdminOrderState) =>
{
    state.loading = true;
    state.error = null;
};

const handleRejected = (state: AdminOrderState, action: { payload?: string }) =>
{
    state.loading = false;
    state.error = action.payload || 'An error occurred';
};

const adminOrderSlice = createSlice({
    name: 'adminOrder',
    initialState,
    reducers: {
        clearAdminOrderError: (state) =>
        {
            state.error = null;
        },
        clearAdminOrderActionSuccess: (state) =>
        {
            state.actionSuccess = false;
        },
        clearSelectedOrder: (state) =>
        {
            state.selectedOrder = null;
        },
        resetAdminOrderState: () =>
        {
            return initialState;
        },
    },
    extraReducers: (builder) =>
    {
        builder
            // fetchOrders
            .addCase(fetchAdminOrders.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchAdminOrders.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.orders = action.payload.data;
                state.pagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchAdminOrders.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchOrderDetails
            .addCase(fetchAdminOrderDetails.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchAdminOrderDetails.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.selectedOrder = action.payload.data;
            })
            .addCase(fetchAdminOrderDetails.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // updateStatus
            .addCase(updateAdminOrderStatus.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateAdminOrderStatus.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload.data;

                state.orders = state.orders.map((o) =>
                    o._id === updated._id ? updated : o
                );
                state.selectedOrder = updated;
            })
            .addCase(updateAdminOrderStatus.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchStats
            .addCase(fetchAdminOrderStats.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchAdminOrderStats.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.stats = action.payload.data;
            })
            .addCase(fetchAdminOrderStats.rejected, (state, action) =>
            {
                handleRejected(state, action);
            });
    },
});

export const {
    clearAdminOrderError,
    clearAdminOrderActionSuccess,
    clearSelectedOrder,
    resetAdminOrderState,
} = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
