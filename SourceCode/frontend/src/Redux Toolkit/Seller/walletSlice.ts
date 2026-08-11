import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LedgerEntry, LedgerStats, SellerSettlement, SellerSettlementStats, Pagination, WalletState } from "../../types/walletTypes";
import { api } from "../../Config/Api";

const initialState: WalletState = {
  ledgerEntries: [],
  ledgerStats: null,
  ledgerLoading: false,
  ledgerError: null,
  settlements: [],
  settlementStats: null,
  settlementLoading: false,
  settlementError: null,
  pagination: null,
  ledgerRequestKey: null,
  ledgerStatsLoaded: false,
  settlementRequestKey: null,
  settlementStatsLoaded: false,
};

export const fetchSellerLedger = createAsyncThunk<
  { entries: LedgerEntry[]; pagination: Pagination },
  { type?: string; startDate?: string; endDate?: string; page?: number; limit?: number } | undefined,
  { rejectValue: string }
>("wallet/fetchSellerLedger", async (params, { rejectWithValue }) => {
  try {
    const jwt = localStorage.getItem("jwt");
    const response = await api.get("/seller/ledger", {
      headers: { Authorization: `Bearer ${jwt}` },
      params,
    });
    return { entries: response.data.data, pagination: response.data.pagination };
  } catch (error: any) {
    if (error.response) return rejectWithValue(error.response.data.message);
    return rejectWithValue("Failed to fetch ledger");
  }
});

export const fetchSellerLedgerStats = createAsyncThunk<
  LedgerStats,
  void,
  { rejectValue: string }
>("wallet/fetchSellerLedgerStats", async (_, { rejectWithValue }) => {
  try {
    const jwt = localStorage.getItem("jwt");
    const response = await api.get("/seller/ledger/statistics", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) return rejectWithValue(error.response.data.message);
    return rejectWithValue("Failed to fetch ledger stats");
  }
});

export const fetchSellerSettlements = createAsyncThunk<
  { settlements: SellerSettlement[]; pagination: Pagination },
  { status?: string; type?: string; startDate?: string; endDate?: string; page?: number; limit?: number } | undefined,
  { rejectValue: string }
>("wallet/fetchSellerSettlements", async (params, { rejectWithValue }) => {
  try {
    const jwt = localStorage.getItem("jwt");
    const response = await api.get("/seller/settlements", {
      headers: { Authorization: `Bearer ${jwt}` },
      params,
    });
    return { settlements: response.data.data, pagination: response.data.pagination };
  } catch (error: any) {
    if (error.response) return rejectWithValue(error.response.data.message);
    return rejectWithValue("Failed to fetch settlements");
  }
});

export const fetchSellerSettlementStats = createAsyncThunk<
  SellerSettlementStats,
  void,
  { rejectValue: string }
>("wallet/fetchSellerSettlementStats", async (_, { rejectWithValue }) => {
  try {
    const jwt = localStorage.getItem("jwt");
    const response = await api.get("/seller/settlements/statistics", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) return rejectWithValue(error.response.data.message);
    return rejectWithValue("Failed to fetch settlement stats");
  }
});

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.ledgerError = null;
      state.settlementError = null;
    },
    resetWalletState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerLedger.pending, (state, action) => {
        state.ledgerLoading = true;
        state.ledgerError = null;
        state.ledgerRequestKey = `${action.meta.arg?.page ?? 1}:${action.meta.arg?.limit ?? 20}`;
      })
      .addCase(fetchSellerLedger.fulfilled, (state, action) => {
        state.ledgerLoading = false;
        state.ledgerEntries = action.payload.entries;
        state.pagination = action.payload.pagination;
        state.ledgerRequestKey = `${action.payload.pagination.page}:${action.payload.pagination.limit}`;
      })
      .addCase(fetchSellerLedger.rejected, (state, action) => {
        state.ledgerLoading = false;
        state.ledgerError = action.payload as string;
      })
      .addCase(fetchSellerLedgerStats.pending, (state) => {
        state.ledgerStatsLoaded = true;
      })
      .addCase(fetchSellerLedgerStats.fulfilled, (state, action) => {
        state.ledgerStats = action.payload;
        state.ledgerStatsLoaded = true;
      })
      .addCase(fetchSellerLedgerStats.rejected, (state) => {
        state.ledgerStatsLoaded = true;
      })
      .addCase(fetchSellerSettlements.pending, (state, action) => {
        state.settlementLoading = true;
        state.settlementError = null;
        state.settlementRequestKey = `${action.meta.arg?.page ?? 1}:${action.meta.arg?.limit ?? 20}`;
      })
      .addCase(fetchSellerSettlements.fulfilled, (state, action) => {
        state.settlementLoading = false;
        state.settlements = action.payload.settlements;
        state.pagination = action.payload.pagination;
        state.settlementRequestKey = `${action.payload.pagination.page}:${action.payload.pagination.limit}`;
      })
      .addCase(fetchSellerSettlements.rejected, (state, action) => {
        state.settlementLoading = false;
        state.settlementError = action.payload as string;
      })
      .addCase(fetchSellerSettlementStats.pending, (state) => {
        state.settlementStatsLoaded = true;
      })
      .addCase(fetchSellerSettlementStats.fulfilled, (state, action) => {
        state.settlementStats = action.payload;
        state.settlementStatsLoaded = true;
      })
      .addCase(fetchSellerSettlementStats.rejected, (state) => {
        state.settlementStatsLoaded = true;
      });
  },
});

export const { clearWalletError, resetWalletState } = walletSlice.actions;
export default walletSlice.reducer;
