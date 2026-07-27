import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Cart } from "../../types/cartTypes";
import { Coupon, CouponState } from "../../types/couponTypes";
import { api } from "../../Config/Api";

const API_URL = "/api/coupons";

export const applyCoupon = createAsyncThunk<
  Cart,
  {
    apply: string;
    code: string;
    orderValue: number;
    jwt: string;
  },
  { rejectValue: string }
>(
  "coupon/applyCoupon",
  async ({ apply, code, orderValue, jwt }, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_URL}/apply`, null, {
        params: { apply, code, orderValue },
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error || "Failed to apply coupon");
    }
  }
);

export const fetchCustomerCoupons = createAsyncThunk<
  { available: Coupon[]; used: Coupon[]; expired: Coupon[] },
  void,
  { rejectValue: string }
>(
  "coupon/fetchCustomerCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/customer`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch coupons");
    }
  }
);

const initialState: CouponState = {
  coupons: [],
  cart: null,
  loading: false,
  error: null,
  couponCreated: false,
  couponApplied: false,
  availableCoupons: [],
  usedCoupons: [],
  expiredCoupons: [],
  customerCouponsLoaded: false,
};

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    resetCouponApplied: (state) => {
      state.couponApplied = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.couponApplied = false;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        if (action.meta.arg.apply === "true") {
          state.couponApplied = true;
        }
      })
      .addCase(
        applyCoupon.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Failed to apply coupon";
          state.couponApplied = false;
        }
      )
      .addCase(fetchCustomerCoupons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.availableCoupons = action.payload.available;
        state.usedCoupons = action.payload.used;
        state.expiredCoupons = action.payload.expired;
        state.customerCouponsLoaded = true;
      })
      .addCase(fetchCustomerCoupons.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { resetCouponApplied } = couponSlice.actions;
export default couponSlice.reducer;
