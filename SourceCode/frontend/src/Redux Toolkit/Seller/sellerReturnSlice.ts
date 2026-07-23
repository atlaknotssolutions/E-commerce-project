import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import { ReturnRequest, ReturnStatus } from '../../types/orderTypes';

interface SellerReturnState {
  returns: ReturnRequest[];
  loading: boolean;
  error: string | null;
  returnsLoaded: boolean;
}

const initialState: SellerReturnState = {
  returns: [],
  loading: false,
  error: null,
  returnsLoaded: false,
};

const RETURN_API = '/seller/returns';

export const fetchSellerReturns = createAsyncThunk<ReturnRequest[], string>(
  'sellerReturns/fetchSellerReturns',
  async (jwt, { rejectWithValue }) => {
    try {
      const response = await api.get<ReturnRequest[]>(RETURN_API, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch returns'
      );
    }
  }
);

export const approveReturn = createAsyncThunk<
  ReturnRequest,
  { jwt: string; returnId: string; sellerNote?: string }
>(
  'sellerReturns/approveReturn',
  async ({ jwt, returnId, sellerNote }, { rejectWithValue }) => {
    try {
      const response = await api.patch<ReturnRequest>(
        `${RETURN_API}/${returnId}/approve`,
        { sellerNote },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to approve return'
      );
    }
  }
);

export const rejectReturn = createAsyncThunk<
  ReturnRequest,
  { jwt: string; returnId: string; sellerNote: string }
>(
  'sellerReturns/rejectReturn',
  async ({ jwt, returnId, sellerNote }, { rejectWithValue }) => {
    try {
      const response = await api.patch<ReturnRequest>(
        `${RETURN_API}/${returnId}/reject`,
        { sellerNote },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reject return'
      );
    }
  }
);

export const markItemReceived = createAsyncThunk<
  ReturnRequest,
  { jwt: string; returnId: string }
>(
  'sellerReturns/markItemReceived',
  async ({ jwt, returnId }, { rejectWithValue }) => {
    try {
      const response = await api.patch<ReturnRequest>(
        `${RETURN_API}/${returnId}/receive`,
        {},
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark item received'
      );
    }
  }
);

export const processRefund = createAsyncThunk<
  ReturnRequest,
  { jwt: string; returnId: string }
>(
  'sellerReturns/processRefund',
  async ({ jwt, returnId }, { rejectWithValue }) => {
    try {
      const response = await api.patch<ReturnRequest>(
        `${RETURN_API}/${returnId}/refund`,
        {},
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to process refund'
      );
    }
  }
);

const sellerReturnSlice = createSlice({
  name: 'sellerReturns',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Seller Returns
      .addCase(fetchSellerReturns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerReturns.fulfilled, (state, action) => {
        state.loading = false;
        state.returns = action.payload;
        state.returnsLoaded = true;
      })
      .addCase(fetchSellerReturns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Approve Return
      .addCase(approveReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveReturn.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.returns.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.returns[idx] = action.payload;
      })
      .addCase(approveReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reject Return
      .addCase(rejectReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectReturn.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.returns.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.returns[idx] = action.payload;
      })
      .addCase(rejectReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Mark Item Received
      .addCase(markItemReceived.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markItemReceived.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.returns.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.returns[idx] = action.payload;
      })
      .addCase(markItemReceived.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Process Refund
      .addCase(processRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.returns.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.returns[idx] = action.payload;
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default sellerReturnSlice.reducer;
