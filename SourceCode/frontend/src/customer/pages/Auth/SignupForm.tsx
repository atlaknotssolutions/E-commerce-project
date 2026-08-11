import { Button, CircularProgress, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import OTPInput from '../../components/OtpFild/OTPInput'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { useNavigate } from 'react-router-dom';
import { sendLoginSignupOtp, signup } from '../../../Redux Toolkit/Customer/AuthSlice';
import { fetchUserProfile } from '../../../Redux Toolkit/Customer/UserSlice';

const SendOtpSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
});

const SignupSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
    otp: Yup.string()
        .matches(/^\d{6}$/, 'OTP must be exactly 6 digits')
        .required('OTP is required'),
    name: Yup.string().trim().required('Name is required'),
    mobile: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number')
        .required('Mobile number is required'),
});

const SignupForm = () =>
{
    const navigate = useNavigate();
    const [timer, setTimer] = useState<number>(30); // Timer state
    const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const { auth } = useAppSelector(store => store)

    const formik = useFormik({
        initialValues: {
            email: '',
            otp: '',
            name: "",
            mobile: "",
        },
        validationSchema: auth.otpSent ? SignupSchema : SendOtpSchema,

        onSubmit: async (values: any) =>
        {
            const trimmedEmail = values.email.trim();

            if (!auth.otpSent)
            {
                if (auth.loading) return;

                dispatch(sendLoginSignupOtp({ email: trimmedEmail, purpose: 'signup' }));
                setTimer(30);
                setIsTimerActive(true);
                return;
            }

            const result = await dispatch(
                signup({
                    fullName: values.name,
                    email: trimmedEmail,
                    mobile: values.mobile,
                    otp: values.otp,
                })
            );

            if (signup.fulfilled.match(result))
            {
                const jwt = localStorage.getItem("jwt");
                if (!jwt) return;

                const profileResult = await dispatch(fetchUserProfile({ jwt }));

                if (fetchUserProfile.fulfilled.match(profileResult))
                {
                    navigate("/", { replace: true });
                }
            }
        }
    });

    const handleOtpChange = (otp: any) =>
    {
        formik.setFieldValue('otp', otp || '');
    };

    const handleResendOtp = async () =>
    {
        if (auth.loading) return;

        const trimmedEmail = formik.values.email.trim();

        let emailError: string | undefined;
        try
        {
            await SendOtpSchema.validate({ email: trimmedEmail });
        } catch (err: any)
        {
            emailError = err.errors?.[0] || err.message || 'Please enter a valid email address.';
        }

        if (emailError)
        {
            formik.setFieldError('email', emailError);
            formik.setFieldTouched('email', true, false);
            return;
        }

        formik.setFieldError('email', undefined);
        dispatch(sendLoginSignupOtp({ email: trimmedEmail, purpose: 'signup' }));
        setTimer(30);
        setIsTimerActive(true);
    };

    const handleSentOtp = () =>
    {
        formik.handleSubmit()
    }

    const handleLogin = async () =>
    {
        await formik.submitForm();
    }

    useEffect(() =>
    {
        let interval: NodeJS.Timeout | undefined;

        if (isTimerActive)
        {
            interval = setInterval(() =>
            {
                setTimer(prev =>
                {
                    if (prev === 1)
                    {
                        clearInterval(interval);
                        setIsTimerActive(false);
                        return 30; // Reset timer for next OTP request
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () =>
        {
            if (interval) clearInterval(interval);
        };
    }, [isTimerActive]);

    return (
        <div>
            <h1 className='text-center font-bold text-xl text-primary-color pb-5'>Signup</h1>
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

                {auth.otpSent && <TextField
                    fullWidth
                    name="name"
                    label="Enter Your Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name ? formik.errors.name as string : undefined}
                />}

                {auth.otpSent && (
                    <TextField
                        fullWidth
                        name="mobile"
                        label="Enter Mobile Number"
                        value={formik.values.mobile}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                        helperText={
                            formik.touched.mobile
                                ? (formik.errors.mobile as string)
                                : undefined
                        }
                    />
                )}

                {auth.otpSent && <div>
                    <Button
                        disabled={auth.loading}
                        onClick={handleLogin}
                        fullWidth variant='contained' sx={{ py: "11px" }}> {auth.loading ? <CircularProgress size="small"
                            sx={{ width: "27px", height: "27px" }} /> : " Signup "}  </Button>
                </div>}

                {!auth.otpSent && <Button
                    fullWidth
                    variant='contained'
                    onClick={handleSentOtp}
                    disabled={auth.loading}
                    sx={{ py: "11px" }}>
                    {auth.loading ? <CircularProgress size="small"
                        sx={{ width: "27px", height: "27px" }} /> : "sent otp"}

                </Button>
                }



            </form>


        </div>
    )
}

export default SignupForm
