import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import {
    AdminReportsState,
    DashboardSummary,
    SalesDataPoint,
    RevenueReport,
    ProductReport,
    SellerReport,
    CustomerReport,
    OrderReport,
    ReturnReport,
    CouponReport,
    ReportFilters,
} from '../../types/adminReportsTypes';

const API_URL = '/admin/reports';

const initialState: AdminReportsState = {
    dashboard: null,
    sales: [],
    salesGroupBy: 'daily',
    revenue: null,
    revenueGroupBy: 'daily',
    products: null,
    sellers: null,
    customers: null,
    orders: null,
    returns: null,
    coupons: null,
    loading: false,
    error: null,
    loaded: false,
};

export const fetchDashboardSummary = createAsyncThunk<
    DashboardSummary,
    void,
    { rejectValue: string }
>(
    'adminReports/fetchDashboardSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<{ success: boolean; data: DashboardSummary }>(
                `${API_URL}/dashboard`
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch dashboard summary'
            );
        }
    }
);

export const fetchSalesReport = createAsyncThunk<
    { data: SalesDataPoint[]; groupBy: string },
    ReportFilters,
    { rejectValue: string }
>(
    'adminReports/fetchSalesReport',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, string> = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            params.groupBy = filters.groupBy;

            const response = await api.get<{
                success: boolean;
                data: SalesDataPoint[];
                groupBy: string;
            }>(`${API_URL}/sales`, { params });
            return { data: response.data.data, groupBy: response.data.groupBy };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch sales report'
            );
        }
    }
);

export const fetchRevenueReport = createAsyncThunk<
    RevenueReport,
    ReportFilters,
    { rejectValue: string }
>(
    'adminReports/fetchRevenueReport',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, string> = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            params.groupBy = filters.groupBy;

            const response = await api.get<{ success: boolean } & RevenueReport>(
                `${API_URL}/revenue`, { params }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch revenue report'
            );
        }
    }
);

export const fetchProductReport = createAsyncThunk<
    ProductReport,
    { startDate?: string; endDate?: string },
    { rejectValue: string }
>(
    'adminReports/fetchProductReport',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, string> = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await api.get<{ success: boolean; data: ProductReport }>(
                `${API_URL}/products`, { params }
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch product report'
            );
        }
    }
);

export const fetchSellerReport = createAsyncThunk<
    SellerReport,
    { startDate?: string; endDate?: string },
    { rejectValue: string }
>(
    'adminReports/fetchSellerReport',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, string> = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await api.get<{ success: boolean; data: SellerReport }>(
                `${API_URL}/sellers`, { params }
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch seller report'
            );
        }
    }
);

export const fetchCustomerReport = createAsyncThunk<
    CustomerReport,
    { startDate?: string; endDate?: string },
    { rejectValue: string }
>(
    'adminReports/fetchCustomerReport',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, string> = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await api.get<{ success: boolean; data: CustomerReport }>(
                `${API_URL}/customers`, { params }
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch customer report'
            );
        }
    }
);

export const fetchOrderReport = createAsyncThunk<
    OrderReport,
    { startDate?: string; endDate?: string },
    { rejectValue: string }
>(
    'adminReports/fetchOrderReport',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, string> = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await api.get<{ success: boolean; data: OrderReport }>(
                `${API_URL}/orders`, { params }
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch order report'
            );
        }
    }
);

export const fetchReturnReport = createAsyncThunk<
    ReturnReport,
    { startDate?: string; endDate?: string },
    { rejectValue: string }
>(
    'adminReports/fetchReturnReport',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, string> = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await api.get<{ success: boolean; data: ReturnReport }>(
                `${API_URL}/returns`, { params }
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch return report'
            );
        }
    }
);

export const fetchCouponReport = createAsyncThunk<
    CouponReport,
    { startDate?: string; endDate?: string },
    { rejectValue: string }
>(
    'adminReports/fetchCouponReport',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, string> = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await api.get<{ success: boolean; data: CouponReport }>(
                `${API_URL}/coupons`, { params }
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch coupon report'
            );
        }
    }
);

export const exportReportCsv = createAsyncThunk<
    void,
    { type: string; filters: ReportFilters },
    { rejectValue: string }
>(
    'adminReports/exportCsv',
    async ({ type, filters }, { rejectWithValue }) => {
        try {
            const params: Record<string, string> = { type };
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            if (filters.groupBy) params.groupBy = filters.groupBy;
            if (filters.status) params.status = filters.status;
            if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;

            const response = await api.get(`${API_URL}/export/csv`, {
                params,
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to export report'
            );
        }
    }
);

const handlePending = (state: AdminReportsState) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (state: AdminReportsState, action: { payload?: string }) => {
    state.loading = false;
    state.error = action.payload || 'An error occurred';
};

const adminReportsSlice = createSlice({
    name: 'adminReports',
    initialState,
    reducers: {
        clearAdminReportsError: (state) => {
            state.error = null;
        },
        resetAdminReportsState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardSummary.pending, handlePending)
            .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboard = action.payload;
                state.loaded = true;
            })
            .addCase(fetchDashboardSummary.rejected, handleRejected)

            .addCase(fetchSalesReport.pending, handlePending)
            .addCase(fetchSalesReport.fulfilled, (state, action) => {
                state.loading = false;
                state.sales = action.payload.data;
                state.salesGroupBy = action.payload.groupBy;
                state.loaded = true;
            })
            .addCase(fetchSalesReport.rejected, handleRejected)

            .addCase(fetchRevenueReport.pending, handlePending)
            .addCase(fetchRevenueReport.fulfilled, (state, action) => {
                state.loading = false;
                state.revenue = action.payload;
                state.loaded = true;
            })
            .addCase(fetchRevenueReport.rejected, handleRejected)

            .addCase(fetchProductReport.pending, handlePending)
            .addCase(fetchProductReport.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
                state.loaded = true;
            })
            .addCase(fetchProductReport.rejected, handleRejected)

            .addCase(fetchSellerReport.pending, handlePending)
            .addCase(fetchSellerReport.fulfilled, (state, action) => {
                state.loading = false;
                state.sellers = action.payload;
                state.loaded = true;
            })
            .addCase(fetchSellerReport.rejected, handleRejected)

            .addCase(fetchCustomerReport.pending, handlePending)
            .addCase(fetchCustomerReport.fulfilled, (state, action) => {
                state.loading = false;
                state.customers = action.payload;
                state.loaded = true;
            })
            .addCase(fetchCustomerReport.rejected, handleRejected)

            .addCase(fetchOrderReport.pending, handlePending)
            .addCase(fetchOrderReport.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
                state.loaded = true;
            })
            .addCase(fetchOrderReport.rejected, handleRejected)

            .addCase(fetchReturnReport.pending, handlePending)
            .addCase(fetchReturnReport.fulfilled, (state, action) => {
                state.loading = false;
                state.returns = action.payload;
                state.loaded = true;
            })
            .addCase(fetchReturnReport.rejected, handleRejected)

            .addCase(fetchCouponReport.pending, handlePending)
            .addCase(fetchCouponReport.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload;
                state.loaded = true;
            })
            .addCase(fetchCouponReport.rejected, handleRejected)

            .addCase(exportReportCsv.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(exportReportCsv.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(exportReportCsv.rejected, handleRejected);
    },
});

export const {
    clearAdminReportsError,
    resetAdminReportsState,
} = adminReportsSlice.actions;

export default adminReportsSlice.reducer;
