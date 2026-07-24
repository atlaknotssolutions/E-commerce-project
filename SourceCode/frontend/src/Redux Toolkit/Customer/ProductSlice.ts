import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Product, FilterMetadata } from "../../types/productTypes";
import { RootState } from "../Store";
import { api } from "../../Config/Api";

// Define the base URL for the API
const API_URL = "/products";

// Define the initial state type
interface ProductState {
  product: Product | null;
  products: Product[];
  paginatedProducts: any;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  searchProduct: Product[];
  filterMetadata: FilterMetadata | null;
}

// Define the initial state
const initialState: ProductState = {
  product: null,
  products: [],
  paginatedProducts: null,
  totalPages: 1,
  totalElements: 0,
  loading: false,
  error: null,
  searchProduct: [],
  filterMetadata: null,
};

// Create async thunks for API calls
export const fetchProductById = createAsyncThunk<Product, string>(
  "products/fetchProductById",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get<Product>(`${API_URL}/${productId}`);
      console.log("product details ", response.data);
      return response.data;
    } catch (error: any) {
      console.log("error ", error.response);
      return rejectWithValue(error.response.data);
    }
  }
);

export const searchProduct = createAsyncThunk<Product[], string>(
  "products/searchProduct",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get<Product[]>(`${API_URL}/search`, {
        params: { query },
      });
      console.log("search products ", response.data);
      return response.data;
    } catch (error: any) {
      console.log("error ", error.response);
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAllProducts = createAsyncThunk<
  any,
  {
    category?: string;
    brand?: string;
    color?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    minDiscount?: number;
    sort?: string;
    stock?: string;
    pageNumber?: number;
    dynamicFilters?: Record<string, string>;
  }
>("products/getAllProducts", async (params, { rejectWithValue }) => {
  try {
    // Build query params — expand dynamicFilters into attr_* keys
    const queryParams: Record<string, any> = {
      category: params.category,
      brand: params.brand,
      color: params.color,
      size: params.size,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      minDiscount: params.minDiscount,
      sort: params.sort,
      stock: params.stock,
      pageNumber: params.pageNumber || 0,
    };

    if (params.dynamicFilters) {
      for (const [key, value] of Object.entries(params.dynamicFilters)) {
        if (value) {
          queryParams[`attr_${key}`] = value;
        }
      }
    }

    // Remove undefined/null values
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
        delete queryParams[key];
      }
    });

    const response = await api.get<any>(API_URL, { params: queryParams });
    console.log("all products ", response.data);
    return response.data;
  } catch (error: any) {
    console.log("error ", error.response);
    return rejectWithValue(error.response.data);
  }
});

export const fetchFilterMetadata = createAsyncThunk<
  FilterMetadata,
  string
>("products/fetchFilterMetadata", async (categoryId, { rejectWithValue }) => {
  try {
    const response = await api.get<FilterMetadata>(`${API_URL}/filters`, {
      params: { category: categoryId },
    });
    return response.data;
  } catch (error: any) {
    console.log("error fetching filter metadata", error.response);
    return rejectWithValue(error.response.data);
  }
});

// Create the slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearFilterMetadata: (state) => {
      state.filterMetadata = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProductById.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.product = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch product";
      })
      .addCase(searchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        searchProduct.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.searchProduct = action.payload;
          state.loading = false;
        }
      )
      .addCase(searchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to search products";
      })
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllProducts.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.paginatedProducts = action.payload;
          state.products = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.totalElements = action.payload.totalElements || 0;
          state.loading = false;
        }
      )
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch products";
      })
      .addCase(fetchFilterMetadata.fulfilled, (state, action) => {
        state.filterMetadata = action.payload;
      });
  },
});

export const { clearFilterMetadata } = productSlice.actions;
export default productSlice.reducer;

// Define selector functions
export const selectProduct = (state: RootState) => state.products.product;
export const selectProducts = (state: RootState) => state.products.products;
export const selectPaginatedProducts = (state: RootState) =>
  state.products.paginatedProducts;
export const selectProductLoading = (state: RootState) =>
  state.products.loading;
export const selectProductError = (state: RootState) => state.products.error;
