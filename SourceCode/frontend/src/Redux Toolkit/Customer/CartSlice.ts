// src/slices/cartSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Cart } from "../../types/cartTypes";
import { api } from "../../Config/Api";
import { RootState } from "../Store";
import { applyCoupon } from "./CouponSlice";
// cartCalculator imports removed — totals use backend values only

interface CartState
{
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

// Define the base URL for the API
const API_URL = "/api/cart";

export const fetchUserCart = createAsyncThunk<Cart, string>(
  "cart/fetchUserCart",
  async (jwt: string, { rejectWithValue }) =>
  {
    try
    {
      const response = await api.get(API_URL, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      console.log("Cart fetched ", response.data);
      return response.data;
    } catch (error: any)
    {
      console.log("error ", error.response);
      return rejectWithValue("Failed to fetch user cart");
    }
  }
);

interface AddItemRequest
{
  productId: string | undefined;
  variantId?: string;
  size: string;
  quantity: number;
}

export const addItemToCart = createAsyncThunk<
  Cart,
  { jwt: string | null; request: AddItemRequest }
>("cart/addItemToCart", async ({ jwt, request }, { rejectWithValue }) =>
{
  try
  {
    const response = await api.put(`${API_URL}/add`, request, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    console.log("Cart added ", response.data);
    return response.data;
  } catch (error: any)
  {
    console.log("error ", error.response);
    return rejectWithValue("Failed to add item to cart");
  }
});

export const deleteCartItem = createAsyncThunk<
  Cart,
  { jwt: string; cartItemId: string }
>("cart/deleteCartItem", async ({ jwt, cartItemId }, { rejectWithValue }) =>
{
  try
  {
    const response = await api.delete(`${API_URL}/item/${cartItemId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any)
  {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete cart item"
    );
  }
});

export const updateCartItem = createAsyncThunk<
  Cart,
  { jwt: string | null; cartItemId: string; cartItem: any }
>(
  "cart/updateCartItem",
  async ({ jwt, cartItemId, cartItem }, { rejectWithValue }) =>
  {
    try
    {
      const response = await api.put(
        `${API_URL}/item/${cartItemId}`,
        cartItem,
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      return response.data;
    } catch (error: any)
    {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cart item"
      );
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCartState: (state) =>
    {
      state.cart = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) =>
  {
    builder
      .addCase(fetchUserCart.pending, (state) =>
      {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserCart.fulfilled,
        (state, action: PayloadAction<Cart>) =>
        {
          state.cart = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchUserCart.rejected, (state, action) =>
      {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addItemToCart.pending, (state) =>
      {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addItemToCart.fulfilled,
        (state, action: PayloadAction<Cart>) =>
        {
          state.loading = false;
          state.cart = action.payload;
        }
      )
      .addCase(addItemToCart.rejected, (state, action) =>
      {
        state.loading = false;
        state.error = action.payload as string;
      })

      // cart item
      .addCase(deleteCartItem.pending, (state) =>
      {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) =>
      {
        state.cart = action.payload;
        state.loading = false;
      })
      .addCase(deleteCartItem.rejected, (state, action) =>
      {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCartItem.pending, (state) =>
      {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) =>
      {
        state.cart = action.payload;
        state.loading = false;
      })
      .addCase(updateCartItem.rejected, (state, action) =>
      {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(applyCoupon.fulfilled, (state, action) =>
      {
        state.loading = false;
        state.cart = action.payload;

      });
  },
});

export default cartSlice.reducer;
export const { resetCartState } = cartSlice.actions;

export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError = (state: RootState) => state.cart.error;
