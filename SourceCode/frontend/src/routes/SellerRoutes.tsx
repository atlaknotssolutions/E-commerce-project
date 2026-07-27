import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from '../seller/pages/Dashboard/Dashboard'
import Products from '../seller/pages/Products/Products'
import ProductForm from '../seller/pages/Products/AddProductForm'
import Orders from '../seller/pages/Orders/Orders'
import Profile from '../seller/pages/Account/Profile'
import Payment from '../seller/pages/Payment/Payment'
import TransactionTable from '../seller/pages/Payment/TransactionTable'
import Invetory from '../seller/pages/Invetory/Invetory'
import RequestCategory from '../seller/pages/CategoryRequest/RequestCategory'
import Returns from '../seller/pages/Returns/Returns'
import SellerCommissions from '../seller/pages/Commissions/Commissions'
import SellerBrandRequestPage from '../seller/pages/BrandRequest/SellerBrandRequestPage'

const SellerRoutes = () => {
  return (
         <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/products' element={<Products />} />
        <Route path='/add-product' element={<ProductForm />} />
        <Route path='/update-product/:id' element={<ProductForm />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/invetory' element={<Invetory />} />
        <Route path='/account' element={<Profile />} />
        <Route path='/payment' element={<Payment />} />
        <Route path='/transaction' element={<TransactionTable/>} />
        <Route path='/request-category' element={<RequestCategory/>} />
        <Route path='/returns' element={<Returns/>} />
        <Route path='/commissions' element={<SellerCommissions/>} />
        <Route path='/request-brand' element={<SellerBrandRequestPage/>} />
       </Routes>
  )
}

export default SellerRoutes