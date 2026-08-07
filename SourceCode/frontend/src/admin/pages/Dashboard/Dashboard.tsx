import React, { useEffect, useRef } from 'react'
import AdminRoutes from '../../../routes/AdminRoutes'
// import DrawerList from './DrawerList'
import Navbar from '../../../admin seller/components/navbar/Navbar'
import AdminDrawerList from '../../components/DrawerList'
import { notification } from '../../../services/notificationService'
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store'
import { clearDealMessages } from '../../../Redux Toolkit/Admin/DealSlice'
import { clearMessages } from '../../../Redux Toolkit/Admin/AdminSlice'
import { useLocation } from 'react-router-dom'

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { adminDeals: deal, admin, user } = useAppSelector(store => store)
  const contentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (deal.dealCreated || deal.dealUpdated || deal.error || admin.categoryUpdated) {
      if (deal.error) {
        notification.error(deal.error);
        dispatch(clearDealMessages());
      } else if (deal.dealCreated) {
        notification.success("Deal created successfully");
        dispatch(clearDealMessages());
      } else if (deal.dealUpdated) {
        notification.success("Deal updated successfully");
        dispatch(clearDealMessages());
      } else if (admin.categoryUpdated) {
        notification.success("Category Updated successfully");
        dispatch(clearMessages());
      }
    }
  }, [deal.dealCreated, deal.dealUpdated, deal.error, admin.categoryUpdated, dispatch])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <>
      <div className="min-h-screen">
        <Navbar DrawerList={AdminDrawerList} role="admin" profile={user.user} />
        <section className="lg:flex lg:h-[90vh]">
          <div className="hidden lg:block h-full">
            <AdminDrawerList />
          </div>
          <div ref={contentRef} className="p-10 w-full lg:w-[80%] overflow-y-auto max-h-[calc(100vh-10vh)]">
            <AdminRoutes />
          </div>
        </section>
      </div>
    </>
  )
}

export default AdminDashboard