import { useEffect, useState } from 'react';
import './App.css';
import { ThemeProvider } from '@emotion/react';
import customeTheme from './Theme/customeTheme';
import { Button } from '@mui/material';
import Navbar from './customer/components/Navbar/Navbar';
import Home from './customer/pages/Home/Home';
import Footer from './customer/components/Footer/Footer';
import Products from './customer/pages/Products/Products';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';

import SellerDashboard from './seller/pages/SellerDashboard/SellerDashboard';
import CustomerRoutes from './routes/CustomerRoutes';
import AdminDashboard from './admin/pages/Dashboard/Dashboard';
import SellerAccountForm from './customer/pages/BecomeSeller/SellerAccountForm';
import SellerAccountVerification from './seller/pages/SellerAccountVerification';
import SellerAccountVerified from './seller/pages/SellerAccountVerified';
import { useAppDispatch, useAppSelector } from './Redux Toolkit/Store';
import { fetchSellerProfile } from './Redux Toolkit/Seller/sellerSlice';
import BecomeSeller from './customer/pages/BecomeSeller/BecomeSeller';
import AdminLoginForm from './admin/pages/Auth/AdminLogin';
import AdminAuth from './admin/pages/Auth/AdminAuth';
import { fetchUserProfile } from './Redux Toolkit/Customer/UserSlice';
// import { fetchHomePageData } from './Redux Toolkit/Customer/Customer/AsyncThunk';
import { createHomeCategories, fetchHomePageData } from './Redux Toolkit/Customer/Customer/AsyncThunk';
import { homeCategories } from './data/homeCategories';
import Mobile from './data/Products/mobile';
// import PaymentSuccessHandler from './customer/pages/Pyement/PaymentSuccessHandler';

function App()
{
  const dispatch = useAppDispatch()
  const { auth, sellerAuth, sellers, user } = useAppSelector(store => store)
  const navigate = useNavigate();
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() =>
  {
    const bootstrap = async () =>
    {
      const jwt =
        localStorage.getItem("jwt") ||
        auth.jwt ||
        sellerAuth.jwt;

      if (!jwt)
      {
        setBootstrapping(false);
        return;
      }

      try
      {
        const payload = JSON.parse(atob(jwt.split(".")[1]));

        if (payload.role === "ROLE_SELLER")
        {
          await dispatch(fetchSellerProfile(jwt));
        } else
        {
          await dispatch(fetchUserProfile({ jwt }));
        }
      } catch (err)
      {
        console.error(err);
      } finally
      {
        setBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  // useEffect(() =>
  // {
  //   const jwt = localStorage.getItem("jwt") || auth.jwt || sellerAuth.jwt;

  //   if (!jwt) return;

  //   // 1. Decode the token first to define 'payload'
  //   let payload;
  //   try
  //   {
  //     payload = JSON.parse(atob(jwt.split(".")[1]));
  //   } catch (e)
  //   {
  //     console.error("Invalid token", e);
  //     return;
  //   }

  //   // 2. Now perform the check using the now-defined 'payload'
  //   if (user.user && user.user.role === payload.role)
  //   {
  //     return;
  //   }

  //   // 3. Proceed with dispatch
  //   if (payload.role === "ROLE_SELLER")
  //   {
  //     dispatch(fetchSellerProfile(jwt));
  //   } else
  //   {
  //     dispatch(fetchUserProfile({ jwt }));
  //   }
  // }, [auth.jwt, sellerAuth.jwt, user.user]); // Added user.user dependency

  // Admin redirection logic

  // useEffect(() =>
  // {
  //   if (user.user?.role === "ROLE_ADMIN")
  //   {
  //     navigate("/admin", { replace: true });
  //   }
  // }, [user.user, navigate]);

  // useEffect(() =>
  // {
  //   if (sellers.profile)
  //   {
  //     navigate("/seller", { replace: true });
  //   }
  // }, [sellers.profile, navigate]);


  // this is dummy data code 
  useEffect(() =>
  {
    // dispatch(createHomeCategories(homeCategories))
    dispatch(fetchHomePageData())
  }, [dispatch])


  if (bootstrapping) return null;

  return (
    <ThemeProvider theme={customeTheme}>
      <div className='App' >


        <Routes>
          {sellers.profile && <Route path='/seller/*' element={<SellerDashboard />} />}
          {user.user?.role === "ROLE_ADMIN" && (
            <Route path='/admin/*' element={<AdminDashboard />} />
          )}
          <Route path='/verify-seller/:otp' element={<SellerAccountVerification />} />
          <Route path='/seller-account-verified' element={<SellerAccountVerified />} />
          <Route path='/become-seller' element={<BecomeSeller />} />
          <Route path='/admin-login' element={<AdminAuth />} />

          <Route path='/dummy' element={<Mobile />} />

          {/* <Route
            path="/payment-success"
            element={<PaymentSuccessHandler />}
          /> */}

          <Route path='*' element={
            user.user?.role === "ROLE_ADMIN" ? <Navigate to="/admin" replace /> :
            sellers.profile ? <Navigate to="/seller" replace /> :
            <CustomerRoutes />
          } />

        </Routes>
        {/* <Footer/> */}
      </div>



    </ThemeProvider>
  );
}

export default App;
