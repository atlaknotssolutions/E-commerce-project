import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
import {
  AdminCouponState,
  Coupon,
  CouponStatistics,
  CouponUsage,
} from "../../types/couponTypes";

const API_URL = "/admin/coupons";
const SELLER_API_URL = "/seller/coupons";

// ==========================================
// Async Thunks
// ==========================================

export const fetchCoupons = createAsyncThunk<
  { data: Coupon[]; pagination: any },
  {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
    discountType?: string;
    ownerType?: string;
    scope?: string;
    targetType?: string;
    sortBy?: string;
    sortOrder?: string;
  },
  { rejectValue: string }
>("adminCoupon/fetchCoupons", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get(API_URL, { params });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch coupons"
    );
  }
});

export const createCoupon = createAsyncThunk<
  Coupon,
  { coupon: any },
  { rejectValue: string }
>("adminCoupon/createCoupon", async ({ coupon }, { rejectWithValue }) => {
  try {
    const response = await api.post(API_URL, coupon);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create coupon"
    );
  }
});

export const updateCoupon = createAsyncThunk<
  Coupon,
  { id: string; coupon: any },
  { rejectValue: string }
>("adminCoupon/updateCoupon", async ({ id, coupon }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`${API_URL}/${id}`, coupon);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update coupon"
    );
  }
});

export const deleteCoupon = createAsyncThunk<
  string,
  { id: string },
  { rejectValue: string }
>("adminCoupon/deleteCoupon", async ({ id }, { rejectWithValue }) => {
  try {
    await api.delete(`${API_URL}/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete coupon"
    );
  }
});

export const enableCoupon = createAsyncThunk<
  Coupon,
  { id: string },
  { rejectValue: string }
>("adminCoupon/enableCoupon", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`${API_URL}/${id}/enable`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to enable coupon"
    );
  }
});

export const disableCoupon = createAsyncThunk<
  Coupon,
  { id: string },
  { rejectValue: string }
>("adminCoupon/disableCoupon", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`${API_URL}/${id}/disable`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to disable coupon"
    );
  }
});

export const fetchCouponStatistics = createAsyncThunk<
  CouponStatistics,
  void,
  { rejectValue: string }
>("adminCoupon/fetchStatistics", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(`${API_URL}/statistics`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch statistics"
    );
  }
});

export const fetchCouponUsage = createAsyncThunk<
  CouponUsage,
  string,
  { rejectValue: string }
>("adminCoupon/fetchUsage", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`${API_URL}/${id}/usage`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch usage"
    );
  }
});

// ==========================================
// Seller Coupon Async Thunks
// ==========================================

export const fetchSellerCoupons = createAsyncThunk<
  { data: Coupon[]; pagination: any },
  {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
    scope?: string;
    targetType?: string;
  },
  { rejectValue: string }
>("adminCoupon/fetchSellerCoupons", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get(SELLER_API_URL, { params });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch seller coupons"
    );
  }
});

export const createSellerCoupon = createAsyncThunk<
  Coupon,
  { coupon: any },
  { rejectValue: string }
>("adminCoupon/createSellerCoupon", async ({ coupon }, { rejectWithValue }) => {
  try {
    const response = await api.post(SELLER_API_URL, coupon);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create seller coupon"
    );
  }
});

export const updateSellerCoupon = createAsyncThunk<
  Coupon,
  { id: string; coupon: any },
  { rejectValue: string }
>("adminCoupon/updateSellerCoupon", async ({ id, coupon }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`${SELLER_API_URL}/${id}`, coupon);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update seller coupon"
    );
  }
});

export const deleteSellerCoupon = createAsyncThunk<
  string,
  { id: string },
  { rejectValue: string }
>("adminCoupon/deleteSellerCoupon", async ({ id }, { rejectWithValue }) => {
  try {
    await api.delete(`${SELLER_API_URL}/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete seller coupon"
    );
  }
});

export const enableSellerCoupon = createAsyncThunk<
  Coupon,
  { id: string },
  { rejectValue: string }
>("adminCoupon/enableSellerCoupon", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`${SELLER_API_URL}/${id}/enable`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to enable seller coupon"
    );
  }
});

