import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
import { SellerCategoryRequestState, CategoryRequest, CreateCategoryRequestPayload } from "../../types/categoryRequestTypes";

interface RequestsResponse {
    success: boolean;
    data: CategoryRequest[];
}

interface SingleRequestResponse {
    success: boolean;
    data: CategoryRequest;
}

export const createRequest = createAsyncThunk<
    CategoryRequest,
    CreateCategoryRequestPayload,
    { rejectValue: string }
>(
    "sellerCategoryRequest/createRequest",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post<SingleRequestResponse>(
                "/seller/category-requests",
                payload
            );
            return data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to submit request."
            );
        }
    }
);

export const fetchMyRequests = createAsyncThunk<
    CategoryRequest[],
    void,
    { rejectValue: string }
>(
    "sellerCategoryRequest/fetchMyRequests",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get<RequestsResponse>(
                "/seller/category-requests"
            );
            return data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch your requests."
            );
        }
    }
);

const initialState: SellerCategoryRequestState = {
    requests: [],
    loading: false,
    error: null,
    requestsLoaded: false,
};

const sellerCategoryRequestSlice = createSlice({
    name: "sellerCategoryRequest",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createRequest.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to submit request.";
            })
            .addCase(fetchMyRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
                state.requestsLoaded = true;
            })
            .addCase(fetchMyRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch requests.";
            });
    },
});

export const { clearError } = sellerCategoryRequestSlice.actions;
export default sellerCategoryRequestSlice.reducer;
