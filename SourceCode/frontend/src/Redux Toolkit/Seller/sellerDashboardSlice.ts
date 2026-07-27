import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import { RootState } from '../Store';
import {
    DashboardSummary,
    RevenueAnalytics,
    ProductAnalytics,
    OrderAnalytics,
    CustomerAnalytics,
    ReturnRefundAnalytics,
    SellerNotification,
    RecentActivity,
    UnreadCountResponse,
    SellerDashboardState,
} from '../../types/sellerDashboardTypes';

// API base URLs
const DASHBOARD_API = '/seller/dashboard';
const NOTIFICATION_API = '/seller/notifications';

// Initial state
const initialState: SellerDashboardState = {
    summary: null,
    revenue: null,
    products: null,
    orders: null,
    customers: null,
    returns: null,
    notifications: [],
    recentActivities: [],
    loading: false,
    pendingRequests: 0,
    error: null,
    loaded: false,
    refreshing: false,
};

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchSellerDashboard = createAsyncThunk<DashboardSummary, void, { rejectValue: string }>(
    'sellerDashboard/fetchSellerDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<DashboardSummary>(DASHBOARD_API);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch dashboard summary'
            );
        }
    }
);

export const fetchRevenueAnalytics = createAsyncThunk<RevenueAnalytics, string | undefined, { rejectValue: string }>(
    'sellerDashboard/fetchRevenueAnalytics',
    async (period, { rejectWithValue }) => {
        try {
            const response = await api.get<RevenueAnalytics>(`${DASHBOARD_API}/revenue`, {
                params: period ? { period } : undefined,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch revenue analytics'
            );
        }
    }
);

export const fetchProductAnalytics = createAsyncThunk<ProductAnalytics, number | undefined, { rejectValue: string }>(
    'sellerDashboard/fetchProductAnalytics',
    async (threshold, { rejectWithValue }) => {
        try {
            const response = await api.get<ProductAnalytics>(`${DASHBOARD_API}/products`, {
                params: threshold ? { threshold } : undefined,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch product analytics'
            );
        }
    }
);

export const fetchOrderAnalytics = createAsyncThunk<OrderAnalytics, void, { rejectValue: string }>(
    'sellerDashboard/fetchOrderAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<OrderAnalytics>(`${DASHBOARD_API}/orders`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch order analytics'
            );
        }
    }
);

export const fetchCustomerAnalytics = createAsyncThunk<CustomerAnalytics, void, { rejectValue: string }>(
    'sellerDashboard/fetchCustomerAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<CustomerAnalytics>(`${DASHBOARD_API}/customers`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch customer analytics'
            );
        }
    }
);

export const fetchReturnAnalytics = createAsyncThunk<ReturnRefundAnalytics, void, { rejectValue: string }>(
    'sellerDashboard/fetchReturnAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<ReturnRefundAnalytics>(`${DASHBOARD_API}/returns`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch return analytics'
            );
        }
    }
);

export const fetchSellerNotifications = createAsyncThunk<SellerNotification[], void, { rejectValue: string }>(
    'sellerDashboard/fetchSellerNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<SellerNotification[]>(NOTIFICATION_API);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch notifications'
            );
        }
    }
);

export const fetchUnreadNotificationCount = createAsyncThunk<UnreadCountResponse, void, { rejectValue: string }>(
    'sellerDashboard/fetchUnreadNotificationCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<UnreadCountResponse>(`${NOTIFICATION_API}/unread-count`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch unread count'
            );
        }
    }
);

export const fetchRecentActivities = createAsyncThunk<RecentActivity[], void, { rejectValue: string }>(
    'sellerDashboard/fetchRecentActivities',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<RecentActivity[]>(`${DASHBOARD_API}/recent-activities`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch recent activities'
            );
        }
    }
);

