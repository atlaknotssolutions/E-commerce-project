import React, { useEffect, useRef } from "react";

import SellerRoutes from "../../../routes/SellerRoutes";
import Navbar from "../../../admin seller/components/navbar/Navbar";
import SellerDrawerList from "../../components/SideBar/DrawerList";
import { useAppSelector } from "../../../Redux Toolkit/Store";
import { useLocation } from "react-router-dom";

const SellerDashboard = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { sellers } = useAppSelector(store => store);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Navbar DrawerList={SellerDrawerList} role="seller" profile={sellers.profile} />
      <section className="lg:flex lg:h-[90vh]">
        <div className="hidden lg:block h-full">
        <SellerDrawerList/>
        </div>
        <div ref={contentRef} className="p-10 w-full lg:w-[80%] overflow-y-auto max-h-[calc(100vh-10vh)]">
          <SellerRoutes />
        </div>
      </section>
    </div>
  );
};

export default SellerDashboard;
