import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
import { Coupon, CouponPagination } from "../../types/couponTypes";

const SELLER_API_URL = "/seller/coupons";

interface SellerCouponState {
  coupons: Coupon[];
  pagination: CouponPagination | null;
  loading: boolean;
  error: string | null;
  actionSuccess: boolean;
  loaded: boolean;
}

const initialState: SellerCouponState = {
  coupons: [],
  pagination: null,
  loading: false,
  error: null,
  actionSuccess: false,
  loaded: false,
};

export const fetchSellerCoupons = createAsyncThunk<
  { data: Coupon[]; pagination: any },
  { page?: number; limit?: number; search?: string; isActive?: string; scope?: string; targetType?: string },
  { rejectValue: string }
>("sellerCoupon/fetchSellerCoupons", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get(SELLER_API_URL, { params });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch seller coupons");
  }
});

export const createSellerCoupon = createAsyncThunk<
  Coupon,
  { coupon: any },
  { rejectValue: string }
>("sellerCoupon/createSellerCoupon", async ({ coupon }, { rejectWithValue }) => {
  try {
    const response = await api.post(SELLER_API_URL, coupon);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to create coupon");
  }
});

export const updateSellerCoupon = createAsyncThunk<
  Coupon,
  { id: string; coupon: any },
  { rejectValue: string }
>("sellerCoupon/updateSellerCoupon", async ({ id, coupon }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`${SELLER_API_URL}/${id}`, coupon);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update coupon");
  }
});

export const deleteSellerCoupon = createAsyncThunk<
  string,
  { id: string },
  { rejectValue: string }
>("sellerCoupon/deleteSellerCoupon", async ({ id }, { rejectWithValue }) => {
  try {
    await api.delete(`${SELLER_API_URL}/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete coupon");
  }
});

export const enableSellerCoupon = createAsyncThunk<
  Coupon,
  { id: string },
  { rejectValue: string }
>("sellerCoupon/enableSellerCoupon", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`${SELLER_API_URL}/${id}/enable`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to enable coupon");
  }
});

export const disableSellerCoupon = createAsyncThunk<
  Coupon,
  { id: string },
  { rejectValue: string }
>("sellerCoupon/disableSellerCoupon", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`${SELLER_API_URL}/${id}/disable`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to disable coupon");
  }
});

const sellerCouponSlice = createSlice({
  name: "sellerCoupon",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearActionSuccess: (state) => { state.actionSuccess = false; },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    const setPending = (state: SellerCouponState) => { state.loading = true; state.error = null; };
    const setRejected = (state: SellerCouponState, action: { payload?: string }) => {
      state.loading = false;
      state.error = action.payload || "An error occurred";
    };

    builder
      .addCase(fetchSellerCoupons.pending, setPending)
      .addCase(fetchSellerCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.data;
        state.pagination = action.payload.pagination;
        state.loaded = true;
      })
      .addCase(fetchSellerCoupons.rejected, setRejected)

      .addCase(createSellerCoupon.pending, (state) => { state.loading = true; state.error = null; state.actionSuccess = false; })
      .addCase(createSellerCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons.unshift(action.payload);
      })
      .addCase(createSellerCoupon.rejected, setRejected)

      .addCase(updateSellerCoupon.pending, (state) => { state.loading = true; state.error = null; state.actionSuccess = false; })
      .addCase(updateSellerCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons = state.coupons.map((c) => c._id === action.payload._id ? action.payload : c);
      })
      .addCase(updateSellerCoupon.rejected, setRejected)

      .addCase(deleteSellerCoupon.pending, (state) => { state.loading = true; state.error = null; state.actionSuccess = false; })
      .addCase(deleteSellerCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteSellerCoupon.rejected, setRejected)

      .addCase(enableSellerCoupon.pending, (state) => { state.loading = true; state.error = null; state.actionSuccess = false; })
      .addCase(enableSellerCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons = state.coupons.map((c) => c._id === action.payload._id ? action.payload : c);
      })
      .addCase(enableSellerCoupon.rejected, setRejected)

      .addCase(disableSellerCoupon.pending, (state) => { state.loading = true; state.error = null; state.actionSuccess = false; })
      .addCase(disableSellerCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.coupons = state.coupons.map((c) => c._id === action.payload._id ? action.payload : c);
      })
      .addCase(disableSellerCoupon.rejected, setRejected);
  },
});

export const { clearError, clearActionSuccess, resetState } = sellerCouponSlice.actions;
export default sellerCouponSlice.reducer;
