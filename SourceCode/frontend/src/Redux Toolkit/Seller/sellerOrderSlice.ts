// src/redux/slices/sellerOrderSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '../../types/orderTypes'; 
import { ApiResponse } from '../../types/authTypes';
import { api } from '../../Config/Api';

interface SellerOrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  ordersLoaded: boolean;
  transitionRules: Record<string, string[]> | null;
}

const initialState: SellerOrderState = {
  orders: [],
  loading: false,
  error: null,
  ordersLoaded: false,
  transitionRules: null,
};

// Thunks for async actions
export const fetchSellerOrders = createAsyncThunk<Order[], string>(
  'sellerOrders/fetchSellerOrders',
  async (jwt, { rejectWithValue }) => {
    try {
      const response = await api.get('/seller/orders', {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      console.log("fetch seller orders",response.data)
      return response.data;
    } catch (error: any) {
      console.log("error",error.response)
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateOrderStatus = createAsyncThunk<Order, 
{ jwt: string, 
  orderId: string, 
  orderStatus: OrderStatus 
}>(
  'sellerOrders/updateOrderStatus',
  async ({ jwt, orderId, orderStatus }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/seller/orders/${orderId}/status/${orderStatus}`, 
        {}, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      console.log("order status updated",response.data)
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteOrder = createAsyncThunk<ApiResponse, { jwt: string, orderId: string }>(
  'sellerOrders/deleteOrder',
  async ({ jwt, orderId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/seller/orders/${orderId}/delete`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const assignTracking = createAsyncThunk<Order, { jwt: string, orderId: string, trackingNumber: string, carrier: string }>(
  'sellerOrders/assignTracking',
  async ({ jwt, orderId, trackingNumber, carrier }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/seller/orders/${orderId}/tracking`, { trackingNumber, carrier }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const exportSellerOrders = createAsyncThunk<void, { jwt: string; format: string; filters: { search: string; orderStatus: string; paymentStatus: string; paymentMethod: string } }>(
  'sellerOrders/exportOrders',
  async ({ jwt, format, filters }, { rejectWithValue }) => {
    try {
      const params: Record<string, string> = { format };
      if (filters.search) params.search = filters.search;
      if (filters.orderStatus) params.orderStatus = filters.orderStatus;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;

      const response = await api.get('/seller/orders/export', {
        params,
        headers: { Authorization: `Bearer ${jwt}` },
        responseType: 'blob',
      });

      const ext = format === 'xlsx' ? 'xlsx' : 'csv';
      const mime = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8;';

      const blob = new Blob([response.data], { type: mime });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `orders-export-${new Date().toISOString().split('T')[0]}.${ext}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export orders');
    }
  }
);

const downloadDocument = async (endpoint: string, orderId: string, filename: string) => {
  const jwt = localStorage.getItem("jwt") || "";
  const response = await api.get(endpoint, {
    headers: { Authorization: `Bearer ${jwt}` },
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const downloadSellerInvoice = createAsyncThunk<void, string>(
  "sellerOrders/downloadSellerInvoice",
  async (orderId, { rejectWithValue }) => {
    try {
      await downloadDocument(`/api/invoice/seller/${orderId}`, orderId, `settlement-${orderId}.pdf`);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to download seller invoice");
    }
  }
);

export const downloadPackingSlip = createAsyncThunk<void, string>(
  "sellerOrders/downloadPackingSlip",
  async (orderId, { rejectWithValue }) => {
    try {
      await downloadDocument(`/api/invoice/packing-slip/${orderId}`, orderId, `packing-slip-${orderId}.pdf`);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to download packing slip");
    }
  }
);

export const downloadCustomerInvoice = createAsyncThunk<void, string>(
  "sellerOrders/downloadCustomerInvoice",
  async (orderId, { rejectWithValue }) => {
    try {
      await downloadDocument(`/api/invoice/customer/${orderId}`, orderId, `invoice-${orderId}.pdf`);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to download customer invoice");
    }
  }
);

export const bulkDownloadDocuments = createAsyncThunk<void, { orderIds: string[]; documentType: "customer" | "seller" | "packing" }>(
  "sellerOrders/bulkDownloadDocuments",
  async ({ orderIds, documentType }, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt") || "";
      const response = await api.post(
        "/api/invoice/bulk",
        { orderIds, documentType },
        {
          headers: { Authorization: `Bearer ${jwt}` },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/zip" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const typeLabel = { customer: "Invoices", seller: "Settlements", packing: "Packing-Slips" };
      link.download = `${typeLabel[documentType]}-${new Date().toISOString().split("T")[0]}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to bulk download");
    }
  }
);

export const fetchTransitionRules = createAsyncThunk<Record<string, string[]>, string>(
  'sellerOrders/fetchTransitionRules',
  async (jwt, { rejectWithValue }) => {
    try {
      const response = await api.get('/seller/orders/transition-rules', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return response.data.transitionRules;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const sellerOrderSlice = createSlice({
  name: 'sellerOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
        state.ordersLoaded = true;
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
        console.log("Payload", action.payload);
        state.loading = false;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        console.log("Index", index);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        console.log(
  "Updated Order",
  state.orders.find(o => o.id === action.payload.id)
);

console.log(
  "Status =>",
  state.orders.find(o => o.id === action.payload.id)?.orderStatus
);
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(order => order.id !== action.meta.arg.orderId);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(assignTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTracking.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(assignTracking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTransitionRules.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchTransitionRules.fulfilled, (state, action) => {
        state.transitionRules = action.payload;
      })
      .addCase(fetchTransitionRules.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default sellerOrderSlice.reducer;
