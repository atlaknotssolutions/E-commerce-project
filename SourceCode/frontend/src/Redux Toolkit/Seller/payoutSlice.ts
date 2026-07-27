import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Payout, SellerBalance, PayoutRequest, PayoutStats } from "../../types/payoutsType";
import { api } from "../../Config/Api";

interface PayoutsState {
  payouts: Payout[];
  payout: Payout | null;
  balance: SellerBalance | null;
  stats: PayoutStats | null;
  loading: boolean;
  error: string | null;
  payoutsLoaded: boolean;
}

const initialState: PayoutsState = {
  payouts: [],
  payout: null,
  balance: null,
  stats: null,
  loading: false,
  error: null,
  payoutsLoaded: false,
};

export const fetchPayoutsBySeller = createAsyncThunk<
  Payout[],
  string,
  { rejectValue: string }
>("payouts/fetchPayoutsBySeller", async (jwt, { rejectWithValue }) => {
  try {
    const response = await api.get("/seller/payouts", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue("Failed to fetch payouts");
  }
});

export const fetchPayoutBalance = createAsyncThunk<
  SellerBalance,
  string,
  { rejectValue: string }
>("payouts/fetchPayoutBalance", async (jwt, { rejectWithValue }) => {
  try {
    const response = await api.get("/seller/payouts/balance", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue("Failed to fetch balance");
  }
});

export const fetchPayoutById = createAsyncThunk<
  Payout,
  { id: string; jwt: string },
  { rejectValue: string }
>("payouts/fetchPayoutById", async ({ id, jwt }, { rejectWithValue }) => {
  try {
    const response = await api.get(`/seller/payouts/${id}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue("Failed to fetch payout");
  }
});

export const requestPayout = createAsyncThunk<
  Payout,
  { jwt: string; data: PayoutRequest },
  { rejectValue: string }
>("payouts/requestPayout", async ({ jwt, data }, { rejectWithValue }) => {
  try {
    const response = await api.post("/seller/payouts/request", data, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue("Failed to request payout");
  }
});

export const approvePayout = createAsyncThunk<
  Payout,
  { id: string; jwt: string },
  { rejectValue: string }
>("payouts/approvePayout", async ({ id, jwt }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/admin/payouts/${id}/approve`, null, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue("Failed to approve payout");
  }
});

export const rejectPayout = createAsyncThunk<
  Payout,
  { id: string; jwt: string; reason?: string },
  { rejectValue: string }
>("payouts/rejectPayout", async ({ id, jwt, reason }, { rejectWithValue }) => {
  try {
    const response = await api.patch(
      `/admin/payouts/${id}/reject`,
      { reason },
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue("Failed to reject payout");
  }
});

export const markPayoutPaid = createAsyncThunk<
  Payout,
  { id: string; jwt: string },
  { rejectValue: string }
>("payouts/markPayoutPaid", async ({ id, jwt }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/admin/payouts/${id}/disburse`, null, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue("Failed to mark payout as paid");
  }
});

const payoutsSlice = createSlice({
  name: "payouts",
  initialState,
  reducers: {
    clearPayoutError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayoutsBySeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayoutsBySeller.fulfilled, (state, action) => {
        state.loading = false;
        state.payouts = action.payload;
        state.payoutsLoaded = true;
      })
      .addCase(fetchPayoutsBySeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPayoutBalance.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPayoutBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
      })
      .addCase(fetchPayoutBalance.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchPayoutById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayoutById.fulfilled, (state, action) => {
        state.loading = false;
        state.payout = action.payload;
      })
      .addCase(fetchPayoutById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(requestPayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPayout.fulfilled, (state, action) => {
        state.loading = false;
        state.payouts.unshift(action.payload);
      })
      .addCase(requestPayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(approvePayout.pending, (state) => {
        state.error = null;
      })
      .addCase(approvePayout.fulfilled, (state, action) => {
        const index = state.payouts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payouts[index] = action.payload;
        }
      })
      .addCase(approvePayout.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(rejectPayout.pending, (state) => {
        state.error = null;
      })
      .addCase(rejectPayout.fulfilled, (state, action) => {
        const index = state.payouts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payouts[index] = action.payload;
        }
      })
      .addCase(rejectPayout.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(markPayoutPaid.pending, (state) => {
        state.error = null;
      })
      .addCase(markPayoutPaid.fulfilled, (state, action) => {
        const index = state.payouts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payouts[index] = action.payload;
        }
      })
      .addCase(markPayoutPaid.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearPayoutError } = payoutsSlice.actions;
export default payoutsSlice.reducer;
