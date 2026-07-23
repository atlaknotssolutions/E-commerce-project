import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
import {
    AdminCategoryState,
    CategoryListResponse,
    CategoryTreeResponse,
    CreateCategoryPayload,
    UpdateCategoryPayload,
} from "../../types/categoryTypes";

export const fetchAllCategories = createAsyncThunk<
    CategoryListResponse,
    void,
    { rejectValue: string }
>(
    "adminCategory/fetchAllCategories",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get<CategoryListResponse>(
                "/admin/categories"
            );
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch categories."
            );
        }
    }
);

export const fetchCategoryTree = createAsyncThunk<
    CategoryTreeResponse,
    void,
    { rejectValue: string }
>(
    "adminCategory/fetchCategoryTree",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get<CategoryTreeResponse>(
                "/categories/tree"
            );
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch category tree."
            );
        }
    }
);

export const createCategory = createAsyncThunk<
    CategoryListResponse,
    CreateCategoryPayload,
    { rejectValue: string }
>(
    "adminCategory/createCategory",
    async (payload, { dispatch, rejectWithValue }) => {
        try {
            const { data } = await api.post<CategoryListResponse>(
                "/admin/categories",
                payload
            );
            dispatch(fetchAllCategories());
            dispatch(fetchCategoryTree());
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to create category."
            );
        }
    }
);

export const updateCategory = createAsyncThunk<
    CategoryListResponse,
    { id: string; payload: UpdateCategoryPayload },
    { rejectValue: string }
>(
    "adminCategory/updateCategory",
    async ({ id, payload }, { dispatch, rejectWithValue }) => {
        try {
            const { data } = await api.patch<CategoryListResponse>(
                `/admin/categories/${id}`,
                payload
            );
            dispatch(fetchAllCategories());
            dispatch(fetchCategoryTree());
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to update category."
            );
        }
    }
);

export const deleteCategory = createAsyncThunk<
    void,
    string,
    { rejectValue: string }
>(
    "adminCategory/deleteCategory",
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await api.delete(`/admin/categories/${id}`);
            dispatch(fetchAllCategories());
            dispatch(fetchCategoryTree());
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to delete category."
            );
        }
    }
);

const initialState: AdminCategoryState = {
    categories: [],
    categoryTree: [],
    loading: false,
    error: null,
    success: false,
    treeLoaded: false,
};

const adminCategorySlice = createSlice({
    name: "adminCategory",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.data;
                state.success = true;
            })
            .addCase(fetchAllCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Something went wrong.";
            })
            .addCase(fetchCategoryTree.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoryTree.fulfilled, (state, action) => {
                state.loading = false;
                state.categoryTree = action.payload.data;
                state.success = true;
                state.treeLoaded = true;
            })
            .addCase(fetchCategoryTree.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Something went wrong.";
            })
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create category.";
            })
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update category.";
            })
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete category.";
            });
    },
});

export const { clearError } = adminCategorySlice.actions;
export default adminCategorySlice.reducer;
