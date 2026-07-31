import React, { useEffect, useState } from 'react'
import LoginForm from './LoginForm'
import { Button } from '@mui/material';
import SignupForm from './SignupForm';
import { notification } from '../../../services/notificationService';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { clearOtpSent, clearAuthError } from '../../../Redux Toolkit/Customer/AuthSlice';

const Auth = () => {
    const [isLoginPage, setIsLoginPage] = useState(true);
    const dispatch = useAppDispatch();
    const { auth } = useAppSelector(store => store)

    useEffect(() => {
        if (auth.otpSent) {
            notification.success("OTP sent to your email!");
            dispatch(clearOtpSent());
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
                    {isLoginPage ? <LoginForm /> : <SignupForm />}

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