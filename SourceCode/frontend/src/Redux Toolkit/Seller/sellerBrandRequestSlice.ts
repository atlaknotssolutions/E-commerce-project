import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
import {
    BrandRequest,
    CreateBrandRequestPayload,
    SellerBrandRequestState,
} from "../../types/brandTypes";

const API_URL = "/seller/brand-requests";

// ==========================================
// Async Thunks
// ==========================================

export const createBrandRequest = createAsyncThunk<
    BrandRequest,
    CreateBrandRequestPayload,
    { rejectValue: string }
>("sellerBrandRequest/create", async (payload, { rejectWithValue }) => {
    try {
        const response = await api.post(API_URL, payload);
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to create brand request"
        );
    }
});

export const fetchSellerBrandRequests = createAsyncThunk<
    BrandRequest[],
    void,
    { rejectValue: string }
>("sellerBrandRequest/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const response = await api.get(API_URL);
        const raw = response.data.data;
        return Array.isArray(raw) ? raw : [];
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to fetch brand requests"
        );
    }
});

// ==========================================
// Initial State
// ==========================================

const initialState: SellerBrandRequestState = {
    requests: [],
    loading: false,
    error: null,
    requestsLoaded: false,
};

// ==========================================
// Slice
// ==========================================

const handlePending = (state: SellerBrandRequestState) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (
    state: SellerBrandRequestState,
    action: { payload?: string }
) => {
    state.loading = false;
    state.error = action.payload || "An error occurred";
};

const sellerBrandRequestSlice = createSlice({
    name: "sellerBrandRequest",
    initialState,
    reducers: {
        clearSellerBrandRequestError: (state) => {
            state.error = null;
        },
        resetSellerBrandRequestState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // createBrandRequest
            .addCase(createBrandRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBrandRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.requests.unshift(action.payload);
            })
            .addCase(createBrandRequest.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchSellerBrandRequests
            .addCase(fetchSellerBrandRequests.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchSellerBrandRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = Array.isArray(action.payload) ? action.payload : [];
                state.requestsLoaded = true;
            })
            .addCase(fetchSellerBrandRequests.rejected, (state, action) => {
                handleRejected(state, action);
            });
    },
});

export const {
    clearSellerBrandRequestError,
    resetSellerBrandRequestState,
} = sellerBrandRequestSlice.actions;

export default sellerBrandRequestSlice.reducer;
