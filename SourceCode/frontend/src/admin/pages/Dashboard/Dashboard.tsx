import React, { useEffect, useRef, useState } from 'react'
import AdminRoutes from '../../../routes/AdminRoutes'
// import DrawerList from './DrawerList'
import Navbar from '../../../admin seller/components/navbar/Navbar'
import AdminDrawerList from '../../components/DrawerList'
import { Alert, Snackbar } from '@mui/material'
import { useAppSelector } from '../../../Redux Toolkit/Store'
import { useLocation } from 'react-router-dom'

const AdminDashboard = () => {
  const { adminDeals: deal, admin } = useAppSelector(store => store)
  const [snackbarOpen, setOpenSnackbar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  }
  useEffect(() => {
    if (deal.dealCreated || deal.dealUpdated || deal.error || admin.categoryUpdated) {
      setOpenSnackbar(true)
    }
  }, [deal.dealCreated, deal.dealUpdated, deal.error, admin.categoryUpdated])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <>
      <div className="min-h-screen">
        <Navbar DrawerList={AdminDrawerList} />
        <section className="lg:flex lg:h-[90vh]">
          <div className="hidden lg:block h-full">
            <AdminDrawerList />
          </div>
          <div ref={contentRef} className="p-10 w-full lg:w-[80%] overflow-y-auto max-h-[calc(100vh-10vh)]">
            <AdminRoutes />
          </div>
        </section>

      </div>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen} autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={deal.error ? "error" : "success"}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {deal.error ? deal.error : deal.dealCreated ? "Deal created successfully" : deal.dealUpdated ? "deal updated successfully" : admin.categoryUpdated?"Category Updated successfully": ""}
        </Alert>
      </Snackbar>
    </>



  )
}

export default AdminDashboard