export const refreshSellerDashboard = createAsyncThunk<
    {
        summary: DashboardSummary;
        revenue: RevenueAnalytics;
        products: ProductAnalytics;
        orders: OrderAnalytics;
        customers: CustomerAnalytics;
        returns: ReturnRefundAnalytics;
        notifications: SellerNotification[];
        recentActivities: RecentActivity[];
    },
    void,
    { rejectValue: string }
>(
    'sellerDashboard/refreshSellerDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const [
                summaryRes,
                revenueRes,
                productsRes,
                ordersRes,
                customersRes,
                returnsRes,
                notificationsRes,
                activitiesRes,
            ] = await Promise.all([
                api.get<DashboardSummary>(DASHBOARD_API),
                api.get<RevenueAnalytics>(`${DASHBOARD_API}/revenue`),
                api.get<ProductAnalytics>(`${DASHBOARD_API}/products`),
                api.get<OrderAnalytics>(`${DASHBOARD_API}/orders`),
                api.get<CustomerAnalytics>(`${DASHBOARD_API}/customers`),
                api.get<ReturnRefundAnalytics>(`${DASHBOARD_API}/returns`),
                api.get<SellerNotification[]>(NOTIFICATION_API),
                api.get<RecentActivity[]>(`${DASHBOARD_API}/recent-activities`),
            ]);

            return {
                summary: summaryRes.data,
                revenue: revenueRes.data,
                products: productsRes.data,
                orders: ordersRes.data,
                customers: customersRes.data,
                returns: returnsRes.data,
                notifications: notificationsRes.data,
                recentActivities: activitiesRes.data,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to refresh dashboard'
            );
        }
    }
);

// ==========================================
// HELPER: Handle pending state
// ==========================================
const handlePending = (state: SellerDashboardState, isRefresh: boolean = false) => {
    if (isRefresh) {
        state.refreshing = true;
    } else {
        state.pendingRequests += 1;
        state.loading = true;
    }
    state.error = null;
};

// ==========================================
// HELPER: Handle rejected state
// ==========================================
const handleRejected = (state: SellerDashboardState, action: { payload?: string }, isRefresh: boolean = false) => {
    if (isRefresh) {
        state.refreshing = false;
    } else {
        state.pendingRequests = Math.max(0, state.pendingRequests - 1);
        state.loading = state.pendingRequests > 0;
    }
    state.error = action.payload || 'An error occurred';
};

// ==========================================
// SLICE
// ==========================================

