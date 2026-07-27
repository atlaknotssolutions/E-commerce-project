import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import { Seller } from '../../types/sellerTypes';
import axios from 'axios';

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
        data: { email: string; otp: string; navigate: any },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/sellers/verify/login-top', data);

            console.log("login seller success - ", response.data);

            localStorage.setItem("jwt", response.data.jwt);

            data.navigate("/seller");

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
            });
    },
});

export const { resetSellerAuthState } = sellerAuthSlice.actions;

export default sellerAuthSlice.reducer;
