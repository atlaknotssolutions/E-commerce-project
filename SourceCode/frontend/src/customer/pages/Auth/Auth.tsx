import React, { useEffect, useState } from 'react'
import LoginForm from './LoginForm'
import PasswordLoginForm from './PasswordLoginForm'
import { Button } from '@mui/material';
import SignupForm from './SignupForm';
import { Link } from 'react-router-dom';
import { notification } from '../../../services/notificationService';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { clearAuthError } from '../../../Redux Toolkit/Customer/AuthSlice';

const Auth = () => {
    const [isLoginPage, setIsLoginPage] = useState(true);
    const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
    const dispatch = useAppDispatch();
    const { auth } = useAppSelector(store => store)

    useEffect(() => {
        if (auth.otpSent) {
            notification.success("OTP sent to your email!");
        } else if (auth.error) {
            notification.error(auth.error);
            dispatch(clearAuthError());
        }
    }, [auth.otpSent, auth.error, dispatch])

    return (
        <div className='flex justify-center h-[90vh] items-center'>
            <div className='max-w-md h-[85vh] rounded-md border shadow-lg '>
                <img className='w-full rounded-t-md' src="/login_banner.png" alt="" />
                <div className='mt-8 px-10'>
                    {isLoginPage ? (loginMethod === 'otp' ? <LoginForm /> : <PasswordLoginForm />) : <SignupForm />}

                    {isLoginPage && (
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
                                    <Link to="/forgot-password" className="text-teal-600 hover:text-teal-800 font-semibold text-sm">
                                        Forgot password?
                                    </Link>
                                </>
                            )}
                        </div>
                    )}

                    <div className='flex items-center gap-1 justify-center mt-5'>
                        <p>{isLoginPage && "Don't"} have Account ?</p>
                        <Button onClick={() => setIsLoginPage(!isLoginPage)} size='small'>{isLoginPage ? "create account" : "login"}</Button>
                    </div>
                </div>


            </div>
        </div>
    )
}

export default Auth