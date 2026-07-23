import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
import { AdminCategoryRequestState, CategoryRequest } from "../../types/categoryRequestTypes";
import { fetchCategoryTree } from "./AdminCategorySlice";

interface RequestsResponse {
    success: boolean;
    data: CategoryRequest[];
}

interface SingleRequestResponse {
    success: boolean;
    data: CategoryRequest;
}

export const fetchAllRequests = createAsyncThunk<
    CategoryRequest[],
    { status?: string; search?: string } | void,
    { rejectValue: string }
>(
    "adminCategoryRequest/fetchAllRequests",
    async (params, { rejectWithValue }) => {
        try {
            const queryParams = params ? `?${new URLSearchParams(
                Object.entries(params).filter(([_, v]) => v)
            ).toString()}` : '';
            const { data } = await api.get<RequestsResponse>(
                `/admin/category-requests${queryParams}`
            );
            return data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch requests."
            );
        }
    }
);

export const approveRequest = createAsyncThunk<
    CategoryRequest,
    string,
    { rejectValue: string }
>(
    "adminCategoryRequest/approveRequest",
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const { data } = await api.patch<SingleRequestResponse>(
                `/admin/category-requests/${id}/approve`
            );
            dispatch(fetchAllRequests());
            dispatch(fetchCategoryTree());
            return data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to approve request."
            );
        }
    }
);

export const rejectRequest = createAsyncThunk<
    CategoryRequest,
    { id: string; rejectionReason: string },
    { rejectValue: string }
>(
    "adminCategoryRequest/rejectRequest",
    async ({ id, rejectionReason }, { dispatch, rejectWithValue }) => {
        try {
            const { data } = await api.patch<SingleRequestResponse>(
                `/admin/category-requests/${id}/reject`,
                { rejectionReason }
            );
            dispatch(fetchAllRequests());
            return data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to reject request."
            );
        }
    }
);

const initialState: AdminCategoryRequestState = {
    requests: [],
    loading: false,
    error: null,
};

const adminCategoryRequestSlice = createSlice({
    name: "adminCategoryRequest",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(fetchAllRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Something went wrong.";
            })
            .addCase(approveRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveRequest.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(approveRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to approve.";
            })
            .addCase(rejectRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectRequest.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(rejectRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to reject.";
            });
    },
});

export const { clearError } = adminCategoryRequestSlice.actions;
export default adminCategoryRequestSlice.reducer;
