import {
  configureStore,
  combineReducers,
} from "@reduxjs/toolkit";

// import { thunk } from "redux-thunk";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import sellerSlice from "./Seller/sellerSlice";
import sellerAuthenticationSlice from "./Seller/sellerAuthenticationSlice";
import sellerProductSlice from "./Seller/sellerProductSlice";
import ProductSlice from "./Customer/ProductSlice";
import CartSlice from "./Customer/CartSlice";
import AuthSlice from "./Customer/AuthSlice";
import UserSlice from "./Customer/UserSlice";
import OrderSlice from "./Customer/OrderSlice";
import sellerOrderSlice from "./Seller/sellerOrderSlice";
import payoutSlice from "./Seller/payoutSlice";
import transactionSlice from "./Seller/transactionSlice";
import CouponSlice from "./Customer/CouponSlice";
import AdminCouponSlice from "./Admin/AdminCouponSlice";
import ReviewSlice from "./Customer/ReviewSlice";
import WishlistSlice from "./Customer/WishlistSlice";
import AiChatBotSlice from "./Customer/AiChatBotSlice";
import revenueChartSlice from "./Seller/revenueChartSlice";
import CustomerSlice from "./Customer/Customer/CustomerSlice";
import DealSlice from "./Admin/DealSlice";
import AdminSlice from "./Admin/AdminSlice";
import AdminCategorySlice from "./Admin/AdminCategorySlice";
import AdminCategoryRequestSlice from "./Admin/AdminCategoryRequestSlice";
import SellerCategoryRequestSlice from "./Seller/sellerCategoryRequestSlice";
import sellerReturnSlice from "./Seller/sellerReturnSlice";
import sellerDashboardSlice from "./Seller/sellerDashboardSlice";
import adminDashboardSlice from "./Admin/adminDashboardSlice";
import adminUserSlice from "./Admin/adminUserSlice";
import sellerVerificationSlice from "./Admin/sellerVerificationSlice";
import adminProductModerationSlice from "./Admin/adminProductModerationSlice";
import adminOrderSlice from "./Admin/adminOrderSlice";
import adminReportsSlice from "./Admin/adminReportsSlice";
import adminNotificationSlice from "./Admin/adminNotificationSlice";
import adminSystemSettingsSlice from "./Admin/adminSystemSettingsSlice";
import adminCommissionSlice from "./Admin/adminCommissionSlice";
import sellerCommissionSlice from "./Seller/sellerCommissionSlice";

const rootReducer = combineReducers({
  
  // customer
  auth: AuthSlice,
  user: UserSlice,
  products: ProductSlice,
  cart: CartSlice,
  orders: OrderSlice,
  coupone: CouponSlice,
  review: ReviewSlice,
  wishlist: WishlistSlice,
  aiChatBot: AiChatBotSlice,
  homePage:CustomerSlice,

  // seller
  sellers: sellerSlice,
  sellerAuth: sellerAuthenticationSlice,
  sellerProduct: sellerProductSlice,
  sellerOrder: sellerOrderSlice,
  payouts: payoutSlice,
  transaction: transactionSlice,
  revenueChart: revenueChartSlice,
  sellerDashboard: sellerDashboardSlice,

  // admin
  adminCoupon:AdminCouponSlice,
  adminDeals:DealSlice,
  admin:AdminSlice,
  adminCategory: AdminCategorySlice,
  adminCategoryRequest: AdminCategoryRequestSlice,
  sellerCategoryRequest: SellerCategoryRequestSlice,
  sellerReturn: sellerReturnSlice,
  deal:DealSlice,

  // admin dashboard
  adminDashboard: adminDashboardSlice,
  adminUser: adminUserSlice,
  sellerVerification: sellerVerificationSlice,
  adminProductModeration: adminProductModerationSlice,
  adminOrder: adminOrderSlice,
  adminReports: adminReportsSlice,
  adminNotification: adminNotificationSlice,
  adminSystemSettings: adminSystemSettingsSlice,
  adminCommission: adminCommissionSlice,
  sellerCommission: sellerCommissionSlice,
});

// const store = configureStore({
//   reducer: rootReducer,
//   middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
// });

//New Code Add
const store = configureStore({
  reducer: rootReducer,
}); //

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
