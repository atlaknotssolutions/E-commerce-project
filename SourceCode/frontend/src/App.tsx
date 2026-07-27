import { useEffect, useState } from 'react';
import './App.css';
import { ThemeProvider } from '@emotion/react';
import customeTheme from './Theme/customeTheme';
import { Route, Routes, Navigate } from 'react-router-dom';

import SellerDashboard from './seller/pages/SellerDashboard/SellerDashboard';
import CustomerRoutes from './routes/CustomerRoutes';
import AdminDashboard from './admin/pages/Dashboard/Dashboard';
import SellerAccountVerification from './seller/pages/SellerAccountVerification';
import SellerAccountVerified from './seller/pages/SellerAccountVerified';
import { useAppDispatch, useAppSelector } from './Redux Toolkit/Store';
import { fetchSellerProfile } from './Redux Toolkit/Seller/sellerSlice';
import BecomeSeller from './customer/pages/BecomeSeller/BecomeSeller';
import AdminAuth from './admin/pages/Auth/AdminAuth';
import { fetchUserProfile } from './Redux Toolkit/Customer/UserSlice';
import { fetchHomePageData } from './Redux Toolkit/Customer/Customer/AsyncThunk';

function App()
{
  const dispatch = useAppDispatch()
  const { auth, sellerAuth, sellers, user } = useAppSelector(store => store)
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const jwt =
        localStorage.getItem("jwt") ||
        auth.jwt ||
        sellerAuth.jwt;

      if (!jwt) {
        setBootstrapping(false);
        return;
      }

      try {
        const payload = JSON.parse(atob(jwt.split(".")[1]));

        if (payload.role === "ROLE_SELLER") {
          await dispatch(fetchSellerProfile(jwt));
        } else {
          await dispatch(fetchUserProfile({ jwt }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setBootstrapping(false);
      }
    };

    bootstrap();
  }, [dispatch]);

  useEffect(() =>
  {
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

          <Route path='*' element={
            user.user?.role === "ROLE_ADMIN" ? <Navigate to="/admin" replace /> :
            sellers.profile ? <Navigate to="/seller" replace /> :
            <CustomerRoutes />
          } />

        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
