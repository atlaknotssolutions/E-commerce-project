import * as React from "react";

import DrawerList from "../../../admin seller/components/drawerList/DrawerList";
import { AccountBox, AddTask } from "@mui/icons-material";
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
const menu = [
  {
    name: "Dashboard",
    path: "/seller",
    icon: <DashboardIcon className="text-primary-color" />,
    activeIcon: <DashboardIcon className="text-white" />,
  },
  {
    name: "Orders",
    path: "/seller/orders",
    icon: <ShoppingBagIcon className="text-primary-color" />,
    activeIcon: <ShoppingBagIcon className="text-white" />,
  },
  {
    name: "Returns",
    path: "/seller/returns",
    icon: <AssignmentReturnIcon className="text-primary-color" />,
    activeIcon: <AssignmentReturnIcon className="text-white" />,
  },
  {
    name: "Products",
    path: "/seller/products",
    icon: <InventoryIcon className="text-primary-color" />,
    activeIcon: <InventoryIcon className="text-white" />,
  },
  {
    name: "Add Product",
    path: "/seller/add-product",
    icon: <AddIcon className="text-primary-color" />,
    activeIcon: <AddIcon className="text-white" />,
  },
  {
    name: "Request Category",
    path: "/seller/request-category",
    icon: <AddTask className="text-primary-color" />,
    activeIcon: <AddTask className="text-white" />,
  },
  {
    name: "Request Brand",
    path: "/seller/request-brand",
    icon: <BrandingWatermarkIcon className="text-primary-color" />,
    activeIcon: <BrandingWatermarkIcon className="text-white" />,
  },
  {
    name: "Coupons",
    path: "/seller/coupons",
    icon: <LocalOfferIcon className="text-primary-color" />,
    activeIcon: <LocalOfferIcon className="text-white" />,
  },
  {
    name: "Wallet",
    path: "/seller/wallet",
    icon: <AccountBalanceWalletIcon className="text-primary-color" />,
    activeIcon: <AccountBalanceWalletIcon className="text-white" />,
  },
  {
    name: "Commissions",
    path: "/seller/commissions",
    icon: <AccountBalanceIcon className="text-primary-color" />,
    activeIcon: <AccountBalanceIcon className="text-white" />,
  },
  // {
  //   name: "Inventory",
  //   path: "/seller/inventory",
  //   icon: <MailIcon className="text-primary-color" />,
  //   activeIcon: <MailIcon className="text-white" />,
  // },
];

const menu2 = [
  
  {
    name: "Account",
    path: "/seller/account",
    icon: <AccountBox className="text-primary-color" />,
    activeIcon: <AccountBox className="text-white" />,
  },
  {
    name: "Logout",
    path: "/",
    icon: <LogoutIcon className="text-primary-color" />,
    activeIcon: <LogoutIcon className="text-white" />,
  },
];

interface DrawerListProps {
  toggleDrawer?: any;
}

const SellerDrawerList = ({ toggleDrawer }: DrawerListProps) => {
  return <DrawerList menu={menu} menu2={menu2} toggleDrawer={toggleDrawer} />;
};

export default SellerDrawerList;
