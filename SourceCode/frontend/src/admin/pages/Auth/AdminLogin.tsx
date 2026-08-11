import { Button, CircularProgress, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { useNavigate } from 'react-router-dom';
import { clearAuthError, sendLoginSignupOtp, signin } from '../../../Redux Toolkit/Customer/AuthSlice';
import { fetchUserProfile } from '../../../Redux Toolkit/Customer/UserSlice';
import OTPInput from '../../../customer/components/OtpFild/OTPInput';
import { notification } from '../../../services/notificationService';

const SendOtpSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
});

const AdminLoginSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
    otp: Yup.string()
        .matches(/^\d{6}$/, 'OTP must be exactly 6 digits')
        .required('OTP is required'),
});

const AdminLoginForm = () => {

    const navigate = useNavigate();
    const [timer, setTimer] = useState<number>(30); // Timer state
    const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const { auth } = useAppSelector(store => store)

    useEffect(() => {
        if (auth.otpSent) {
            notification.success("OTP sent to your email!");
        } else if (auth.error) {
            notification.error(auth.error);
            dispatch(clearAuthError());
        }
    }, [auth.otpSent, auth.error, dispatch]);

    const formik = useFormik({
        initialValues: {
            email: '',
            otp: ''
        },
        validationSchema: auth.otpSent ? AdminLoginSchema : SendOtpSchema,

        onSubmit: async (values: any) => {
            const trimmedEmail = values.email.trim();

            if (!auth.otpSent) {
                if (auth.loading) return;

                dispatch(sendLoginSignupOtp({ email: trimmedEmail, purpose: 'login' }));
                setTimer(30);
                setIsTimerActive(true);
                return;
            }

            const loginResult = await dispatch(signin({ email: trimmedEmail, otp: values.otp }));

            if (!signin.fulfilled.match(loginResult)) return;

            const jwt = localStorage.getItem("jwt");
            if (!jwt) return;

            const profileResult = await dispatch(fetchUserProfile({ jwt }));

            if (fetchUserProfile.fulfilled.match(profileResult)) {
                if (profileResult.payload.role === "ROLE_ADMIN") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/");
                }
            }
        }
    });

    const handleOtpChange = (otp: any) => {
        formik.setFieldValue('otp', otp || '');
    };

    const handleResendOtp = async () => {
        if (auth.loading) return;

        const trimmedEmail = formik.values.email.trim();

        let emailError: string | undefined;
        try {
            await SendOtpSchema.validate({ email: trimmedEmail });
        } catch (err: any) {
            emailError = err.errors?.[0] || err.message || 'Please enter a valid email address.';
        }

        if (emailError) {
            formik.setFieldError('email', emailError);
            formik.setFieldTouched('email', true, false);
            return;
        }

        formik.setFieldError('email', undefined);
        dispatch(sendLoginSignupOtp({ email: trimmedEmail, purpose: 'login' }));
        setTimer(30);
        setIsTimerActive(true);
    };

    const handleSentOtp = () => {
        formik.handleSubmit()
    }

    const handleLogin = () => {
        formik.handleSubmit()
    }

  

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        if (isTimerActive) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setIsTimerActive(false);
                        return 30; // Reset timer for next OTP request
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerActive]);



    return (
        <div>
            <h1 className='text-center font-bold text-xl text-primary-color pb-8'>Admin Login</h1>
            <form className="space-y-5">

                <TextField
                    fullWidth
                    name="email"
                    label="Enter Your Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email ? formik.errors.email as string : undefined}
                />

                {auth.otpSent && <div className="space-y-2">
                    <p className="font-medium text-sm">
                        * Enter OTP sent to your email
                    </p>
                    <OTPInput
                        length={6}
                        onChange={handleOtpChange}
                        error={Boolean(formik.touched.otp && formik.errors.otp)}
                    />
                    <p className="text-xs space-x-2">
                        {isTimerActive ? (
                            <span>Resend OTP in {timer} seconds</span>
                        ) : (
                            <>
                                Didn’t receive OTP?{" "}
                                <span
                                    onClick={handleResendOtp}
                                    className="text-teal-600 cursor-pointer hover:text-teal-800 font-semibold"
                                >
                                    Resend OTP
                                </span>
                            </>
                        )}
                    </p>
                    {formik.touched.otp && formik.errors.otp && <p className="text-sm text-red-500">{formik.errors.otp as string}</p>}
                </div>}

                {auth.otpSent && <div>
                    <Button disabled={auth.loading} onClick={handleLogin}
                        fullWidth variant='contained' sx={{ py: "11px" }}>{
                            auth.loading ? <CircularProgress  />: "Login"}</Button>
                </div>}

                {!auth.otpSent && <Button
                disabled={auth.loading}
                    fullWidth
                    variant='contained'
                    onClick={handleSentOtp}
                    sx={{ py: "11px" }}>{
                        auth.loading ? <CircularProgress  />: "sent otp"}</Button>
                }



            </form>

         
        </div>
    )
}

export default AdminLoginForm
