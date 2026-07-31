import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
import {
    BrandRequest,
    AdminBrandRequestState,
} from "../../types/brandTypes";

const API_URL = "/admin/brand-requests";

// ==========================================
// Async Thunks
// ==========================================

export const fetchAllBrandRequests = createAsyncThunk<
    BrandRequest[],
    { status?: string; search?: string } | undefined,
    { rejectValue: string }
>("adminBrandRequest/fetchAll", async (params, { rejectWithValue }) => {
    try {
        const response = await api.get(API_URL, { params });
        const raw = response.data.data;
        return Array.isArray(raw) ? raw : raw?.data || [];
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to fetch brand requests"
        );
    }
});

export const fetchBrandRequestById = createAsyncThunk<
    BrandRequest,
    string,
    { rejectValue: string }
>("adminBrandRequest/fetchById", async (id, { rejectWithValue }) => {
    try {
        const response = await api.get(`${API_URL}/${id}`);
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to fetch brand request"
        );
    }
});

export const approveBrandRequest = createAsyncThunk<
    BrandRequest,
    string,
    { rejectValue: string }
>("adminBrandRequest/approve", async (id, { rejectWithValue }) => {
    try {
        const response = await api.patch(`${API_URL}/${id}/approve`);
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to approve brand request"
        );
    }
});

export const rejectBrandRequest = createAsyncThunk<
    BrandRequest,
    { id: string; rejectionReason?: string },
    { rejectValue: string }
>("adminBrandRequest/reject", async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`${API_URL}/${id}/reject`, {
            rejectionReason,
        });
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to reject brand request"
        );
    }
});

export const fetchPendingBrandRequestCount = createAsyncThunk<
    number,
    void,
    { rejectValue: string }
>("adminBrandRequest/fetchPendingCount", async (_, { rejectWithValue }) => {
    try {
        const response = await api.get(`${API_URL}/pending-count`);
        return response.data.data.pendingCount;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to fetch pending count"
        );
    }
});

// ==========================================
// Initial State
// ==========================================

const initialState: AdminBrandRequestState = {
    requests: [],
    pendingCount: 0,
    loading: false,
    error: null,
};

// ==========================================
// Slice
// ==========================================

const handlePending = (state: AdminBrandRequestState) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (
    state: AdminBrandRequestState,
    action: { payload?: string }
) => {
    state.loading = false;
    state.error = action.payload || "An error occurred";
};

const adminBrandRequestSlice = createSlice({
    name: "adminBrandRequest",
    initialState,
    reducers: {
        clearAdminBrandRequestError: (state) => {
            state.error = null;
        },
        resetAdminBrandRequestState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchAllBrandRequests
            .addCase(fetchAllBrandRequests.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchAllBrandRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchAllBrandRequests.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchBrandRequestById
            .addCase(fetchBrandRequestById.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchBrandRequestById.fulfilled, (state, action) => {
                state.loading = false;
                const payloadId = action.payload.id || action.payload._id;
                const existing = state.requests.find((r) => (r.id || r._id) === payloadId);
                if (existing) {
                    state.requests = state.requests.map((r) =>
                        (r.id || r._id) === payloadId ? action.payload : r
                    );
                } else {
                    state.requests.push(action.payload);
                }
            })
            .addCase(fetchBrandRequestById.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // approveBrandRequest
            .addCase(approveBrandRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveBrandRequest.fulfilled, (state, action) => {
                state.loading = false;
                const payloadId = action.payload.id || action.payload._id;
                state.requests = state.requests.map((r) =>
                    (r.id || r._id) === payloadId ? action.payload : r
                );
                state.pendingCount = Math.max(0, state.pendingCount - 1);
            })
            .addCase(approveBrandRequest.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // rejectBrandRequest
            .addCase(rejectBrandRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectBrandRequest.fulfilled, (state, action) => {
                state.loading = false;
                const payloadId = action.payload.id || action.payload._id;
                state.requests = state.requests.map((r) =>
                    (r.id || r._id) === payloadId ? action.payload : r
                );
                state.pendingCount = Math.max(0, state.pendingCount - 1);
            })
            .addCase(rejectBrandRequest.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchPendingBrandRequestCount
            .addCase(fetchPendingBrandRequestCount.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchPendingBrandRequestCount.fulfilled, (state, action) => {
                state.pendingCount = action.payload;
            })
            .addCase(fetchPendingBrandRequestCount.rejected, (state, action) => {
                handleRejected(state, action);
            });
    },
});

export const {
    clearAdminBrandRequestError,
    resetAdminBrandRequestState,
} = adminBrandRequestSlice.actions;

export default adminBrandRequestSlice.reducer;
