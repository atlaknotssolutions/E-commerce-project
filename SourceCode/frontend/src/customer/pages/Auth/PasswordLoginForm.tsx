import { Button, CircularProgress, TextField } from '@mui/material'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { useLocation, useNavigate } from 'react-router-dom';
import { signinWithPassword } from '../../../Redux Toolkit/Customer/AuthSlice';
import { fetchUserProfile } from "../../../Redux Toolkit/Customer/UserSlice";

const PasswordLoginSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
    password: Yup.string()
        .required('Password is required.'),
});

const PasswordLoginForm = () =>
{
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { auth } = useAppSelector(store => store)

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: PasswordLoginSchema,

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

            const profileResult = await dispatch(fetchUserProfile({ jwt }));

            if (fetchUserProfile.fulfilled.match(profileResult))
            {
                const from = (location.state as { from?: string } | null)?.from;
                navigate(from || "/", { replace: true });
            }
        }
    });

    const handleLogin = () =>
    {
        formik.handleSubmit()
    }

    return (
        <div>
            <h1 className='text-center font-bold text-xl text-primary-color pb-8'>Login</h1>
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
                        disabled={auth.loading}
                        onClick={handleLogin}
                        fullWidth
                        variant='contained'
                        sx={{ py: "11px" }}>
                        {auth.loading ? <CircularProgress size="small"
                            sx={{ width: "27px", height: "27px" }} /> : "Login"}
                    </Button>
                </div>

            </form>
        </div>
    )
}

export default PasswordLoginForm
