// src/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Address, User, UserState } from "../../types/userTypes";
import { api } from "../../Config/Api";
import { RootState } from "../Store";

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  profileUpdated: false,
};

// Define the base URL for the API
const API_URL = "/api/users";

export const fetchUserProfile = createAsyncThunk<
  User,
  { jwt: string }
>(
  "user/fetchUserProfile",
  async ({ jwt }, { rejectWithValue }) =>
  {
    try
    {
      const response = await api.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      return response.data;
    } catch (error: any)
    {
      return rejectWithValue("Failed to fetch user profile");
    }
  }
);

export const addUserAddress = createAsyncThunk<
  User,
  {
    jwt: string;
    address: Address;
  }
>(
  "user/addUserAddress",
  async ({ jwt, address }, { rejectWithValue }) =>
  {
    try
    {
      const response = await api.post(
        `${API_URL}/address`,
        address,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      return response.data;
    } catch (error: any)
    {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add address"
      );
    }
  }
);

export const updateUserAddress = createAsyncThunk<
  User,
  {
    jwt: string;
    addressId: string;
    address: Address;
  }
>(
  "user/updateUserAddress",
  async ({ jwt, addressId, address }, { rejectWithValue }) =>
  {
    try
    {
      const response = await api.put(
        `${API_URL}/address/${addressId}`,
        address,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      return response.data;
    }
    catch (error: any)
    {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update address"
      );
    }
  }
);

export const deleteUserAddress = createAsyncThunk<
  User,
  {
    jwt: string;
    addressId: string;
  }
>(
  "user/deleteUserAddress",
  async ({ jwt, addressId }, { rejectWithValue }) =>
  {
    try
    {
      const response = await api.delete(
        `${API_URL}/address/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      return response.data;
    }
    catch (error: any)
    {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete address"
      );
    }
  }
);

export const setDefaultUserAddress = createAsyncThunk<
  User,
  {
    jwt: string;
    addressId: string;
  }
>(
  "user/setDefaultUserAddress",
  async ({ jwt, addressId }, { rejectWithValue }) =>
  {
    try
    {
      const response = await api.patch(
        `${API_URL}/address/${addressId}/default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      return response.data;
    }
    catch (error: any)
    {
      return rejectWithValue(
        error.response?.data?.message || "Failed to set default address"
      );
    }
  }
);

export const updateProfilePhoto = createAsyncThunk<
  User,
  { jwt: string; file: File }
>(
  "user/updateProfilePhoto",
  async ({ jwt, file }, { rejectWithValue }) =>
  {
    try
    {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.put(`${API_URL}/profile/photo`, formData, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    }
    catch (error: any)
    {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile photo"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserState: (state) =>
    {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.profileUpdated = false;
    },
    clearProfileUpdated: (state) => {
      state.profileUpdated = false;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) =>
  {
    builder
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) =>
      {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<User>) =>
        {
          state.user = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchUserProfile.rejected, (state, action) =>
      {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add User Address
      .addCase(addUserAddress.pending, (state) =>
      {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addUserAddress.fulfilled,
        (state, action: PayloadAction<User>) =>
        {
          state.loading = false;
          state.user = action.payload;
        }
      )
      .addCase(addUserAddress.rejected, (state, action) =>
      {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update User Address
      .addCase(updateUserAddress.pending, (state) =>
      {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateUserAddress.fulfilled,
        (state, action: PayloadAction<User>) =>
        {
          state.loading = false;
          state.user = action.payload;
        }
      )
      .addCase(updateUserAddress.rejected, (state, action) =>
      {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete User Address
      .addCase(deleteUserAddress.pending, (state) =>
      {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteUserAddress.fulfilled,
        (state, action: PayloadAction<User>) =>
        {
          state.loading = false;
          state.user = action.payload;
        }
      )
      .addCase(deleteUserAddress.rejected, (state, action) =>
      {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Set Default User Address
      .addCase(setDefaultUserAddress.pending, (state) =>
      {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        setDefaultUserAddress.fulfilled,
        (state, action: PayloadAction<User>) =>
        {
          state.loading = false;
          state.user = action.payload;
        }
      )
      .addCase(setDefaultUserAddress.rejected, (state, action) =>
      {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Profile Photo
      .addCase(updateProfilePhoto.pending, (state) =>
      {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProfilePhoto.fulfilled,
        (state, action: PayloadAction<User>) =>
        {
          state.loading = false;
          state.user = action.payload;
          state.profileUpdated = true;
        }
      )
      .addCase(updateProfilePhoto.rejected, (state, action) =>
      {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetUserState, clearProfileUpdated, clearUserError } = userSlice.actions;

export default userSlice.reducer;

export const selectUser = (state: RootState) => state.user.user;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
