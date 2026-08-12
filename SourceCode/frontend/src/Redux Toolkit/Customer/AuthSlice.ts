// src/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import
    {
        AuthResponse,
        LoginRequest,
        SignupRequest,
        ResetPasswordRequest,
        PasswordLoginRequest,
        PasswordChangeRequest,
        ApiErrorPayload,
        ApiResponse,
        AuthState,
    } from '../../types/authTypes';
import { api } from '../../Config/Api';
import { RootState } from '../Store';
import { resetUserState } from './UserSlice';
import { resetCartState } from './CartSlice';
import { resetWishlistState } from './WishlistSlice';
import { resetSellerState } from '../Seller/sellerSlice';
import { resetSellerAuthState } from '../Seller/sellerAuthenticationSlice';
import { resetSellerDashboard } from '../Seller/sellerDashboardSlice';
import { resetWalletState } from '../Seller/walletSlice';
import { resetPayoutState } from '../Seller/payoutSlice';


const initialState: AuthState = {
    jwt: localStorage.getItem("jwt"),
    role: null,
    loading: false,
    error: null,
    otpSent: false
};

// Define the base URL for the API
const API_URL = '/auth';

export const sendLoginSignupOtp = createAsyncThunk<ApiResponse, { email: string; purpose?: 'login' | 'signup' }>(
    'auth/sendLoginSignupOtp',
    async ({ email, purpose }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.post(`${API_URL}/sent/login-signup-otp`, { email, purpose });
            console.log("otp sent successfully", response.data);
            return response.data;
        } catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || "Failed to send OTP"
            );
        }
    }
);

export const signup = createAsyncThunk<AuthResponse, SignupRequest>(
    'auth/signup',
    async (signupRequest, { rejectWithValue }) =>
    {
        console.log("signup ", signupRequest)
        try
        {

            const response = await api.post<AuthResponse>(`${API_URL}/signup`, signupRequest);
            //    signupRequest.navigate("/")
            localStorage.setItem("jwt", response.data.jwt)
            return response.data;
        } catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Signup failed'
            );
        }
    }
);

export const signin = createAsyncThunk<AuthResponse, LoginRequest>(
    'auth/signin',
    async (loginRequest, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.post<AuthResponse>(`${API_URL}/signin`, loginRequest);
            console.log("login successful", response.data)
            localStorage.setItem("jwt", response.data.jwt)
            return response.data;
        } catch (error: any)
        {
            console.log("error ", error.response)
            return rejectWithValue(
                error.response?.data?.message || 'Signin failed'
            );
        }
    }
);

export const resetPassword = createAsyncThunk<ApiResponse, ResetPasswordRequest>(
    'auth/resetPassword',
    async (resetPasswordRequest, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.post<ApiResponse>(`${API_URL}/reset-password`, resetPasswordRequest);
            return response.data;
        } catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Reset password failed'
            );
        }
    }
);

export const resetPasswordRequest = createAsyncThunk<ApiResponse, { email: string }>(
    'auth/resetPasswordRequest',
    async ({ email }, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.post<ApiResponse>(`${API_URL}/reset-password-request`, { email });
            return response.data;
        } catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Reset password request failed'
            );
        }
    }
);

export const signinWithPassword = createAsyncThunk<AuthResponse, PasswordLoginRequest>(
    'auth/signinWithPassword',
    async (loginRequest, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.post<AuthResponse>(`${API_URL}/password-login`, loginRequest);
            localStorage.setItem("jwt", response.data.jwt);
            return response.data;
        } catch (error: any)
        {
            return rejectWithValue(
                error.response?.data?.message || 'Signin failed'
            );
        }
    }
);

export const setPassword = createAsyncThunk<ApiResponse, PasswordChangeRequest, { rejectValue: ApiErrorPayload }>(
    'auth/setPassword',
    async (passwordRequest, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.post<ApiResponse>(`${API_URL}/password`, passwordRequest);
            return response.data;
        } catch (error: any)
        {
            return rejectWithValue(
                error.response?.data as ApiErrorPayload
            );
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) =>
        {
            state.jwt = null;
            state.role = null;
            localStorage.clear()
        },
        clearOtpSent: (state) => {
            state.otpSent = false;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) =>
    {
        builder
            .addCase(sendLoginSignupOtp.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendLoginSignupOtp.fulfilled, (state) =>
            {
                state.loading = false;
                state.otpSent = true;
            })
            .addCase(sendLoginSignupOtp.rejected, (state, action) =>
            {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(signup.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action: PayloadAction<AuthResponse>) =>
            {
                state.jwt = action.payload.jwt;
                state.role = action.payload.role;
                state.loading = false;
                state.otpSent = false;
            })
            .addCase(signup.rejected, (state, action) =>
            {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(signin.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
            })
            .addCase(signin.fulfilled, (state, action: PayloadAction<AuthResponse>) =>
            {
                state.jwt = action.payload.jwt;
                state.role = action.payload.role;
                state.loading = false;
                state.otpSent = false;
            })
            .addCase(signin.rejected, (state, action) =>
            {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(resetPassword.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) =>
            {
                state.loading = false;
            })
            .addCase(resetPassword.rejected, (state, action) =>
            {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(resetPasswordRequest.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPasswordRequest.fulfilled, (state) =>
            {
                state.loading = false;
            })
            .addCase(resetPasswordRequest.rejected, (state, action) =>
            {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(signinWithPassword.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
            })
            .addCase(signinWithPassword.fulfilled, (state, action: PayloadAction<AuthResponse>) =>
            {
                state.jwt = action.payload.jwt;
                state.role = action.payload.role;
                state.loading = false;
                state.otpSent = false;
            })
            .addCase(signinWithPassword.rejected, (state, action) =>
            {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(setPassword.pending, (state) =>
            {
                state.loading = true;
                state.error = null;
            })
            .addCase(setPassword.fulfilled, (state) =>
            {
                state.loading = false;
            })
            .addCase(setPassword.rejected, (state, action) =>
            {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update password';
            });
    },
});

export const { logout, clearOtpSent, clearAuthError } = authSlice.actions;

export default authSlice.reducer;



export const performLogout = () => async (dispatch: any) =>
{
    dispatch(logout());
    dispatch(resetUserState());
    dispatch(resetCartState());
    dispatch(resetWishlistState());
    dispatch(resetSellerState());
    dispatch(resetSellerAuthState());
    dispatch(resetSellerDashboard());
    dispatch(resetWalletState());
    dispatch(resetPayoutState());
};

export const selectAuth = (state: RootState) => state.auth;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
