import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
import {
    Brand,
    BrandStats,
    AdminBrandState,
} from "../../types/brandTypes";

const API_URL = "/api/brands";

// ==========================================
// Async Thunks
// ==========================================

export const fetchAllBrands = createAsyncThunk<
    { success: boolean; data: Brand[] },
    {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        isFeatured?: boolean;
        isDeleted?: boolean;
        sortBy?: string;
        sortOrder?: string;
    } | undefined,
    { rejectValue: string }
>("adminBrand/fetchAllBrands", async (params, { rejectWithValue }) => {
    try {
        const response = await api.get(API_URL, { params });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to fetch brands"
        );
    }
});

export const createBrand = createAsyncThunk<
    Brand,
    FormData,
    { rejectValue: string }
>("adminBrand/createBrand", async (formData, { rejectWithValue }) => {
    try {
        const response = await api.post(API_URL, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to create brand"
        );
    }
});

export const updateBrand = createAsyncThunk<
    Brand,
    { id: string; formData: FormData },
    { rejectValue: string }
>("adminBrand/updateBrand", async ({ id, formData }, { rejectWithValue }) => {
    try {
        const response = await api.put(`${API_URL}/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to update brand"
        );
    }
});

export const deleteBrand = createAsyncThunk<
    string,
    { id: string },
    { rejectValue: string }
>("adminBrand/deleteBrand", async ({ id }, { rejectWithValue }) => {
    try {
        await api.delete(`${API_URL}/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to delete brand"
        );
    }
});

export const updateBrandStatus = createAsyncThunk<
    Brand,
    { id: string; isActive: boolean },
    { rejectValue: string }
>("adminBrand/updateBrandStatus", async ({ id, isActive }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`${API_URL}/${id}/status`, { isActive });
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to update brand status"
        );
    }
});

export const updateBrandFeatured = createAsyncThunk<
    Brand,
    { id: string; isFeatured: boolean },
    { rejectValue: string }
>("adminBrand/updateBrandFeatured", async ({ id, isFeatured }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`${API_URL}/${id}/featured`, { isFeatured });
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to update brand featured status"
        );
    }
});

export const updateBrandDisplayOrder = createAsyncThunk<
    Brand,
    { id: string; displayOrder: number },
    { rejectValue: string }
>("adminBrand/updateBrandDisplayOrder", async ({ id, displayOrder }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`${API_URL}/${id}/display-order`, { displayOrder });
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to update display order"
        );
    }
});

export const restoreBrand = createAsyncThunk<
    string,
    { id: string },
    { rejectValue: string }
>("adminBrand/restoreBrand", async ({ id }, { rejectWithValue }) => {
    try {
        await api.patch(`${API_URL}/${id}/restore`);
        return id;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to restore brand"
        );
    }
});

export const hardDeleteBrand = createAsyncThunk<
    string,
    { id: string },
    { rejectValue: string }
>("adminBrand/hardDeleteBrand", async ({ id }, { rejectWithValue }) => {
    try {
        await api.delete(`${API_URL}/${id}/hard`);
        return id;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to permanently delete brand"
        );
    }
});

export const fetchBrandStats = createAsyncThunk<
    BrandStats,
    void,
    { rejectValue: string }
>("adminBrand/fetchBrandStats", async (_, { rejectWithValue }) => {
    try {
        const response = await api.get(`${API_URL}/admin/stats`);
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to fetch brand statistics"
        );
    }
});

// ==========================================
// Initial State
// ==========================================

const initialState: AdminBrandState = {
    brands: [],
    currentBrand: null,
    stats: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },
};

// ==========================================
// Slice
// ==========================================

const handlePending = (state: AdminBrandState) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (
    state: AdminBrandState,
    action: { payload?: string }
) => {
    state.loading = false;
    state.error = action.payload || "An error occurred";
};

const adminBrandSlice = createSlice({
    name: "adminBrand",
    initialState,
    reducers: {
        clearAdminBrandError: (state) => {
            state.error = null;
        },
        clearCurrentBrand: (state) => {
            state.currentBrand = null;
        },
        resetAdminBrandState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchAllBrands
            .addCase(fetchAllBrands.pending, (state) => {
                handlePending(state);
            })
            .addCase(
                fetchAllBrands.fulfilled,
                (state, action) => {
                    state.loading = false;
                    const result: any = action.payload.data;
                    if (Array.isArray(result)) {
                        state.brands = result;
                    } else {
                        state.brands = result.data || [];
                        state.pagination = {
                            page: result.page || 1,
                            limit: result.limit || 20,
                            total: result.total || 0,
                            totalPages: result.totalPages || 1,
                        };
                    }
                }
            )
            .addCase(fetchAllBrands.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // createBrand
            .addCase(createBrand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBrand.fulfilled, (state, action) => {
                state.loading = false;
                state.brands.unshift(action.payload);
            })
            .addCase(createBrand.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // updateBrand
            .addCase(updateBrand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBrand.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                state.brands = state.brands.map((b) =>
                    b._id === updated._id ? updated : b
                );
                state.currentBrand = updated;
            })
            .addCase(updateBrand.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // deleteBrand
            .addCase(deleteBrand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBrand.fulfilled, (state, action) => {
                state.loading = false;
                state.brands = state.brands.filter(
                    (b) => b._id !== action.payload
                );
            })
            .addCase(deleteBrand.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // updateBrandStatus
            .addCase(updateBrandStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBrandStatus.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                state.brands = state.brands.map((b) =>
                    b._id === updated._id ? updated : b
                );
            })
            .addCase(updateBrandStatus.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // updateBrandFeatured
            .addCase(updateBrandFeatured.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBrandFeatured.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                state.brands = state.brands.map((b) =>
                    b._id === updated._id ? updated : b
                );
            })
            .addCase(updateBrandFeatured.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // updateBrandDisplayOrder
            .addCase(updateBrandDisplayOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBrandDisplayOrder.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                state.brands = state.brands.map((b) =>
                    b._id === updated._id ? updated : b
                );
            })
            .addCase(updateBrandDisplayOrder.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // restoreBrand
            .addCase(restoreBrand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(restoreBrand.fulfilled, (state, action) => {
                state.loading = false;
                state.brands = state.brands.filter(
                    (b) => b._id !== action.payload
                );
            })
            .addCase(restoreBrand.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // hardDeleteBrand
            .addCase(hardDeleteBrand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(hardDeleteBrand.fulfilled, (state, action) => {
                state.loading = false;
                state.brands = state.brands.filter(
                    (b) => b._id !== action.payload
                );
            })
            .addCase(hardDeleteBrand.rejected, (state, action) => {
                handleRejected(state, action);
            })

            // fetchBrandStats
            .addCase(fetchBrandStats.pending, (state) => {
                handlePending(state);
            })
            .addCase(fetchBrandStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchBrandStats.rejected, (state, action) => {
                handleRejected(state, action);
            });
    },
});

export const {
    clearAdminBrandError,
    clearCurrentBrand,
    resetAdminBrandState,
} = adminBrandSlice.actions;

export default adminBrandSlice.reducer;
