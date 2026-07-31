import React, { useEffect } from 'react'
import OrderItemCard from './OrderItemCard'
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { fetchUserOrderHistory } from '../../../Redux Toolkit/Customer/OrderSlice';
import { CircularProgress, Divider } from '@mui/material';

const Order = () => {
  const dispatch = useAppDispatch()
    const { auth, orders } = useAppSelector(store => store);

    useEffect(() => {
        dispatch(fetchUserOrderHistory(localStorage.getItem("jwt") || ""))
    }, [auth.jwt, dispatch])
  return (
    <div className='min-h-screen'>
       <div className='pb-5'>
        <h1 className='text-xl font-bold'>My Orders</h1>
        <Divider sx={{ mt: 1 }} />
       </div>

        {orders?.loading ? (
          <div className='flex justify-center py-10'>
            <CircularProgress size={28} sx={{ color: '#00927c' }} />
          </div>
        ) : orders?.orders?.length === 0 ? (
          <div className='text-center py-10 text-gray-500'>
            <p>No orders found.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {orders?.orders?.map((order) =>
              order?.orderItems.map((item) => (
                <OrderItemCard key={item.id} item={item} order={order} />
              ))
            )}
          </div>
        )}
    </div>
  )
}

export default Order