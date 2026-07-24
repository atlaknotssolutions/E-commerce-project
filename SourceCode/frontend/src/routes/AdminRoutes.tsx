import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboardPage from '../admin/pages/Dashboard/AdminDashboardPage'
import SellersTable from '../admin/pages/sellers/SellersTable'
import AdminCouponPage from '../admin/pages/Coupon/AdminCouponPage'
import GridTable from '../admin/pages/Home Page/GridTable'
import ElectronicsTable from '../admin/pages/Home Page/ElectronicsTable'
import ShopByCategoryTable from '../admin/pages/Home Page/ShopByCategoryTable'
import Deal from '../admin/pages/Home Page/Deal'
import Categories from '../admin/pages/Categories/Categories'
import CategoryRequests from '../admin/pages/CategoryRequests/CategoryRequests'
import AdminAccount from '../admin/pages/Account/AdminAccount'
import AdminUsersPage from '../admin/pages/Users/AdminUsersPage'
import AdminSellerVerificationPage from '../admin/pages/SellerVerification/AdminSellerVerificationPage'
import AdminProductModerationPage from '../admin/pages/ProductModeration/AdminProductModerationPage'
import AdminOrderManagementPage from '../admin/pages/OrderManagement/AdminOrderManagementPage'
import Reports from '../admin/pages/Reports/Reports'
import Notifications from '../admin/pages/Notifications/Notifications'
import SystemSettings from '../admin/pages/SystemSettings/SystemSettings'
import AdminCommissions from '../admin/pages/Commissions/Commissions'
import AdminBrandPage from '../admin/pages/Brands/AdminBrandPage'

const AdminRoutes = () => {
  return (
    <Routes>
    <Route path='/' element={<Navigate to="/admin/dashboard" replace />}/>
    <Route path='/dashboard' element={<AdminDashboardPage/>}/>
    <Route path='/coupon' element={<AdminCouponPage/>}/>
    <Route path='/home-grid' element={<GridTable/>}/>
    <Route path='/electronics-category' element={<ElectronicsTable/>}/>
    <Route path='/shop-by-category' element={<ShopByCategoryTable/>}/>
    <Route path='/deals' element={<Deal/>}/>
    <Route path='/categories' element={<Categories/>}/>
    <Route path='/category-requests' element={<CategoryRequests/>}/>
    <Route path='/users' element={<AdminUsersPage/>}/>
    <Route path='/seller-verification' element={<AdminSellerVerificationPage/>}/>
    <Route path='/product-moderation' element={<AdminProductModerationPage/>}/>
    <Route path='/order-management' element={<AdminOrderManagementPage/>}/>
    <Route path='/reports' element={<Reports/>}/>
    <Route path='/notifications' element={<Notifications/>}/>
    <Route path='/settings' element={<SystemSettings/>}/>
      <Route path='/commissions' element={<AdminCommissions/>}/>
      <Route path='/brands' element={<AdminBrandPage/>}/>
      <Route path='/account' element={<AdminAccount/>}/>
    </Routes>
  )
}

export default AdminRoutes