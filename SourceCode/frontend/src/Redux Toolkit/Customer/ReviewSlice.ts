import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  ApiResponse,
  CreateReviewRequest,
  Review,
  ReviewState,
} from "../../types/reviewTypes";
import { api } from "../../Config/Api";

const API_URL = "/api";

// Async thunks
export const fetchReviewsByProductId = createAsyncThunk<
  Review[],
  { productId: string },
  { rejectValue: string }
>(
  "review/fetchReviewsByProductId",
  async ({ productId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `${API_URL}/products/${productId}/reviews`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch reviews");
    }
  }
);

export const createReview = createAsyncThunk<
  Review,
  { productId: string; review: CreateReviewRequest },
  { rejectValue: string }
>(
  "review/createReview",
  async ({ productId, review }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${API_URL}/products/${productId}/reviews`,
        review
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create review");
    }
  }
);

export const updateReview = createAsyncThunk<
  Review,
  { reviewId: string; review: CreateReviewRequest },
  { rejectValue: string }
>(
  "review/updateReview",
  async ({ reviewId, review }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `${API_URL}/reviews/${reviewId}`,
        review
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update review");
    }
  }
);

export const deleteReview = createAsyncThunk<
  ApiResponse,
  { reviewId: string },
  { rejectValue: string }
>("review/deleteReview", async ({ reviewId }, { rejectWithValue }) => {
  try {
    const response = await api.delete(`${API_URL}/reviews/${reviewId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete review");
  }
});

export const fetchMyReviews = createAsyncThunk<
  Review[],
  void,
  { rejectValue: string }
>(
  "review/fetchMyReviews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/reviews/my`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch your reviews");
    }
  }
);

// Initial state
const initialState: ReviewState = {
  reviews: [],
  myReviews: [],
  fetchLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  uploadLoading: false,
  error: null,
  reviewCreated: false,
  reviewUpdated: false,
  reviewDeleted: false,
};

// Slice
const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    resetReviewState: (state) => {
      state.reviews = [];
      state.myReviews = [];
      state.fetchLoading = false;
      state.createLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.uploadLoading = false;
      state.error = null;
      state.reviewCreated = false;
      state.reviewUpdated = false;
      state.reviewDeleted = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUploadLoading: (state, action: PayloadAction<boolean>) => {
      state.uploadLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByProductId.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(
        fetchReviewsByProductId.fulfilled,
        (state, action: PayloadAction<Review[]>) => {
          state.reviews = action.payload;
          state.fetchLoading = false;
        }
      )
      .addCase(fetchReviewsByProductId.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createReview.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.reviewCreated = false;
      })
      .addCase(createReview.fulfilled, (state) => {
        state.createLoading = false;
        state.reviewCreated = true;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
        state.reviewCreated = false;
      })
      .addCase(updateReview.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.reviewUpdated = false;
      })
      .addCase(
        updateReview.fulfilled,
        (state, action: PayloadAction<Review>) => {
          const index = state.reviews.findIndex(
            (r) => r.id === action.payload.id
          );
          if (index !== -1) {
            state.reviews[index] = action.payload;
          }
          state.updateLoading = false;
          state.reviewUpdated = true;
        }
      )
      .addCase(updateReview.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
        state.reviewUpdated = false;
      })
      .addCase(deleteReview.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
        state.reviewDeleted = false;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(
          (r) => r.id !== action.meta.arg.reviewId
        );
        state.deleteLoading = false;
        state.reviewDeleted = true;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload as string;
        state.reviewDeleted = false;
      })
      .addCase(fetchMyReviews.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(
        fetchMyReviews.fulfilled,
        (state, action: PayloadAction<Review[]>) => {
          state.myReviews = action.payload;
          state.fetchLoading = false;
        }
      )
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default reviewSlice.reducer;
export const { resetReviewState, clearError, setUploadLoading } = reviewSlice.actions;

