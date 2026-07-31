import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import {
    ProductModerationState,
    ProductModerationListResponse,
    ProductDetailResponse,
    ProductModerationStatsResponse,
    ProductActionResponse,
} from '../../types/productModerationTypes';

const API_URL = '/admin/products';

const initialState: ProductModerationState = {
    pendingProducts: [],
    approvedProducts: [],
    rejectedProducts: [],
    publishedProducts: [],
    unpublishedProducts: [],
    featuredProducts: [],
    selectedProduct: null,
    stats: null,
    pendingPagination: null,
    approvedPagination: null,
    rejectedPagination: null,
    publishedPagination: null,
    unpublishedPagination: null,
    featuredPagination: null,
    loading: false,
    error: null,
    loaded: false,
    actionSuccess: false,
};

export const fetchPendingProducts = createAsyncThunk<
    ProductModerationListResponse,
    { page?: number; limit?: number; search?: string },
    { rejectValue: string }
>(
    'adminProductModeration/fetchPendingProducts',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<ProductModerationListResponse>(
                `${API_URL}/pending`,
                { params }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch pending products'
            );
        }
    }
);

export const fetchApprovedProducts = createAsyncThunk<
    ProductModerationListResponse,
    { page?: number; limit?: number; search?: string },
    { rejectValue: string }
>(
    'adminProductModeration/fetchApprovedProducts',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<ProductModerationListResponse>(
                `${API_URL}/approved`,
                { params }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch approved products'
            );
        }
    }
);

export const fetchRejectedProducts = createAsyncThunk<
    ProductModerationListResponse,
    { page?: number; limit?: number; search?: string },
    { rejectValue: string }
>(
    'adminProductModeration/fetchRejectedProducts',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<ProductModerationListResponse>(
                `${API_URL}/rejected`,
                { params }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch rejected products'
            );
        }
    }
);

export const fetchPublishedProducts = createAsyncThunk<
    ProductModerationListResponse,
    { page?: number; limit?: number; search?: string },
    { rejectValue: string }
>(
    'adminProductModeration/fetchPublishedProducts',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<ProductModerationListResponse>(
                `${API_URL}/published`,
                { params }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch published products'
            );
        }
    }
);

export const fetchUnpublishedProducts = createAsyncThunk<
    ProductModerationListResponse,
    { page?: number; limit?: number; search?: string },
    { rejectValue: string }
>(
    'adminProductModeration/fetchUnpublishedProducts',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<ProductModerationListResponse>(
                `${API_URL}/unpublished`,
                { params }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch unpublished products'
            );
        }
    }
);

export const fetchFeaturedProducts = createAsyncThunk<
    ProductModerationListResponse,
    { page?: number; limit?: number; search?: string },
    { rejectValue: string }
>(
    'adminProductModeration/fetchFeaturedProducts',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<ProductModerationListResponse>(
                `${API_URL}/featured`,
                { params }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch featured products'
            );
        }
    }
);

export const fetchProductDetails = createAsyncThunk<
    ProductDetailResponse,
    string,
    { rejectValue: string }
>(
    'adminProductModeration/fetchProductDetails',
    async (productId, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<ProductDetailResponse>(
                `${API_URL}/${productId}`
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch product details'
            );
        }
    }
);

export const approveProductAction = createAsyncThunk<
    ProductActionResponse,
    { productId: string; note?: string },
    { rejectValue: string }
>(
    'adminProductModeration/approveProduct',
    async ({ productId, note }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<ProductActionResponse>(
                `${API_URL}/${productId}/approve`,
                { note }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to approve product'
            );
        }
    }
);

export const rejectProductAction = createAsyncThunk<
    ProductActionResponse,
    { productId: string; reason: string },
    { rejectValue: string }
>(
    'adminProductModeration/rejectProduct',
    async ({ productId, reason }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<ProductActionResponse>(
                `${API_URL}/${productId}/reject`,
                { reason }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to reject product'
            );
        }
    }
);

export const publishProductAction = createAsyncThunk<
    ProductActionResponse,
    string,
    { rejectValue: string }
>(
    'adminProductModeration/publishProduct',
    async (productId, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<ProductActionResponse>(
                `${API_URL}/${productId}/publish`
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to publish product'
            );
        }
    }
);

export const unpublishProductAction = createAsyncThunk<
    ProductActionResponse,
    { productId: string; reason?: string },
    { rejectValue: string }
>(
    'adminProductModeration/unpublishProduct',
    async ({ productId, reason }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<ProductActionResponse>(
                `${API_URL}/${productId}/unpublish`,
                { reason }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to unpublish product'
            );
        }
    }
);

export const featureProductAction = createAsyncThunk<
    ProductActionResponse,
    string,
    { rejectValue: string }
>(
    'adminProductModeration/featureProduct',
    async (productId, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<ProductActionResponse>(
                `${API_URL}/${productId}/feature`
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to feature product'
            );
        }
    }
);

export const unfeatureProductAction = createAsyncThunk<
    ProductActionResponse,
    { productId: string; reason?: string },
    { rejectValue: string }
>(
    'adminProductModeration/unfeatureProduct',
    async ({ productId, reason }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<ProductActionResponse>(
                `${API_URL}/${productId}/unfeature`,
                { reason }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to unfeature product'
            );
        }
    }
);

export const deleteProductAction = createAsyncThunk<
    ProductActionResponse,
    { productId: string; reason: string },
    { rejectValue: string }
