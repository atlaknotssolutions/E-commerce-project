import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import { Seller } from '../../types/sellerTypes';
import axios from 'axios';
import {
    ApiResponse,
    PasswordChangeRequest,
    ApiErrorPayload,
} from '../../types/authTypes';

// ===========================================
// Types
// ===========================================

interface SellerAuthState {
    otpSent: boolean;
    error: string | null;
    loading: boolean;
    jwt: string | null;
    sellerCreated: string | null;
}

interface CreateSellerResponse {
    success: boolean;
    message: string;
    seller: Seller;
}

const initialState: SellerAuthState = {
    otpSent: false,
    error: null,
    loading: false,
    jwt: null,
    sellerCreated: null,
};

const API_URL = '/sellers';

// ===========================================
// Send Login OTP
// ===========================================

export const sendLoginOtp = createAsyncThunk(
    'otp/sendLoginOtp',
    async (email: string, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/sellers/sent/login-top', { email });

            console.log("otp sent - ", email, data);

            return { email };
        } catch (error: any) {
            console.log("error", error);

            return rejectWithValue(
                error.response?.data?.message || 'Failed to send OTP'
            );
        }
    }
);

// ===========================================
// Verify Login OTP
// ===========================================

export const verifyLoginOtp = createAsyncThunk(
    'otp/verifyLoginOtp',
    async (
        data: { email: string; otp: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/sellers/verify/login-top', data);

            console.log("login seller success - ", response.data);

            localStorage.setItem("jwt", response.data.jwt);

            return response.data;
        } catch (error: any) {
            console.log("error", error.response?.data);

            return rejectWithValue(
                error.response?.data?.message || 'Failed to verify OTP'
            );
        }
    }
);

// ===========================================
// Create Seller
// ===========================================

export const createSeller = createAsyncThunk<
    CreateSellerResponse,
    Seller
>(
    'sellers/createSeller',
    async (seller: Seller, { rejectWithValue }) => {
        try {
            const response = await api.post<CreateSellerResponse>(
                API_URL,
                seller
            );

            console.log('create seller', response.data);

            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Create seller error:', error.response.data);

                return rejectWithValue(
                    error.response.data?.message ||
                    'Failed to create seller'
                );
            }

            return rejectWithValue('Failed to create seller');
        }
    }
);

// ===========================================
// Seller Password Login
// ===========================================

export const signinWithPassword = createAsyncThunk<
    { jwt: string; message: string; role: string },
    { email: string; password: string }
>(
    'sellerAuth/signinWithPassword',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/sellers/password-login', data);

            localStorage.setItem("jwt", response.data.jwt);

            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Invalid email or password.'
            );
        }
    }
);

// ===========================================
// Seller Set / Change Password
// ===========================================

export const setPassword = createAsyncThunk<
    ApiResponse,
    PasswordChangeRequest,
    { rejectValue: ApiErrorPayload }
>(
    'sellerAuth/setPassword',
    async (passwordRequest, { rejectWithValue }) => {
        try {
            const response = await api.post<ApiResponse>(
                '/sellers/password',
                passwordRequest
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data as ApiErrorPayload
            );
        }
    }
);

// ===========================================
// Seller Password Reset Request
// ===========================================

export const resetPasswordRequest = createAsyncThunk<
    ApiResponse,
    { email: string }
>(
    'sellerAuth/resetPasswordRequest',
    async ({ email }, { rejectWithValue }) => {
        try {
            const response = await api.post<ApiResponse>(
                '/sellers/reset-password-request',
                { email }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Failed to request password reset.'
            );
        }
    }
);

// ===========================================
// Seller Password Reset Execute
// ===========================================

export const resetPassword = createAsyncThunk<
    ApiResponse,
    { token: string; password: string }
>(
    'sellerAuth/resetPassword',
    async ({ token, password }, { rejectWithValue }) => {
        try {
            const response = await api.post<ApiResponse>(
                '/sellers/reset-password',
                { token, password }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Failed to reset password.'
            );
        }
    }
);

// ===========================================
// Slice
// ===========================================

const sellerAuthSlice = createSlice({
    name: 'sellerAuth',

    initialState,

    reducers: {
        resetSellerAuthState: (state) => {
            state.otpSent = false;
            state.error = null;
            state.loading = false;
            state.jwt = null;
            state.sellerCreated = null;
        },
        clearSellerAuthMessages: (state) => {
            state.sellerCreated = null;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // ==============================
            // Send Login OTP
            // ==============================

            .addCase(sendLoginOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(sendLoginOtp.fulfilled, (state) => {
                state.loading = false;
                state.otpSent = true;
                state.error = null;
            })

            .addCase(sendLoginOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // ==============================
            // Verify Login OTP
            // ==============================

            .addCase(verifyLoginOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(verifyLoginOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.jwt = action.payload.jwt;
                state.otpSent = false;
                state.error = null;
            })

            .addCase(verifyLoginOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // ==============================
            // Create Seller
            // ==============================

            .addCase(createSeller.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.sellerCreated = null;
            })

            .addCase(
                createSeller.fulfilled,
                (
                    state,
                    action: PayloadAction<CreateSellerResponse>
                ) => {
                    state.loading = false;
                    state.error = null;

                    // Backend message
                    state.sellerCreated = action.payload.message;
                }
            )

            .addCase(createSeller.rejected, (state, action) => {
                state.loading = false;
                state.sellerCreated = null;

                state.error =
                    (action.payload as string) ||
                    'Failed to create seller';
            })

            // ==============================
            // Seller Password Login
            // ==============================

            .addCase(signinWithPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(signinWithPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.jwt = action.payload.jwt;
                state.error = null;
            })

            .addCase(signinWithPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // ==============================
            // Seller Set / Change Password
            // ==============================

            .addCase(setPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(setPassword.fulfilled, (state) => {
                state.loading = false;
            })

            .addCase(setPassword.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload?.message || 'Failed to update password.';
            })

            // ==============================
            // Seller Password Reset Request
            // ==============================

            .addCase(resetPasswordRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(resetPasswordRequest.fulfilled, (state) => {
                state.loading = false;
            })

            .addCase(resetPasswordRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // ==============================
            // Seller Password Reset Execute
            // ==============================

            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
            })

            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetSellerAuthState, clearSellerAuthMessages } = sellerAuthSlice.actions;

export default sellerAuthSlice.reducer;
