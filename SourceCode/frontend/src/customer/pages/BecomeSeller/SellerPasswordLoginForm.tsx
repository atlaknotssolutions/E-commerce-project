import { Button, CircularProgress, TextField } from '@mui/material'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { useNavigate } from 'react-router-dom';
import { signinWithPassword } from '../../../Redux Toolkit/Seller/sellerAuthenticationSlice';
import { fetchSellerProfile } from '../../../Redux Toolkit/Seller/sellerSlice';

const SellerPasswordLoginSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
    password: Yup.string()
        .required('Password is required.'),
});

const SellerPasswordLoginForm = () =>
{
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { sellerAuth } = useAppSelector(store => store)

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: SellerPasswordLoginSchema,

        onSubmit: async (values: any) =>
        {
            const loginResult = await dispatch(
                signinWithPassword({
                    email: values.email.trim(),
                    password: values.password,
                })
            );

            if (!signinWithPassword.fulfilled.match(loginResult)) return;

            const jwt = localStorage.getItem("jwt");
            if (!jwt) return;

            const profileResult = await dispatch(fetchSellerProfile(jwt));

            if (fetchSellerProfile.fulfilled.match(profileResult))
            {
                navigate("/seller");
            }
        }
    });

    const handleLogin = () =>
    {
        formik.handleSubmit()
    }

    return (
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

                <TextField
                    fullWidth
                    type="password"
                    name="password"
                    label="Enter Your Password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password ? formik.errors.password as string : undefined}
                />

                <div>
                    <Button
                        disabled={sellerAuth.loading}
                        onClick={handleLogin}
                        fullWidth
                        variant='contained'
                        sx={{ py: "11px" }}>
                        {sellerAuth.loading ? <CircularProgress size="small"
                            sx={{ width: "27px", height: "27px" }} /> : "Login"}
                    </Button>
                </div>

            </form>
        </div>
    )
}

export default SellerPasswordLoginForm
