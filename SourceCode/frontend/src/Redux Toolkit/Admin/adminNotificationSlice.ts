import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import {
    AdminNotification,
    AdminNotificationState,
    NotificationFilters,
    NotificationStatistics,
} from '../../types/adminNotificationTypes';

const API_URL = '/admin/notifications';

const initialState: AdminNotificationState = {
    notifications: [],
    selectedNotification: null,
    statistics: null,
    pagination: null,
    loading: false,
    error: null,
    loaded: false,
    actionSuccess: false,
};

export const fetchNotifications = createAsyncThunk<
    { data: AdminNotification[]; pagination: any },
    NotificationFilters,
    { rejectValue: string }
>(
    'adminNotification/fetchNotifications',
    async (filters, { rejectWithValue }) => {
        try {
            const params: Record<string, any> = {};
            if (filters.status) params.status = filters.status;
            if (filters.notificationType) params.notificationType = filters.notificationType;
            if (filters.targetAudience) params.targetAudience = filters.targetAudience;
            if (filters.search) params.search = filters.search;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            params.page = filters.page;
            params.limit = filters.limit;

            const response = await api.get(API_URL, { params });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch notifications'
            );
        }
    }
);

export const fetchNotification = createAsyncThunk<
    AdminNotification,
    string,
    { rejectValue: string }
>(
    'adminNotification/fetchNotification',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch notification'
            );
        }
    }
);

export const createNotification = createAsyncThunk<
    AdminNotification,
    Partial<AdminNotification>,
    { rejectValue: string }
>(
    'adminNotification/createNotification',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post(API_URL, data);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create notification'
            );
        }
    }
);

export const updateNotification = createAsyncThunk<
    AdminNotification,
    { id: string; data: Partial<AdminNotification> },
    { rejectValue: string }
>(
    'adminNotification/updateNotification',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`${API_URL}/${id}`, data);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update notification'
            );
        }
    }
);

export const deleteNotification = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>(
    'adminNotification/deleteNotification',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`${API_URL}/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete notification'
            );
        }
    }
);

export const publishNotification = createAsyncThunk<
    AdminNotification,
    string,
    { rejectValue: string }
>(
    'adminNotification/publishNotification',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`${API_URL}/${id}/publish`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to publish notification'
            );
        }
    }
);

export const scheduleNotification = createAsyncThunk<
    AdminNotification,
    { id: string; scheduledAt: string },
    { rejectValue: string }
>(
    'adminNotification/scheduleNotification',
    async ({ id, scheduledAt }, { rejectWithValue }) => {
        try {
            const response = await api.post(`${API_URL}/${id}/schedule`, { scheduledAt });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to schedule notification'
            );
        }
    }
);

export const archiveNotification = createAsyncThunk<
    AdminNotification,
    string,
    { rejectValue: string }
>(
    'adminNotification/archiveNotification',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`${API_URL}/${id}/archive`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to archive notification'
            );
        }
    }
);

export const fetchNotificationStatistics = createAsyncThunk<
    NotificationStatistics,
    void,
    { rejectValue: string }
>(
    'adminNotification/fetchStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`${API_URL}/statistics`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch statistics'
            );
        }
    }
);

const handlePending = (state: AdminNotificationState) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (state: AdminNotificationState, action: { payload?: string }) => {
    state.loading = false;
    state.error = action.payload || 'An error occurred';
};

const adminNotificationSlice = createSlice({
    name: 'adminNotification',
    initialState,
    reducers: {
        clearAdminNotificationError: (state) => {
            state.error = null;
        },
        clearAdminNotificationActionSuccess: (state) => {
            state.actionSuccess = false;
        },
        clearSelectedNotification: (state) => {
            state.selectedNotification = null;
        },
        resetAdminNotificationState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, handlePending)
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.data;
                state.pagination = action.payload.pagination;
                state.loaded = true;
            })
            .addCase(fetchNotifications.rejected, handleRejected)

            .addCase(fetchNotification.pending, handlePending)
            .addCase(fetchNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedNotification = action.payload;
            })
            .addCase(fetchNotification.rejected, handleRejected)

            .addCase(createNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(createNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.actionSuccess = true;
                state.notifications.unshift(action.payload);
            })
            .addCase(createNotification.rejected, handleRejected)

            .addCase(updateNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(updateNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload;
                state.notifications = state.notifications.map((n) =>
                    n._id === updated._id ? updated : n
                );
                if (state.selectedNotification?._id === updated._id) {
                    state.selectedNotification = updated;
                }
            })
            .addCase(updateNotification.rejected, handleRejected)

            .addCase(deleteNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.actionSuccess = true;
                state.notifications = state.notifications.filter(
                    (n) => n._id !== action.payload
                );
            })
            .addCase(deleteNotification.rejected, handleRejected)

            .addCase(publishNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(publishNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload;
                state.notifications = state.notifications.map((n) =>
                    n._id === updated._id ? updated : n
                );
                if (state.selectedNotification?._id === updated._id) {
                    state.selectedNotification = updated;
                }
            })
            .addCase(publishNotification.rejected, handleRejected)

            .addCase(scheduleNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(scheduleNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload;
                state.notifications = state.notifications.map((n) =>
                    n._id === updated._id ? updated : n
                );
                if (state.selectedNotification?._id === updated._id) {
                    state.selectedNotification = updated;
                }
            })
            .addCase(scheduleNotification.rejected, handleRejected)

            .addCase(archiveNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(archiveNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.actionSuccess = true;
                const updated = action.payload;
                state.notifications = state.notifications.map((n) =>
                    n._id === updated._id ? updated : n
                );
                if (state.selectedNotification?._id === updated._id) {
                    state.selectedNotification = updated;
                }
            })
            .addCase(archiveNotification.rejected, handleRejected)

            .addCase(fetchNotificationStatistics.pending, handlePending)
            .addCase(fetchNotificationStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload;
            })
            .addCase(fetchNotificationStatistics.rejected, handleRejected);
    },
});

export const {
    clearAdminNotificationError,
    clearAdminNotificationActionSuccess,
    clearSelectedNotification,
    resetAdminNotificationState,
} = adminNotificationSlice.actions;

export default adminNotificationSlice.reducer;
