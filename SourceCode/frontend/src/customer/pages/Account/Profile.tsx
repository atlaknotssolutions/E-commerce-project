import { Divider } from '@mui/material'
import React, { useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Order from './Order'
import UserDetails from './UserDetails'
// import SavedCards from './SavedCards'
import OrderDetails from './OrderDetails'
import ReviewHistory from './ReviewHistory'
import { notification } from '../../../services/notificationService'
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store'
import { performLogout } from '../../../Redux Toolkit/Customer/AuthSlice'
import { clearProfileUpdated, clearUserError } from '../../../Redux Toolkit/Customer/UserSlice'
import { clearOrderCanceled } from '../../../Redux Toolkit/Customer/OrderSlice'
import Addresses from './Adresses'
import CustomerDashboard from './CustomerDashboard'
import CustomerCoupons from './CustomerCoupons'
import ChangePassword from './ChangePassword'
import Wishlist from '../Wishlist/Wishlist'

const menu = [
    { name: "Dashboard", path: "/account" },
    { name: "Orders", path: "/account/orders" },
    { name: "Wishlist", path: "/account/wishlist" },
    { name: "Coupons", path: "/account/coupons" },
    { name: "Reviews", path: "/account/reviews" },
    { name: "Addresses", path: "/account/addresses" },
    { name: "Profile", path: "/account/profile" },
    { name: "Password & Security", path: "/account/password" },
    { name: "Logout", path: "logout" }
]
const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch()
    const { user,orders } = useAppSelector(store => store)

    const handleLogout = () => {
        dispatch(performLogout())
        navigate("/")
    }

    const handleClick = (item: any) => {
        if (item.path === "logout") {
            handleLogout()
        }
        else navigate(item.path)
    }

    useEffect(() => {
        if (user.profileUpdated) {
            notification.success("Profile updated successfully");
            dispatch(clearProfileUpdated());
        } else if (orders.orderCanceled) {
            notification.success("Order canceled successfully");
            dispatch(clearOrderCanceled());
        } else if (user.error) {
            notification.error(user.error);
            dispatch(clearUserError());
        }
    }, [user.profileUpdated, orders.orderCanceled, user.error, dispatch]);
    return (
        <div className='px-5 lg:px-52 min-h-screen mt-10 '>

            <div>
                <h1 className='text-xl font-bold pb-5'>{user.user?.fullName}</h1>
            </div>
            <Divider />
            <div className='grid grid-cols-1 lg:grid-cols-6 lg:min-h-[78vh]'>

                <div className="col-span-1 lg:border-r lg:pr-5 py-5 h-full flex flex-row flex-wrap lg:flex-col gap-1">
                    {menu.map((item, index) => {
                        const isLogout = item.path === "logout";
                        const isActive = isLogout ? false : 
                            item.path === "/account" 
                                ? location.pathname === "/account" || location.pathname === "/account/"
                                : location.pathname.startsWith(item.path) && item.path !== "logout";
                        return (
                            <div
                                key={item.name}
                                onClick={() => handleClick(item)}
                                className={`
                                    ${!isLogout && menu.length - 1 !== index ? "border-b" : ""}
                                    ${isActive ? "bg-[#00927c] text-white" : ""}
                                    px-4 py-2.5 rounded-md hover:bg-[#00927c] hover:text-white cursor-pointer text-sm transition-colors
                                `}
                            >
                                <p>{item.name}</p>
                            </div>
                        );
                    })}
                </div>
                <div className='lg:col-span-5 lg:pl-5 py-5'>

                    <Routes>
                        <Route path='/' element={<CustomerDashboard />} />
                        <Route path='/orders' element={<Order />} />
                        <Route path='/orders/:orderId/:orderItemId' element={<OrderDetails />} />
                        <Route path='/reviews' element={<ReviewHistory />} />
                        <Route path='/coupons' element={<CustomerCoupons />} />
                        <Route path='/profile' element={<UserDetails />} />
                        <Route path='/addresses' element={<Addresses />} />
                        <Route path='/password' element={<ChangePassword />} />
                        <Route path='/wishlist' element={<Wishlist />} />
                    </Routes>

                </div>

            </div>
        </div>
    )
}

export default Profile