import { Button, CircularProgress, TextField } from '@mui/material'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword, clearSellerAuthMessages } from '../../../Redux Toolkit/Seller/sellerAuthenticationSlice';
import { notification } from '../../../services/notificationService';

const ResetPasswordSchema = Yup.object({
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters.')
        .max(72, 'Password must be at most 72 characters.')
        .test('not-whitespace', 'Password cannot be empty or only spaces.', value => typeof value === 'string' && value.trim().length > 0)
        .required('Password is required.'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match.')
        .required('Please confirm your password.'),
});

const SellerResetPassword = () =>
{
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { sellerAuth } = useAppSelector(store => store)
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validationSchema: ResetPasswordSchema,

        onSubmit: async (values: any) =>
        {
            if (!token) return;

            const result = await dispatch(
                resetPassword({ token, password: values.password })
            );

            if (resetPassword.fulfilled.match(result))
            {
                notification.success(result.payload?.message || 'Your password has been successfully reset.');
                navigate('/become-seller', { replace: true });
            } else
            {
                notification.error((result.payload as string) || 'Something went wrong. Please try again.');
                dispatch(clearSellerAuthMessages());
            }
        }
    });

    if (!token)
    {
        return (
            <div className='flex justify-center h-[90vh] items-center'>
                <div className='max-w-md w-full rounded-md border shadow-lg p-10 text-center space-y-4'>
                    <h1 className='text-xl font-bold text-primary-color'>Invalid Reset Link</h1>
                    <p className="text-sm text-gray-700">
                        This password reset link is invalid or missing. Please request a new link.
                    </p>
                    <Link to="/seller/forgot-password" className="block text-teal-600 hover:text-teal-800 font-semibold text-sm">
                        Request a new reset link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='flex justify-center h-[90vh] items-center'>
            <div className='max-w-md w-full rounded-md border shadow-lg p-10'>
                <h1 className='text-center font-bold text-xl text-primary-color pb-3'>Reset Password</h1>
                <p className="text-sm text-gray-700 pb-5">
                    Enter a new password for your seller account.
                </p>
                <form className="space-y-5">

                    <TextField
                        fullWidth
                        type="password"
                        name="password"
                        label="New Password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password ? formik.errors.password as string : undefined}
                    />

                    <TextField
                        fullWidth
                        type="password"
                        name="confirmPassword"
                        label="Confirm New Password"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                        helperText={formik.touched.confirmPassword ? formik.errors.confirmPassword as string : undefined}
                    />

                    <div>
                        <Button
                            disabled={sellerAuth.loading}
                            onClick={() => formik.handleSubmit()}
                            fullWidth
                            variant='contained'
                            sx={{ py: "11px" }}>
                            {sellerAuth.loading ? <CircularProgress size="small"
                                sx={{ width: "27px", height: "27px" }} /> : "Reset Password"}
                        </Button>
                    </div>
                </form>

                <div className='flex items-center justify-center mt-5'>
                    <Link to="/become-seller" className="text-teal-600 hover:text-teal-800 font-semibold text-sm">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default SellerResetPassword
