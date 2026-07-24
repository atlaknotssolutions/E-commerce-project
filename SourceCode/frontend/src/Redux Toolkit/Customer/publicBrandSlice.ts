import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
import {
    Brand,
    PublicBrandState,
} from "../../types/brandTypes";

const API_URL = "/api/brands";

// ==========================================
// Async Thunks
// ==========================================

export const fetchActiveBrands = createAsyncThunk<
    Brand[],
    { page?: number; limit?: number; search?: string; categoryId?: string } | undefined,
    { rejectValue: string }
>("publicBrand/fetchActive", async (params, { rejectWithValue }) => {
    try {
        const response = await api.get(`${API_URL}/active`, { params });
        const result = response.data.data;
        return result.data || result;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to fetch active brands"
        );
    }
});

export const fetchFeaturedBrands = createAsyncThunk<
    Brand[],
    number | undefined,
    { rejectValue: string }
>("publicBrand/fetchFeatured", async (limit, { rejectWithValue }) => {
    try {
        const response = await api.get(`${API_URL}/featured`, {
            params: { limit },
        });
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to fetch featured brands"
        );
    }
});

// ==========================================
// Initial State
// ==========================================

const initialState: PublicBrandState = {
    brands: [],
    featuredBrands: [],
    loading: false,
    error: null,
};

// ==========================================
// Slice
// ==========================================

const handlePending = (state: PublicBrandState) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (
    state: PublicBrandState,
    action: { payload?: string }
) => {
    state.loading = false;
    state.error = action.payload || "An error occurred";
};

const publicBrandSlice = createSlice({
    name: "publicBrand",
    initialState,
    reducers: {
        clearPublicBrandError: (state) => {
            state.error = null;
        },
        resetPublicBrandState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchActiveBrands
            .addCase(fetchActiveBrands.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchActiveBrands.fulfilled, (state, action) => {
                state.loading = false;
                state.brands = action.payload;
            })
            .addCase(fetchActiveBrands.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchFeaturedBrands
            .addCase(fetchFeaturedBrands.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchFeaturedBrands.fulfilled, (state, action) => {
                state.loading = false;
                state.featuredBrands = action.payload;
            })
            .addCase(fetchFeaturedBrands.rejected, (state, action) => {
                handleRejected(state, action);
            });
    },
});

export const {
    clearPublicBrandError,
    resetPublicBrandState,
} = publicBrandSlice.actions;

export default publicBrandSlice.reducer;