export const disableSellerCoupon = createAsyncThunk<
  Coupon,
  { id: string },
  { rejectValue: string }
>("adminCoupon/disableSellerCoupon", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`${SELLER_API_URL}/${id}/disable`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to disable seller coupon"
    );
  }
});

// ==========================================
// Initial State
// ==========================================

const initialState: AdminCouponState = {
  coupons: [],
  selectedCoupon: null,
  statistics: null,
  usage: null,
  pagination: null,
  loading: false,
  error: null,
  actionSuccess: false,
  loaded: false,
};

// ==========================================
// Slice
// ==========================================

const handlePending = (state: AdminCouponState) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (
  state: AdminCouponState,
  action: { payload?: string }
) => {
  state.loading = false;
  state.error = action.payload || "An error occurred";
};

const adminCouponSlice = createSlice({
  name: "adminCoupon",
  initialState,
  reducers: {
    clearAdminCouponError: (state) => {
      state.error = null;
    },
    clearAdminCouponActionSuccess: (state) => {
      state.actionSuccess = false;
    },
    clearSelectedCoupon: (state) => {
      state.selectedCoupon = null;
    },
    clearCouponUsage: (state) => {
      state.usage = null;
    },
    resetAdminCouponState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCoupons
      .addCase(fetchCoupons.pending, (state) => {
        handlePending(state);
      })
      .addCase(
        fetchCoupons.fulfilled,
        (
          state,
          action: PayloadAction<{ data: Coupon[]; pagination: any }>
        ) => {
          state.loading = false;
          state.coupons = action.payload.data;
          state.pagination = action.payload.pagination;
          state.loaded = true;
        }
      )
      .addCase(fetchCoupons.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // createCoupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons.unshift(action.payload);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // updateCoupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        const updated = action.payload;
        state.coupons = state.coupons.map((c) =>
          c._id === updated._id ? updated : c
        );
        state.selectedCoupon = updated;
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // deleteCoupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons = state.coupons.filter(
          (c) => c._id !== action.payload
        );
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // enableCoupon
      .addCase(enableCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(enableCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        const updated = action.payload;
        state.coupons = state.coupons.map((c) =>
          c._id === updated._id ? updated : c
        );
      })
      .addCase(enableCoupon.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // disableCoupon
      .addCase(disableCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(disableCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        const updated = action.payload;
        state.coupons = state.coupons.map((c) =>
          c._id === updated._id ? updated : c
        );
      })
      .addCase(disableCoupon.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // fetchCouponStatistics
      .addCase(fetchCouponStatistics.pending, (state) => {
        handlePending(state);
      })
      .addCase(fetchCouponStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchCouponStatistics.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // fetchCouponUsage
      .addCase(fetchCouponUsage.pending, (state) => {
        handlePending(state);
      })
      .addCase(fetchCouponUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.usage = action.payload;
      })
      .addCase(fetchCouponUsage.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // fetchSellerCoupons
      .addCase(fetchSellerCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.data;
        state.pagination = action.payload.pagination;
        state.loaded = true;
      })
      .addCase(fetchSellerCoupons.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // createSellerCoupon
      .addCase(createSellerCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(createSellerCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons.unshift(action.payload);
      })
      .addCase(createSellerCoupon.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // updateSellerCoupon
      .addCase(updateSellerCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(updateSellerCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons = state.coupons.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })
      .addCase(updateSellerCoupon.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // deleteSellerCoupon
      .addCase(deleteSellerCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(deleteSellerCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteSellerCoupon.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // enableSellerCoupon
      .addCase(enableSellerCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(enableSellerCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons = state.coupons.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })
      .addCase(enableSellerCoupon.rejected, (state, action) => {
        handleRejected(state, action);
      })

      // disableSellerCoupon
      .addCase(disableSellerCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(disableSellerCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons = state.coupons.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })
      .addCase(disableSellerCoupon.rejected, (state, action) => {
        handleRejected(state, action);
      });
  },
});

export const {
  clearAdminCouponError,
  clearAdminCouponActionSuccess,
  clearSelectedCoupon,
  clearCouponUsage,
  resetAdminCouponState,
} = adminCouponSlice.actions;

export default adminCouponSlice.reducer;
