import * as React from "react";


import DrawerList from "../../admin seller/components/drawerList/DrawerList";
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HomeIcon from '@mui/icons-material/Home';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import { Category, AddTask } from "@mui/icons-material";
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CookieIcon from '@mui/icons-material/Cookie';
import LogoutIcon from '@mui/icons-material/Logout';
const menu = [
    {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: <DashboardIcon className="text-primary-color" />,
        activeIcon: <DashboardIcon className="text-white" />,
    },
    {
        name: "Home Page",
        path: "/admin/home-grid",
        icon: <HomeIcon className="text-primary-color" />,
        activeIcon: <HomeIcon className="text-white" />,
    },
    {
        name: "Electronics Category",
        path: "/admin/electronics-category",
        icon: <ElectricBoltIcon className="text-primary-color" />,
        activeIcon: <ElectricBoltIcon className="text-white" />,
    },
    {
        name: "Shop By Category",
        path: "/admin/shop-by-category",
        icon: <ViewModuleIcon className="text-primary-color" />,
        activeIcon: <ViewModuleIcon className="text-white" />,
    },
    {
        name: "Categories",
        path: "/admin/categories",
        icon: <Category className="text-primary-color" />,
        activeIcon: <Category className="text-white" />,
    },
    {
        name: "Category Requests",
        path: "/admin/category-requests",
        icon: <AddTask className="text-primary-color" />,
        activeIcon: <AddTask className="text-white" />,
    },
    {
        name: "Deals",
        path: "/admin/deals",
        icon: <LocalOfferIcon className="text-primary-color" />,
        activeIcon: <LocalOfferIcon className="text-white" />,
    },
    {
        name: "Coupons",
        path: "/admin/coupon",
        icon: <IntegrationInstructionsIcon className="text-primary-color" />,
        activeIcon: <IntegrationInstructionsIcon className="text-white" />,
    },
    {
        name: "Users",
        path: "/admin/users",
        icon: <PeopleIcon className="text-primary-color" />,
        activeIcon: <PeopleIcon className="text-white" />,
    },
    {
        name: "Seller Verification",
        path: "/admin/seller-verification",
        icon: <VerifiedUserIcon className="text-primary-color" />,
        activeIcon: <VerifiedUserIcon className="text-white" />,
    },
    {
        name: "Product Moderation",
        path: "/admin/product-moderation",
        icon: <InventoryIcon className="text-primary-color" />,
        activeIcon: <InventoryIcon className="text-white" />,
    },
    {
        name: "Order Management",
        path: "/admin/order-management",
        icon: <ShoppingCartIcon className="text-primary-color" />,
        activeIcon: <ShoppingCartIcon className="text-white" />,
    },
    {
        name: "Brands",
        path: "/admin/brands",
        icon: <StorefrontIcon className="text-primary-color" />,
        activeIcon: <StorefrontIcon className="text-white" />,
    },
    {
        name: "Reports & Analytics",
        path: "/admin/reports",
        icon: <AssessmentIcon className="text-primary-color" />,
        activeIcon: <AssessmentIcon className="text-white" />,
    },
    {
        name: "Notifications",
        path: "/admin/notifications",
        icon: <NotificationsIcon className="text-primary-color" />,
        activeIcon: <NotificationsIcon className="text-white" />,
    },
    {
        name: "Commissions",
        path: "/admin/commissions",
        icon: <AccountBalanceIcon className="text-primary-color" />,
        activeIcon: <AccountBalanceIcon className="text-white" />,
    },
    {
        name: "Payouts",
        path: "/admin/payouts",
        icon: <PaymentIcon className="text-primary-color" />,
        activeIcon: <PaymentIcon className="text-white" />,
    },
    {
        name: "Cookie Consent",
        path: "/admin/cookie-consent",
        icon: <CookieIcon className="text-primary-color" />,
        activeIcon: <CookieIcon className="text-white" />,
    },
    {
        name: "System Settings",
        path: "/admin/settings",
        icon: <SettingsIcon className="text-primary-color" />,
        activeIcon: <SettingsIcon className="text-white" />,
    },
];

const menu2 = [

    {
        name: "Account",
        path: "/admin/account",
        icon: <AccountBoxIcon className="text-primary-color" />,
        activeIcon: <AccountBoxIcon className="text-white" />,
    },
    {
        name: "Logout",
        path: "/",
        icon: <LogoutIcon className="text-primary-color" />,
        activeIcon: <LogoutIcon className="text-white" />,
    },

]

interface DrawerListProps{
    toggleDrawer?:any;
}

const AdminDrawerList = ({ toggleDrawer }: DrawerListProps) => {

    return (
        <>
            <DrawerList toggleDrawer={toggleDrawer} menu={menu} menu2={menu2}/>
        </>
    );
}; 

export default AdminDrawerList;
