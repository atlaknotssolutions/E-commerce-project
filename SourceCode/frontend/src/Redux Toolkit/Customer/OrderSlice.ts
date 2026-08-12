// src/slices/orderSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../Store";
import { Order, OrderItem, OrderState, ReturnRequest } from "../../types/orderTypes";
import { Address } from "../../types/userTypes";
import { api } from "../../Config/Api";
import { ApiResponse } from "../../types/authTypes";

const initialState: OrderState = {
  orders: [],
  orderItem:null,
  currentOrder: null,
  paymentOrder: null,
  loading: false,
  error: null,
  orderCanceled:false,
  returns: [],
  returnsLoaded: false,
  returnLoading: false,
  returnError: null,
};

const API_URL = "/api/orders";

// Fetch user order history
export const fetchUserOrderHistory = createAsyncThunk<Order[], string>(
  "orders/fetchUserOrderHistory",
  async (jwt, { rejectWithValue }) => {
    try {
      const response = await api.get<Order[]>(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      console.log("order history fetched ", response.data);
      return response.data;
    } catch (error: any) {
      console.log("error ", error.response);
      return rejectWithValue(
        error.response.data.error || "Failed to fetch order history"
      );
    }
  }
);

// Fetch order by ID
export const fetchOrderById = createAsyncThunk<
  Order,
  { orderId: string; jwt: string }
>("orders/fetchOrderById", async ({ orderId, jwt }, { rejectWithValue }) => {
  try {
    const response = await api.get<Order>(`${API_URL}/${orderId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    console.log("order fetched ", response.data);
    return response.data;
  } catch (error: any) {
    console.log("error ", error.response);
    return rejectWithValue("Failed to fetch order");
  }
});

// Create a new order
export const createOrder = createAsyncThunk<
  any,
  { address: Address; jwt: string, paymentGateway: string}
>("orders/createOrder", async ({ address, jwt , paymentGateway}, { rejectWithValue }) => {
  try {
    const token = jwt || localStorage.getItem("jwt") || "";
    if (!token) {
      return rejectWithValue("Please log in before checkout.");
    }

    const response = await api.post<any>(API_URL, address, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      params:{paymentMethod:paymentGateway}
    });
    console.log("order created ", response.data);
    if(response.data.payment_link_url){
        window.location.href=response.data.payment_link_url
    }
  
    return response.data;
  } catch (error: any) {
    console.log("error ", error.response);
    return rejectWithValue(error.response?.data?.message || "Failed to create order");
  }
});

export const fetchOrderItemById = createAsyncThunk<
  OrderItem,
  {  orderItemId: string; jwt: string }
>("orders/fetchOrderItemById", async ({ orderItemId, jwt }, { rejectWithValue }) => {
  try {
    const response = await api.get<OrderItem>(`${API_URL}/item/${orderItemId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    console.log("order item fetched ", response.data);
    return response.data;
  } catch (error: any) {
    console.log("error ", error.response);
    return rejectWithValue("Failed to create order");
  }
});

// payment success handler

export const paymentSuccess = createAsyncThunk<
  ApiResponse,
  { paymentId: string; jwt: string; paymentMethod: string; paymentLinkId:string },
  { rejectValue: string }
>('orders/paymentSuccess', async ({ paymentId, paymentMethod, jwt, paymentLinkId }, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/payment/${paymentId}`, {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      params:{paymentMethod, paymentLinkId}
    });

    console.log("payment success ",response.data)
    
    return response.data;
  } catch (error: any) {
    console.log("error ",error.response)
    console.log("PAYMENT FAILED", error.response?.data);
    if (error.response) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue('Failed to process payment');
  }
});


export const cancelOrder = createAsyncThunk<Order, string>(
  'orders/cancelOrder',
  async ( orderId, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_URL}/${orderId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      console.log("cancel order ",response.data)
      return response.data;
    } catch (error:any) {
      console.log("error ", error.response)
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('An error occurred while cancelling the order.');
    }
  }
);

const RETURN_API_URL = "/api/returns";

export const requestReturn = createAsyncThunk<
  ReturnRequest,
  {
    jwt: string;
    orderId: string;
    orderItemId: string;
    productId: string;
    reason: string;
    description?: string;
    images?: string[];
  },
  { rejectValue: string }
>(
  "orders/requestReturn",
  async ({ jwt, orderId, orderItemId, productId, reason, description, images }, { rejectWithValue }) => {
    try {
      const response = await api.post<ReturnRequest>(
        RETURN_API_URL,
        { orderId, orderItemId, productId, reason, description, images },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      console.log("return requested", response.data);
      return response.data;
    } catch (error: any) {
      console.log("error ", error.response);
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit return request"
      );
    }
  }
);

export const downloadInvoice = createAsyncThunk<void, { orderId: string; jwt: string }>(
  'orders/downloadInvoice',
  async ({ orderId, jwt }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/invoice/customer/${orderId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `invoice-${orderId}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download invoice');
    }
  }
);

export const fetchMyReturns = createAsyncThunk<
  ReturnRequest[],
  string,
  { rejectValue: string }
>(
  "orders/fetchMyReturns",
  async (jwt, { rejectWithValue }) => {
    try {
      const response = await api.get<ReturnRequest[]>(RETURN_API_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      console.log("returns fetched", response.data);
      return response.data;
    } catch (error: any) {
      console.log("error ", error.response);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch returns"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderCanceled: (state) => {
      state.orderCanceled = false;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user order history
      .addCase(fetchUserOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.orderCanceled = false;
      })
      .addCase(
        fetchUserOrderHistory.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.orders = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchUserOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrderById.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.currentOrder = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create a new order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<any>) => {
        state.paymentOrder = action.payload;
        state.loading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Order Item by ID
      .addCase(fetchOrderItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.orderItem = action.payload;
      })
      .addCase(fetchOrderItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // payment success handler
      .addCase(paymentSuccess.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(paymentSuccess.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Payment successful:', action.payload);
      })
      .addCase(paymentSuccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.orderCanceled = false;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.map((order) =>
          order.id === action.payload.id ? action.payload : order
        );
        state.orderCanceled = true;
        state.currentOrder = action.payload
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Request Return
      .addCase(requestReturn.pending, (state) => {
        state.returnLoading = true;
        state.returnError = null;
      })
      .addCase(requestReturn.fulfilled, (state, action) => {
        state.returnLoading = false;
        state.returns.unshift(action.payload);
      })
      .addCase(requestReturn.rejected, (state, action) => {
        state.returnLoading = false;
        state.returnError = action.payload as string;
      })

      // Fetch My Returns
      .addCase(fetchMyReturns.pending, (state) => {
        state.returnLoading = true;
        state.returnError = null;
      })
      .addCase(fetchMyReturns.fulfilled, (state, action) => {
        state.returns = action.payload;
        state.returnsLoaded = true;
        state.returnLoading = false;
      })
      .addCase(fetchMyReturns.rejected, (state, action) => {
        state.returnLoading = false;
        state.returnError = action.payload as string;
      });
  },
});

export const { clearOrderCanceled, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;

export const selectOrders = (state: RootState) => state.orders.orders;
export const selectCurrentOrder = (state: RootState) =>
  state.orders.currentOrder;
export const selectPaymentOrder = (state: RootState) =>
  state.orders.paymentOrder;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersError = (state: RootState) => state.orders.error;