const sellerDashboardSlice = createSlice({
    name: 'sellerDashboard',
    initialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = null;
        },
        resetSellerDashboard: () => {
            return initialState;
        },
        setRefreshing: (state, action: PayloadAction<boolean>) => {
            state.refreshing = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchSellerDashboard
            .addCase(fetchSellerDashboard.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchSellerDashboard.fulfilled, (state, action: PayloadAction<DashboardSummary>) => {
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.loading = state.pendingRequests > 0;
                state.summary = action.payload;
                state.loaded = true;
            })
            .addCase(fetchSellerDashboard.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchRevenueAnalytics
            .addCase(fetchRevenueAnalytics.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchRevenueAnalytics.fulfilled, (state, action: PayloadAction<RevenueAnalytics>) => {
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.loading = state.pendingRequests > 0;
                state.revenue = action.payload;
                state.loaded = true;
            })
            .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchProductAnalytics
            .addCase(fetchProductAnalytics.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchProductAnalytics.fulfilled, (state, action: PayloadAction<ProductAnalytics>) => {
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.loading = state.pendingRequests > 0;
                state.products = action.payload;
                state.loaded = true;
            })
            .addCase(fetchProductAnalytics.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchOrderAnalytics
            .addCase(fetchOrderAnalytics.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchOrderAnalytics.fulfilled, (state, action: PayloadAction<OrderAnalytics>) => {
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.loading = state.pendingRequests > 0;
                state.orders = action.payload;
                state.loaded = true;
            })
            .addCase(fetchOrderAnalytics.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchCustomerAnalytics
            .addCase(fetchCustomerAnalytics.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchCustomerAnalytics.fulfilled, (state, action: PayloadAction<CustomerAnalytics>) => {
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.loading = state.pendingRequests > 0;
                state.customers = action.payload;
                state.loaded = true;
            })
            .addCase(fetchCustomerAnalytics.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchReturnAnalytics
            .addCase(fetchReturnAnalytics.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchReturnAnalytics.fulfilled, (state, action: PayloadAction<ReturnRefundAnalytics>) => {
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.loading = state.pendingRequests > 0;
                state.returns = action.payload;
                state.loaded = true;
            })
            .addCase(fetchReturnAnalytics.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchSellerNotifications
            .addCase(fetchSellerNotifications.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchSellerNotifications.fulfilled, (state, action: PayloadAction<SellerNotification[]>) => {
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.loading = state.pendingRequests > 0;
                state.notifications = action.payload;
                state.loaded = true;
            })
            .addCase(fetchSellerNotifications.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchUnreadNotificationCount
            .addCase(fetchUnreadNotificationCount.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchUnreadNotificationCount.fulfilled, (state, action: PayloadAction<UnreadCountResponse>) => {
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.loading = state.pendingRequests > 0;
                if (state.summary) {
                    state.summary.notifications.unreadNotifications = action.payload.count;
                }
            })
            .addCase(fetchUnreadNotificationCount.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchRecentActivities
            .addCase(fetchRecentActivities.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchRecentActivities.fulfilled, (state, action: PayloadAction<RecentActivity[]>) => {
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.loading = state.pendingRequests > 0;
                state.recentActivities = action.payload;
                state.loaded = true;
            })
            .addCase(fetchRecentActivities.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // refreshSellerDashboard (uses refreshing flag)
            .addCase(refreshSellerDashboard.pending, (state) => {
                handlePending(state, true);
            })
            .addCase(refreshSellerDashboard.fulfilled, (state, action) => {
                state.refreshing = false;
                state.summary = action.payload.summary;
                state.revenue = action.payload.revenue;
                state.products = action.payload.products;
                state.orders = action.payload.orders;
                state.customers = action.payload.customers;
                state.returns = action.payload.returns;
                state.notifications = action.payload.notifications;
                state.recentActivities = action.payload.recentActivities;
                state.loaded = true;
            })
            .addCase(refreshSellerDashboard.rejected, (state, action) => {
                handleRejected(state, action, true);
            });
    },
});

// ==========================================
// REDUCERS
// ==========================================

export const { clearDashboardError, resetSellerDashboard, setRefreshing } = sellerDashboardSlice.actions;

export default sellerDashboardSlice.reducer;

// ==========================================
// SELECTORS
// ==========================================

export const selectDashboardSummary = (state: RootState) => state.sellerDashboard.summary;
export const selectRevenueAnalytics = (state: RootState) => state.sellerDashboard.revenue;
export const selectProductAnalytics = (state: RootState) => state.sellerDashboard.products;
export const selectOrderAnalytics = (state: RootState) => state.sellerDashboard.orders;
export const selectCustomerAnalytics = (state: RootState) => state.sellerDashboard.customers;
export const selectReturnAnalytics = (state: RootState) => state.sellerDashboard.returns;
export const selectNotifications = (state: RootState) => state.sellerDashboard.notifications;
export const selectUnreadCount = (state: RootState) =>
    state.sellerDashboard.summary?.notifications.unreadNotifications ?? 0;
export const selectRecentActivities = (state: RootState) => state.sellerDashboard.recentActivities;
export const selectDashboardLoading = (state: RootState) => state.sellerDashboard.loading;
export const selectDashboardRefreshing = (state: RootState) => state.sellerDashboard.refreshing;
export const selectDashboardError = (state: RootState) => state.sellerDashboard.error;
export const selectDashboardLoaded = (state: RootState) => state.sellerDashboard.loaded;
