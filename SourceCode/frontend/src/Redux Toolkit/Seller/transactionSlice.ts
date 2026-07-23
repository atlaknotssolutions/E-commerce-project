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

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// import { Transaction } from '../../types/Transaction';
// import { Order } from '../../types/orderTypes';
// import { api } from '../../Config/Api';

// interface TransactionState {
//   transactions: Transaction[];
//   transaction: Transaction | null;
//   loading: boolean;
//   error: string | null;
// }

// // Initial state
// const initialState: TransactionState = {
//   transactions: [],
//   transaction: null,
//   loading: false,
//   error: null,
// };

// // Thunks
// export const fetchTransactionsBySeller = createAsyncThunk<
//   Transaction[],
//   string,
//   { rejectValue: string }
// >('transactions/fetchTransactionsBySeller', async (jwt, { rejectWithValue }) => {
//   try {
//     const response = await api.get<Transaction[]>('/api/transactions/seller', {
//       headers: {
//         Authorization: `Bearer ${jwt}`,
//       },
//     });
//     console.log("fetchTransactionsBySeller",response.data)
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       return rejectWithValue(error.response.data.message);
//     }
//     return rejectWithValue('Failed to fetch transactions');
//   }
// });

// export const fetchAllTransactions = createAsyncThunk<
//   Transaction[],
//   void,
//   { rejectValue: string }
// >('transactions/fetchAllTransactions', async (_, { rejectWithValue }) => {
//   try {
//     const response = await api.get<Transaction[]>('/api/transactions');
//     return response.data;
//   } catch (error: any) {
//     if (error.response) {
//       return rejectWithValue(error.response.data.message);
//     }
//     return rejectWithValue('Failed to fetch all transactions');
//   }
// });



// // Slice
// const transactionSlice = createSlice({
//   name: 'transactions',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchTransactionsBySeller.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTransactionsBySeller.fulfilled, (state, action) => {
//         state.loading = false;
//         state.transactions = action.payload;
//       })
//       .addCase(fetchTransactionsBySeller.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })
//       .addCase(fetchAllTransactions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllTransactions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.transactions = action.payload;
//       })
//       .addCase(fetchAllTransactions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export default transactionSlice.reducer;
