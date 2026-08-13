import { Button, CircularProgress, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import OTPInput from '../../components/OtpFild/OTPInput'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { sendLoginOtp, verifyLoginOtp, clearSellerAuthMessages } from '../../../Redux Toolkit/Seller/sellerAuthenticationSlice';
import { fetchSellerProfile } from '../../../Redux Toolkit/Seller/sellerSlice';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from '../../../services/notificationService';
import SellerPasswordLoginForm from './SellerPasswordLoginForm';

const SendOtpSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
});

const SellerLoginSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
    otp: Yup.string()
        .matches(/^\d{6}$/, 'OTP must be exactly 6 digits')
        .required('OTP is required'),
});

const SellerLoginForm = () => {

    const navigate = useNavigate();
    const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
    const [timer, setTimer] = useState<number>(30); // Timer state
    const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
    const dispatch=useAppDispatch();
    const {sellerAuth}=useAppSelector(store=>store)

    useEffect(() => {
        if (sellerAuth.otpSent) {
            notification.success("OTP sent to your email!");
        } else if (sellerAuth.error) {
            notification.error(sellerAuth.error);
            dispatch(clearSellerAuthMessages());
        }
    }, [sellerAuth.otpSent, sellerAuth.error, dispatch]);

    const formik = useFormik({
        initialValues: {
            email: '',
            otp: ''
        },
        validationSchema: sellerAuth.otpSent ? SellerLoginSchema : SendOtpSchema,

        onSubmit: async (values: any) => {
            const trimmedEmail = values.email.trim();

            if (!sellerAuth.otpSent) {
                if (sellerAuth.loading) return;

                dispatch(sendLoginOtp(trimmedEmail));
                setTimer(30);
                setIsTimerActive(true);
                return;
            }

            const result = await dispatch(verifyLoginOtp({ email: trimmedEmail, otp: values.otp }));

            if (!verifyLoginOtp.fulfilled.match(result)) return;

            const jwt = localStorage.getItem("jwt");
            if (!jwt) return;

            const profileResult = await dispatch(fetchSellerProfile(jwt));

            if (fetchSellerProfile.fulfilled.match(profileResult)) {
                navigate("/seller");
            }
        }
    });

    const handleOtpChange = (otp: any) => {

        formik.setFieldValue('otp', otp || '');

    };

    const handleResendOtp = async () => {
        if (sellerAuth.loading) return;

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
        dispatch(sendLoginOtp(trimmedEmail));
        setTimer(30);
        setIsTimerActive(true);
    };

    const handleSentOtp=()=>{
        formik.handleSubmit()
    }

    const handleLogin=()=>{
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
            {loginMethod === 'otp' ? (
                <div>
                    <h1 className='text-center font-bold text-xl text-primary-color pb-5'>Login As Seller</h1>
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

                        {sellerAuth.otpSent && <div className="space-y-2">
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

                        {sellerAuth.otpSent &&<div>
                            <Button onClick={handleLogin}
                            disabled={sellerAuth.loading}
                            fullWidth variant='contained' sx={{ py: "11px" }}>{
                                sellerAuth.loading ? <CircularProgress  /> : "Login"}</Button>
                        </div>}

                        {!sellerAuth.otpSent && <Button
                        disabled={sellerAuth.loading} 
                        fullWidth 
                        variant='contained' 
                        onClick={handleSentOtp}
                        sx={{ py: "11px" }}>{
                            sellerAuth.loading ? <CircularProgress  />: "sent otp"}</Button>
                        }

                    </form>
                </div>
            ) : (
                <SellerPasswordLoginForm />
            )}

            <div className='flex flex-col items-center gap-2 justify-center mt-5'>
                {loginMethod === 'otp' ? (
                    <p className="text-sm">
                        Want to use a password?{" "}
                        <span onClick={() => setLoginMethod('password')} className="text-teal-600 cursor-pointer hover:text-teal-800 font-semibold">
                            Login with password
                        </span>
                    </p>
                ) : (
                    <>
                        <p className="text-sm">
                            Prefer OTP?{" "}
                            <span onClick={() => setLoginMethod('otp')} className="text-teal-600 cursor-pointer hover:text-teal-800 font-semibold">
                                Login with OTP
                            </span>
                        </p>
                        <Link to="/seller/forgot-password" className="text-teal-600 hover:text-teal-800 font-semibold text-sm">
                            Forgot password?
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}

export default SellerLoginForm
