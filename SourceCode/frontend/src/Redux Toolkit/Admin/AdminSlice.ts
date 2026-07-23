import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HomeCategory } from '../../types/homeDataTypes';
import { api } from '../../Config/Api';

const API_URL = '/admin';

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string | null;
  role: string;
  profileImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface HomeCategoryResponse {
  success: boolean;
  data: HomeCategory;
  message?: string;
}

interface HomeCategoryListResponse {
  success: boolean;
  data: HomeCategory[];
}

export const updateHomeCategory = createAsyncThunk<
  HomeCategoryResponse,
  { id: string; data: Partial<HomeCategory> }
>(
  'homeCategory/updateHomeCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`${API_URL}/home-category/${id}`, data);
      return response.data;
    } catch (error) {
      const axiosErr = error as { response?: { data?: unknown }; message?: string };
      if (axiosErr.response && axiosErr.response.data) {
        return rejectWithValue(axiosErr.response.data);
      } else {
        return rejectWithValue('An error occurred while updating the category.');
      }
    }
  }
);

export const fetchHomeCategories =
  createAsyncThunk<HomeCategoryListResponse>(
    'homeCategory/fetchHomeCategories',
    async (_, { rejectWithValue }) => {
      try {
        const response = await api.get(`${API_URL}/home-category`);
        return response.data;
      } catch (error) {
        const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
        return rejectWithValue(axiosErr.response?.data?.message || 'Failed to fetch categories');
      }
    }
  );

export const createHomeCategory = createAsyncThunk<
  HomeCategory,
  Partial<HomeCategory>
