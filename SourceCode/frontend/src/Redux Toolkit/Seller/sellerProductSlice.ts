import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import { Product } from '../../types/productTypes';



const API_URL = '/sellers/product';

export const fetchSellerProducts = createAsyncThunk<Product[], any>(
    'sellerProduct/fetchSellerProducts',
    async (jwt, { rejectWithValue }) => {
        try {
            const response = await api.get<Product[]>(API_URL,{
                headers: { Authorization: `Bearer ${jwt}` },
                
            });
            console.log("seller products ",response.data)
            return response.data;
        } catch (error:any) {
            console.log("error ", error.response)
            return rejectWithValue(error.response.data);
        }
    }
);

export const createProduct = createAsyncThunk<Product, { request: any; jwt: string | null }>(
    'sellerProduct/createProduct',
    async ({ request, jwt }, { rejectWithValue }) => {
        try {
            const response = await api.post<Product>(API_URL, request, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            console.log("product created ",response.data)
            return response.data;
        } catch (error:any) {
            console.log("error ",error.response)
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateProduct = createAsyncThunk<
  Product, 
  { productId: string; product: Product; jwt: string | null }
>(
  'sellerProduct/updateProduct',
  async ({ productId, product, jwt }, { rejectWithValue }) => {
    try {
      const response = await api.put<Product>(`${API_URL}/${productId}`, product, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteProduct = createAsyncThunk<void, string>(
    'sellerProduct/deleteProduct',
    async (productId, { rejectWithValue }) => {
        try {
            await api.delete(`${API_URL}/${productId}`);
        } catch (error:any) {
            return rejectWithValue(error.response.data);
        }
    }
);

// ==========================================
// VARIANT CRUD THUNKS
// ==========================================

export const addVariant = createAsyncThunk<
    Product,
    { productId: string; variantData: any; jwt: string | null }
>(
    'sellerProduct/addVariant',
    async ({ productId, variantData, jwt }, { rejectWithValue }) => {
        try {
            const response = await api.post<Product>(
                `${API_URL}/${productId}/variants`,
                variantData,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateVariant = createAsyncThunk<
    Product,
    { productId: string; variantId: string; updateData: any; jwt: string | null }
>(
    'sellerProduct/updateVariant',
    async ({ productId, variantId, updateData, jwt }, { rejectWithValue }) => {
        try {
            const response = await api.patch<Product>(
                `${API_URL}/${productId}/variants/${variantId}`,
                updateData,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const removeVariant = createAsyncThunk<
    Product,
    { productId: string; variantId: string; jwt: string | null }
>(
    'sellerProduct/removeVariant',
    async ({ productId, variantId, jwt }, { rejectWithValue }) => {
        try {
            const response = await api.delete<Product>(
                `${API_URL}/${productId}/variants/${variantId}`,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateVariantStock = createAsyncThunk<
    Product,
    { productId: string; variantId: string; quantity: number; jwt: string | null }
>(
    'sellerProduct/updateVariantStock',
    async ({ productId, variantId, quantity, jwt }, { rejectWithValue }) => {
        try {
            const response = await api.patch<Product>(
                `${API_URL}/${productId}/variants/${variantId}/stock`,
                { quantity },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

// ==========================================
// BULK VARIANT OPERATION THUNKS
// ==========================================

export const bulkUpdateVariantPricing = createAsyncThunk<
    Product,
    { productId: string; variantIds: string[]; priceData: { price?: number; mrpPrice?: number; discountPercent?: number }; jwt: string | null }
>(
    'sellerProduct/bulkUpdateVariantPricing',
    async ({ productId, variantIds, priceData, jwt }, { rejectWithValue }) => {
        try {
            const response = await api.patch<Product>(
                `${API_URL}/${productId}/variants/bulk-price`,
                { variantIds, priceData },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const bulkUpdateVariantInventory = createAsyncThunk<
    Product,
    { productId: string; variantIds: string[]; quantity: number; operation: 'set' | 'increment' | 'decrement'; jwt: string | null }
>(
    'sellerProduct/bulkUpdateVariantInventory',
    async ({ productId, variantIds, quantity, operation, jwt }, { rejectWithValue }) => {
        try {
            const response = await api.patch<Product>(
                `${API_URL}/${productId}/variants/bulk-stock`,
                { variantIds, quantity, operation },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const bulkUpdateVariantStatus = createAsyncThunk<
    Product,
    { productId: string; variantIds: string[]; isActive: boolean; jwt: string | null }
>(
    'sellerProduct/bulkUpdateVariantStatus',
    async ({ productId, variantIds, isActive, jwt }, { rejectWithValue }) => {
        try {
            const response = await api.patch<Product>(
                `${API_URL}/${productId}/variants/bulk-status`,
                { variantIds, isActive },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

interface SellerProductState {
    products: Product[];
    loading: boolean;
    error: string | null;
    productCreated: boolean;
    productUpdated: boolean;
    productsLoaded: boolean;
}

const initialState: SellerProductState = {
    products: [],
    loading: false,
    error: null,
    productCreated: false,
    productUpdated: false,
    productsLoaded: false,
};

const sellerProductSlice = createSlice({
    name: 'sellerProduct',
    initialState,
    reducers: {
        clearProductMessages: (state) => {
            state.productCreated = false;
            state.productUpdated = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSellerProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.productCreated = false;
            })
            .addCase(fetchSellerProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
                state.products = action.payload;
                state.loading = false;
                state.productsLoaded = true;
            })
            .addCase(fetchSellerProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch products';
            })
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.productCreated = false;
            })
            .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.products.push(action.payload);
                state.loading = false;
                state.productCreated = true;
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create product';
                state.productCreated = false;
            })
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.products.findIndex(product => product.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.loading = false;
                state.productUpdated = true;
                state.error = null;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.productUpdated = false;
                state.error = action.error.message || 'Failed to update product';
            })
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.productUpdated = false;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(product => product.id !== action.meta.arg);
                state.loading = false;
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete product';
            })
            // Variant CRUD — update product in state when any variant operation succeeds
            .addCase(addVariant.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.loading = false;
                state.productUpdated = true;
            })
            .addCase(addVariant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addVariant.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as any)?.message || action.error.message || 'Failed to add variant';
            })
            .addCase(updateVariant.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.loading = false;
                state.productUpdated = true;
            })
            .addCase(updateVariant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateVariant.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as any)?.message || action.error.message || 'Failed to update variant';
            })
            .addCase(removeVariant.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.loading = false;
                state.productUpdated = true;
            })
            .addCase(removeVariant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeVariant.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as any)?.message || action.error.message || 'Failed to remove variant';
            })
            .addCase(updateVariantStock.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.loading = false;
            })
            .addCase(updateVariantStock.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateVariantStock.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as any)?.message || action.error.message || 'Failed to update variant stock';
            })
            // Bulk variant operations — same pattern: replace product in state
            .addCase(bulkUpdateVariantPricing.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkUpdateVariantPricing.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.loading = false;
                state.productUpdated = true;
            })
            .addCase(bulkUpdateVariantPricing.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as any)?.message || action.error.message || 'Failed to bulk update pricing';
            })
            .addCase(bulkUpdateVariantInventory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkUpdateVariantInventory.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.loading = false;
                state.productUpdated = true;
            })
            .addCase(bulkUpdateVariantInventory.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as any)?.message || action.error.message || 'Failed to bulk update inventory';
            })
            .addCase(bulkUpdateVariantStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkUpdateVariantStatus.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.loading = false;
                state.productUpdated = true;
            })
            .addCase(bulkUpdateVariantStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as any)?.message || action.error.message || 'Failed to bulk update status';
            });
    },
});

export const { clearProductMessages } = sellerProductSlice.actions;
export default sellerProductSlice.reducer;

