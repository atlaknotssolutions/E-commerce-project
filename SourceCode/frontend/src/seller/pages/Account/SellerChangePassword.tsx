import { Button, CircularProgress, TextField } from '@mui/material'
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { setPassword } from '../../../Redux Toolkit/Seller/sellerAuthenticationSlice';
import { notification } from '../../../services/notificationService';

const passwordShape = Yup.string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password must be at most 72 characters.')
    .test('not-whitespace', 'Password cannot be empty or only spaces.', value => typeof value === 'string' && value.trim().length > 0)
    .required('Password is required.');

const ChangePasswordSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required.'),
    password: passwordShape,
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match.')
        .required('Please confirm your password.'),
});

const SetPasswordSchema = Yup.object({
    password: passwordShape,
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match.')
        .required('Please confirm your password.'),
});

interface SellerChangePasswordProps {
    onClose?: () => void;
}

const SellerChangePassword = ({ onClose }: SellerChangePasswordProps) =>
{
    const dispatch = useAppDispatch();
    const { sellerAuth } = useAppSelector(store => store)
    const [needsCurrentPassword, setNeedsCurrentPassword] = useState(false);

    const formik = useFormik({
        initialValues: {
            currentPassword: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: needsCurrentPassword ? ChangePasswordSchema : SetPasswordSchema,

        onSubmit: async (values: any) =>
        {
            const result = await dispatch(
                setPassword(
                    needsCurrentPassword
                        ? { currentPassword: values.currentPassword, password: values.password }
                        : { password: values.password }
                )
            );

            if (setPassword.fulfilled.match(result))
            {
                notification.success(result.payload?.message || 'Your password has been updated successfully.');
                if (onClose) onClose();
                return;
            }

            const payload = result.payload as { message?: string; code?: string } | undefined;

            if (payload?.code === 'CURRENT_PASSWORD_REQUIRED')
            {
                setNeedsCurrentPassword(true);
                formik.setFieldError('currentPassword', payload.message || 'Current password is required.');
                return;
            }

            notification.error(payload?.message || 'Failed to update password.');
        }
    });

    return (
        <div>
            <h1 className='text-lg font-bold pb-3'>Password &amp; Security</h1>
            <p className="text-sm text-gray-700 pb-4">
                Set a password for your account or change your existing one.
            </p>
            <form className="space-y-4">

                {needsCurrentPassword && <TextField
                    fullWidth
                    type="password"
                    name="currentPassword"
                    label="Current Password"
                    value={formik.values.currentPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                    helperText={formik.touched.currentPassword ? formik.errors.currentPassword as string : undefined}
                />}

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
                            sx={{ width: "27px", height: "27px" }} /> : "Save Password"}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default SellerChangePassword
