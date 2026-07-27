import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { api } from "../../Config/Api";
import { Transaction } from "../../types/Transaction";

/**
 * Standard API response contract.
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Transaction Redux state.
 */
interface TransactionState {
  transactions: Transaction[];
  transaction: Transaction | null;
  loading: boolean;
  error: string | null;
  sellerTransactionsLoaded: boolean;
}

/**
 * Initial state.
 */
const initialState: TransactionState = {
  transactions: [],
  transaction: null,
  loading: false,
  error: null,
  sellerTransactionsLoaded: false,
};

/**
 * Fetch authenticated seller transactions.
 */
export const fetchTransactionsBySeller = createAsyncThunk<
  Transaction[],
  string,
  { rejectValue: string }
>(
  "transactions/fetchTransactionsBySeller",
  async (jwt, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Transaction[]>>(
        "/api/transactions/seller",
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ??
            "Failed to fetch seller transactions."
        );
      }

      return rejectWithValue("Unexpected error occurred.");
    }
  }
);

/**
 * Fetch all platform transactions.
 */
export const fetchAllTransactions = createAsyncThunk<
  Transaction[],
  void,
  { rejectValue: string }
>(
  "transactions/fetchAllTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("jwt");

      const response = await api.get<ApiResponse<Transaction[]>>(
        "/api/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ??
            "Failed to fetch platform transactions."
        );
      }

      return rejectWithValue("Unexpected error occurred.");
    }
  }
);

/**
 * Transaction slice.
 */
const transactionSlice = createSlice({
  name: "transactions",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    // Seller Transactions
    builder
      .addCase(fetchTransactionsBySeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsBySeller.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
        state.sellerTransactionsLoaded = true;
      })
      .addCase(fetchTransactionsBySeller.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to fetch seller transactions.";
      });

    // Platform Transactions
    builder
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to fetch platform transactions.";
      });
  },
});

export default transactionSlice.reducer;
