import { Button, CircularProgress, TextField } from '@mui/material'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { Link } from 'react-router-dom';
import { resetPasswordRequest, clearSellerAuthMessages } from '../../../Redux Toolkit/Seller/sellerAuthenticationSlice';
import { notification } from '../../../services/notificationService';
import { useState } from 'react';

const ForgotPasswordSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
});

const SellerForgotPassword = () =>
{
    const dispatch = useAppDispatch();
    const { sellerAuth } = useAppSelector(store => store)
    const [submitted, setSubmitted] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: ForgotPasswordSchema,

        onSubmit: async (values: any) =>
        {
            const result = await dispatch(
                resetPasswordRequest({ email: values.email.trim() })
            );

            if (resetPasswordRequest.fulfilled.match(result))
            {
                setSubmitted(true);
            } else
            {
                notification.error((result.payload as string) || 'Something went wrong. Please try again.');
                dispatch(clearSellerAuthMessages());
            }
        }
    });

    return (
        <div className='flex justify-center h-[90vh] items-center'>
            <div className='max-w-md w-full rounded-md border shadow-lg p-10'>
                <h1 className='text-center font-bold text-xl text-primary-color pb-3'>Forgot Password</h1>

                {submitted ? (
                    <div className="space-y-5">
                        <p className="text-sm text-gray-700 text-center">
                            If an account exists for this email address, a password reset link has been sent.
                        </p>
                        <Link to="/become-seller" className="block text-center text-teal-600 hover:text-teal-800 font-semibold text-sm">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-700 pb-5">
                            Enter the email address associated with your seller account and we'll send you a password reset link.
                        </p>
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

                            <div>
                                <Button
                                    disabled={sellerAuth.loading}
                                    onClick={() => formik.handleSubmit()}
                                    fullWidth
                                    variant='contained'
                                    sx={{ py: "11px" }}>
                                    {sellerAuth.loading ? <CircularProgress size="small"
                                        sx={{ width: "27px", height: "27px" }} /> : "Send Reset Link"}
                                </Button>
                            </div>
                        </form>

                        <div className='flex items-center justify-center mt-5'>
                            <Link to="/become-seller" className="text-teal-600 hover:text-teal-800 font-semibold text-sm">
                                Back to Login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default SellerForgotPassword