>(
    'adminProductModeration/deleteProduct',
    async ({ productId, reason }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.delete<ProductActionResponse>(
                `${API_URL}/${productId}`,
                { data: { reason } }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete product'
            );
        }
    }
);

export const fetchProductModerationStats = createAsyncThunk<
    ProductModerationStatsResponse,
    void,
    { rejectValue: string }
>(
    'adminProductModeration/fetchStats',
    async (_, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<ProductModerationStatsResponse>(
                `${API_URL}/stats`
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch moderation stats'
            );
        }
    }
);

const handlePending = (state: ProductModerationState) =>
{
    state.loading = true;
    state.error = null;
};

const handleRejected = (state: ProductModerationState, action: { payload?: string }) =>
{
    state.loading = false;
    state.error = action.payload || 'An error occurred';
};

const adminProductModerationSlice = createSlice({
    name: 'adminProductModeration',
    initialState,
    reducers: {
        clearProductModerationError: (state) =>
        {
            state.error = null;
        },
        clearProductModerationActionSuccess: (state) =>
        {
            state.actionSuccess = false;
        },
        clearSelectedProduct: (state) =>
        {
            state.selectedProduct = null;
        },
        resetProductModerationState: () =>
        {
            return initialState;
        },
    },
    extraReducers: (builder) =>
    {
        builder
            // fetchPendingProducts
            .addCase(fetchPendingProducts.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchPendingProducts.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.pendingProducts = action.payload.data;
                state.pendingPagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchPendingProducts.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchApprovedProducts
            .addCase(fetchApprovedProducts.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchApprovedProducts.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.approvedProducts = action.payload.data;
                state.approvedPagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchApprovedProducts.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchRejectedProducts
            .addCase(fetchRejectedProducts.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchRejectedProducts.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.rejectedProducts = action.payload.data;
                state.rejectedPagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchRejectedProducts.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchPublishedProducts
            .addCase(fetchPublishedProducts.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchPublishedProducts.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.publishedProducts = action.payload.data;
                state.publishedPagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchPublishedProducts.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchUnpublishedProducts
            .addCase(fetchUnpublishedProducts.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchUnpublishedProducts.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.unpublishedProducts = action.payload.data;
                state.unpublishedPagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchUnpublishedProducts.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchFeaturedProducts
            .addCase(fetchFeaturedProducts.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.featuredProducts = action.payload.data;
                state.featuredPagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchFeaturedProducts.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchProductDetails
            .addCase(fetchProductDetails.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchProductDetails.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.selectedProduct = action.payload.data;
            })
            .addCase(fetchProductDetails.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // approveProduct
            .addCase(approveProductAction.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(approveProductAction.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload.data;

                state.pendingProducts = state.pendingProducts.filter(
                    (p) => p._id !== updated._id
                );
                state.selectedProduct = updated;
            })
            .addCase(approveProductAction.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // rejectProduct
            .addCase(rejectProductAction.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(rejectProductAction.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload.data;

                state.pendingProducts = state.pendingProducts.filter(
                    (p) => p._id !== updated._id
                );
                state.selectedProduct = updated;
            })
            .addCase(rejectProductAction.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // publishProduct
            .addCase(publishProductAction.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(publishProductAction.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                state.selectedProduct = action.payload.data;
            })
            .addCase(publishProductAction.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // unpublishProduct
            .addCase(unpublishProductAction.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(unpublishProductAction.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload.data;

                state.publishedProducts = state.publishedProducts.filter(
                    (p) => p._id !== updated._id
                );
                state.selectedProduct = updated;
            })
            .addCase(unpublishProductAction.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // featureProduct
            .addCase(featureProductAction.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(featureProductAction.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                state.selectedProduct = action.payload.data;
            })
            .addCase(featureProductAction.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // unfeatureProduct
            .addCase(unfeatureProductAction.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(unfeatureProductAction.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload.data;

                state.featuredProducts = state.featuredProducts.filter(
                    (p) => p._id !== updated._id
                );
                state.selectedProduct = updated;
            })
            .addCase(unfeatureProductAction.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // deleteProduct
            .addCase(deleteProductAction.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(deleteProductAction.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload.data;

                state.pendingProducts = state.pendingProducts.filter(
                    (p) => p._id !== updated._id
                );
                state.approvedProducts = state.approvedProducts.filter(
                    (p) => p._id !== updated._id
                );
                state.rejectedProducts = state.rejectedProducts.filter(
                    (p) => p._id !== updated._id
                );
                state.publishedProducts = state.publishedProducts.filter(
                    (p) => p._id !== updated._id
                );
                state.unpublishedProducts = state.unpublishedProducts.filter(
                    (p) => p._id !== updated._id
                );
                state.featuredProducts = state.featuredProducts.filter(
                    (p) => p._id !== updated._id
                );
                state.selectedProduct = null;
            })
            .addCase(deleteProductAction.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchProductModerationStats
            .addCase(fetchProductModerationStats.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchProductModerationStats.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.stats = action.payload.data;
            })
            .addCase(fetchProductModerationStats.rejected, (state, action) =>
            {
                handleRejected(state, action);
            });
    },
});

export const {
    clearProductModerationError,
    clearProductModerationActionSuccess,
    clearSelectedProduct,
    resetProductModerationState,
} = adminProductModerationSlice.actions;

export default adminProductModerationSlice.reducer;