>(
  "homeCategory/createHomeCategory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${API_URL}/home-categories`,
        data
      );
        return response.data.data;
    } catch (error) {
      const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(
        axiosErr.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const deleteHomeCategory = createAsyncThunk<
  string,
  string
>(
  "homeCategory/deleteHomeCategory",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${API_URL}/home-categories/${id}`);
      return id;
    } catch (error) {
      const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(
        axiosErr.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

export const reorderHomeCategories = createAsyncThunk<
  void,
  { id: string; displayOrder: number }[]
>(
  'homeCategory/reorderHomeCategories',
  async (items, { rejectWithValue }) => {
    try {
      await api.patch(`${API_URL}/home-categories/reorder`, items);
    } catch (error) {
      const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(
        axiosErr.response?.data?.message || 'Failed to reorder categories'
      );
    }
  }
);

export const toggleHomeCategoryStatus = createAsyncThunk<
  HomeCategory,
  { id: string; isActive: boolean }
>(
  "homeCategory/toggleHomeCategoryStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await api.patch<HomeCategoryResponse>(
        `${API_URL}/home-categories/${id}/status`,
        { isActive }
      );
      return response.data.data;
    } catch (error) {
      const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(
        axiosErr.response?.data?.message || "Failed to update status"
      );
    }
  }
);

export const fetchAdminProfile = createAsyncThunk<
  AdminProfile,
  string,
  { rejectValue: string }
>(
  'admin/fetchAdminProfile',
  async (jwt, { rejectWithValue }) => {
    try {
      const response = await api.get<AdminProfile>(`${API_URL}/account`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch admin profile'
      );
    }
  }
);

export const updateAdminProfilePhoto = createAsyncThunk<
  AdminProfile,
  { jwt: string; file: File },
  { rejectValue: string }
>(
  'admin/updateAdminProfilePhoto',
  async ({ jwt, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.put<AdminProfile>('/api/users/profile/photo', formData, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile photo'
      );
    }
  }
);

interface HomeCategoryState {
  categories: HomeCategory[];
  loading: boolean;
  error: string | null;
  categoryUpdated: boolean;
  categoryCreated: boolean;
  categoryDeleted: boolean;
  categoryStatusUpdated: boolean;
  _rollbackCategories: HomeCategory[] | null;
  profile: AdminProfile | null;
  profileLoaded: boolean;
}

const initialState: HomeCategoryState = {
  categories: [],
  loading: false,
  error: null,
  categoryUpdated: false,
  categoryCreated: false,
  categoryDeleted: false,
  categoryStatusUpdated: false,
  _rollbackCategories: null,
  profile: null,
  profileLoaded: false,
};

const homeCategorySlice = createSlice({
  name: 'homeCategory',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.categoryUpdated = false;
      state.categoryCreated = false;
      state.categoryDeleted = false;
      state.categoryStatusUpdated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateHomeCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.categoryUpdated = false;
    });
    builder.addCase(updateHomeCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.categoryUpdated = true;
      const updatedCategory = action.payload.data;
      const index = state.categories.findIndex(
        (category) => category.id === updatedCategory.id
      );
      if (index !== -1) {
        state.categories[index] = updatedCategory;
      } else {
        state.categories.push(updatedCategory);
      }
    });
    builder.addCase(updateHomeCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchHomeCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.categoryUpdated = false;
    });
    builder.addCase(fetchHomeCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload.data;
    });
    builder.addCase(fetchHomeCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createHomeCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.categoryCreated = false;
    });
    builder.addCase(createHomeCategory.fulfilled, (state) => {
      state.loading = false;
      state.categoryCreated = true;
    });
    builder.addCase(createHomeCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(deleteHomeCategory.pending, (state, action) => {
      state._rollbackCategories = [...state.categories];
      state.categories = state.categories.filter((c) => c.id !== action.meta.arg);
      state.error = null;
    });
    builder.addCase(deleteHomeCategory.fulfilled, (state) => {
      state._rollbackCategories = null;
      state.categoryDeleted = true;
    });
    builder.addCase(deleteHomeCategory.rejected, (state) => {
      if (state._rollbackCategories) {
        state.categories = state._rollbackCategories;
        state._rollbackCategories = null;
      }
    });

    builder.addCase(toggleHomeCategoryStatus.pending, (state, action) => {
      state._rollbackCategories = [...state.categories];
      const index = state.categories.findIndex((c) => c.id === action.meta.arg.id);
      if (index !== -1) {
        state.categories[index] = {
          ...state.categories[index],
          isActive: action.meta.arg.isActive,
        };
      }
    });
    builder.addCase(toggleHomeCategoryStatus.fulfilled, (state, action) => {
      state._rollbackCategories = null;
      state.categoryStatusUpdated = true;
      const updated = action.payload;
      const index = state.categories.findIndex((c) => c.id === updated.id);
      if (index !== -1) {
        state.categories[index] = updated;
      }
    });
    builder.addCase(toggleHomeCategoryStatus.rejected, (state) => {
      state.error = "Failed to update status. Changes reverted.";
      if (state._rollbackCategories) {
        state.categories = state._rollbackCategories;
        state._rollbackCategories = null;
      }
    });

    builder.addCase(reorderHomeCategories.pending, (state, action) => {
      state._rollbackCategories = [...state.categories];
      const orderMap = new Map(
        action.meta.arg.map((item, idx) => [item.id, idx])
      );
      state.categories.sort((a, b) => {
        const aOrder = a.id ? orderMap.get(a.id) ?? Infinity : Infinity;
        const bOrder = b.id ? orderMap.get(b.id) ?? Infinity : Infinity;
        return aOrder - bOrder;
      });
    });
    builder.addCase(reorderHomeCategories.fulfilled, (state) => {
      state._rollbackCategories = null;
    });
    builder.addCase(reorderHomeCategories.rejected, (state) => {
      if (state._rollbackCategories) {
        state.categories = state._rollbackCategories;
        state._rollbackCategories = null;
      }
    });

    builder.addCase(fetchAdminProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminProfile.fulfilled, (state, action: PayloadAction<AdminProfile>) => {
      state.loading = false;
      state.profile = action.payload;
      state.profileLoaded = true;
    });
    builder.addCase(fetchAdminProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateAdminProfilePhoto.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAdminProfilePhoto.fulfilled, (state, action: PayloadAction<AdminProfile>) => {
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(updateAdminProfilePhoto.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearMessages } = homeCategorySlice.actions;
export default homeCategorySlice.reducer;
