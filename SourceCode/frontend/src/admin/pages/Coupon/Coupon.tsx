import React, { useEffect } from 'react'
import CouponTable from './CouponTable'
import { useAppDispatch } from '../../../Redux Toolkit/Store'
import { fetchCoupons } from '../../../Redux Toolkit/Admin/AdminCouponSlice'

const Coupon = () => {
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchCoupons({}))
    }, [dispatch])
    return (
        <div>
            <CouponTable />
        </div>
    )
}

export default Coupon
