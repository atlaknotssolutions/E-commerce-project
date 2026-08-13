import React, { useEffect, Suspense, lazy } from 'react'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import Home from '../customer/pages/Home/Home'
import Products from '../customer/pages/Products/Products'
import ProductDetails from '../customer/pages/Products/ProductDetails/ProductDetails'
import Cart from '../customer/pages/Cart/Cart'
import Address from '../customer/pages/Checkout/AddressPage'
import Profile from '../customer/pages/Account/Profile'
import Footer from '../customer/components/Footer/Footer'
import Navbar from '../customer/components/Navbar/Navbar'
import NotFound from '../customer/pages/NotFound/NotFound'
import Auth from '../customer/pages/Auth/Auth'
import ForgotPassword from '../customer/pages/Auth/ForgotPassword'
import ResetPassword from '../customer/pages/Auth/ResetPassword'
import { useAppDispatch, useAppSelector } from '../Redux Toolkit/Store'
import { fetchUserCart } from '../Redux Toolkit/Customer/CartSlice'
import PaymentSuccessHandler from '../customer/pages/Pyement/PaymentSuccessHandler'
import Reviews from '../customer/pages/Review/Reviews'
import WriteReviews from '../customer/pages/Review/WriteReview'
import EditReview from '../customer/pages/Review/EditReview'
import { getWishlistByUserId } from '../Redux Toolkit/Customer/WishlistSlice'
import PublicBrandList from '../customer/pages/Brands/PublicBrandList'
import PublicBrandDetail from '../customer/pages/Brands/PublicBrandDetail'
import SearchProducts from '../customer/pages/Search/SearchProducts'
import CookieBanner from '../customer/components/Cookie/CookieBanner'
import RequireAuth from './RequireAuth'

const AboutUs = lazy(() => import('../customer/pages/Legal/AboutUs'))
const PrivacyPolicy = lazy(() => import('../customer/pages/Legal/PrivacyPolicy'))
const CookiePolicy = lazy(() => import('../customer/pages/Legal/CookiePolicy'))
const TermsConditions = lazy(() => import('../customer/pages/Legal/TermsConditions'))
const RefundPolicy = lazy(() => import('../customer/pages/Legal/RefundPolicy'))
const ShippingPolicy = lazy(() => import('../customer/pages/Legal/ShippingPolicy'))
const ContactUs = lazy(() => import('../customer/pages/Legal/ContactUs'))

const LegalFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 40, height: 40, border: '3px solid #e9ecef', borderTopColor: '#00927c',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  </div>
)


const CustomerRoutes = () => {
  const dispatch = useAppDispatch()
    const { auth, user } = useAppSelector(store => store);
    const location = useLocation();

useEffect(() => {
    if (user.user?.role !== "ROLE_CUSTOMER") return;

    dispatch(fetchUserCart(localStorage.getItem("jwt") || ""));
    dispatch(getWishlistByUserId());
}, [auth.jwt, user.user, dispatch]);
  const hideFooter = location.pathname === '/login' || location.pathname === '/become-seller' || location.pathname === '/forgot-password' || location.pathname === '/reset-password';
  return (
    <>
      <Navbar />
      <Suspense fallback={<LegalFallback />}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/products' element={<Products />} />
        <Route path='/products/:categoryId' element={<Products />} />
        <Route path='/search-products' element={<SearchProducts />} />
        <Route path='/reviews/:productId' element={<Reviews />} />
        <Route path='/reviews/:productId/create' element={<RequireAuth><WriteReviews /></RequireAuth>} />
        <Route path='/reviews/:productId/edit/:reviewId' element={<RequireAuth><EditReview /></RequireAuth>} />
        <Route path='/product-details/:categoryId/:name/:productId' element={<ProductDetails />} />
        <Route path='/cart' element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path='/wishlist' element={<Navigate to='/account/wishlist' replace />} />
        <Route path='/checkout/address' element={<RequireAuth><Address /></RequireAuth>} />
        <Route path='/account/*' element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path='/login' element={<Auth/>} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/payment-success' element={<PaymentSuccessHandler/>} />
        <Route path='/about' element={<AboutUs />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/cookie-policy' element={<CookiePolicy />} />
        <Route path='/terms' element={<TermsConditions />} />
        <Route path='/refund-policy' element={<RefundPolicy />} />
        <Route path='/shipping-policy' element={<ShippingPolicy />} />
        <Route path='/contact' element={<ContactUs />} />
        <Route path='/brands' element={<PublicBrandList />} />
        <Route path='/brands/:slug' element={<PublicBrandDetail />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      </Suspense>
      {!hideFooter && <Footer />}
      <CookieBanner />
    </>
  )
}

export default CustomerRoutes
