import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import {
    AdminUserState,
    AdminUserListResponse,
    AdminUserDetailResponse,
    AdminUserCountsResponse,
    AdminSellerStatusResponse,
} from '../../types/adminUserTypes';

const API_URL = '/admin/users';

const initialState: AdminUserState = {
    users: [],
    selectedUser: null,
    counts: null,
    pagination: null,
    loading: false,
    error: null,
    loaded: false,
    statusUpdated: false,
};

export const fetchAdminUsers = createAsyncThunk<
    AdminUserListResponse,
    {
        role?: string | null;
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
    },
    { rejectValue: string }
>(
    'adminUser/fetchAdminUsers',
    async (params, { rejectWithValue }) =>
    {
        try
        {
            const queryParams: Record<string, string | number> = {};
            if (params.role) queryParams.role = params.role;
            if (params.page) queryParams.page = params.page;
            if (params.limit) queryParams.limit = params.limit;
            if (params.search) queryParams.search = params.search;
            if (params.sortBy) queryParams.sortBy = params.sortBy;
            if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

            const response = await api.get<AdminUserListResponse>(API_URL, {
                params: queryParams,
            });
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch users'
            );
        }
    }
);

export const fetchAdminUserById = createAsyncThunk<
    AdminUserDetailResponse,
    string,
    { rejectValue: string }
>(
    'adminUser/fetchAdminUserById',
    async (userId, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<AdminUserDetailResponse>(
                `${API_URL}/${userId}`
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch user details'
            );
        }
    }
);

export const fetchAdminUserCounts = createAsyncThunk<
    AdminUserCountsResponse,
    void,
    { rejectValue: string }
>(
    'adminUser/fetchAdminUserCounts',
    async (_, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get<AdminUserCountsResponse>(
                `${API_URL}/counts`
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch user counts'
            );
        }
    }
);

export const updateSellerAccountStatus = createAsyncThunk<
    AdminSellerStatusResponse,
    { sellerId: string; status: string },
    { rejectValue: string }
>(
    'adminUser/updateSellerAccountStatus',
    async ({ sellerId, status }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.patch<AdminSellerStatusResponse>(
                `${API_URL}/${sellerId}/seller-status`,
                { status }
            );
            return response.data;
        }
        catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update seller status'
            );
        }
    }
);

const handlePending = (state: AdminUserState) =>
{
    state.loading = true;
    state.error = null;
};

const handleRejected = (state: AdminUserState, action: { payload?: string }) =>
{
    state.loading = false;
    state.error = action.payload || 'An error occurred';
};

const adminUserSlice = createSlice({
    name: 'adminUser',
    initialState,
    reducers: {
        clearAdminUserError: (state) =>
        {
            state.error = null;
        },
        clearStatusUpdated: (state) =>
        {
            state.statusUpdated = false;
        },
        resetAdminUserState: () =>
        {
            return initialState;
        },
        clearSelectedUser: (state) =>
        {
            state.selectedUser = null;
        },
    },
    extraReducers: (builder) =>
    {
        builder
            // fetchAdminUsers
            .addCase(fetchAdminUsers.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchAdminUsers.fulfilled, (state, action: PayloadAction<AdminUserListResponse>) =>
            {
                state.loading = false;
                state.users = action.payload.data;
                state.pagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchAdminUsers.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchAdminUserById
            .addCase(fetchAdminUserById.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchAdminUserById.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.selectedUser = action.payload.data;
            })
            .addCase(fetchAdminUserById.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // fetchAdminUserCounts
            .addCase(fetchAdminUserCounts.pending, (state) =>
            {
                handlePending(state);
            })
            .addCase(fetchAdminUserCounts.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.counts = action.payload.data;
            })
            .addCase(fetchAdminUserCounts.rejected, (state, action) =>
            {
                handleRejected(state, action);
            })

            // updateSellerAccountStatus
            .addCase(updateSellerAccountStatus.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
                state.statusUpdated = false;
            })
            .addCase(updateSellerAccountStatus.fulfilled, (state, action) =>
            {
                state.loading = false;
                state.statusUpdated = true;
                const { sellerId, accountStatus } = action.payload.data;

                const index = state.users.findIndex(
                    (u) => u.sellerId === sellerId
                );
                if (index !== -1)
                {
                    state.users[index] = {
                        ...state.users[index],
                        accountStatus,
                    };
                }

                if (state.selectedUser?.sellerId === sellerId)
                {
                    state.selectedUser = {
                        ...state.selectedUser,
                        accountStatus,
                    };
                }
            })
            .addCase(updateSellerAccountStatus.rejected, (state, action) =>
            {
                handleRejected(state, action);
            });
    },
});

export const {
    clearAdminUserError,
    clearStatusUpdated,
    resetAdminUserState,
    clearSelectedUser,
} = adminUserSlice.actions;

export default adminUserSlice.reducer;
