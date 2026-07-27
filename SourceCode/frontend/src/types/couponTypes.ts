import { Cart } from "./cartTypes";

export interface Coupon {
  _id: string;
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountPercentage: number;
  discountValue: number;
  maximumDiscount: number;
  validityStartDate: string;
  validityEndDate: string;
  minimumOrderValue: number;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  usedByUsers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsageUser {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
}

export interface CouponUsage {
  _id: string;
  code: string;
  usageCount: number;
  usedByUsers: CouponUsageUser[];
}

export interface CouponStatistics {
  active: number;
  expired: number;
  disabled: number;
  total: number;
  totalUsageCount: number;
  avgUsageCount: number;
  mostUsedCoupon: { code: string; usageCount: number } | null;
}

export interface CouponPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminCouponState {
  coupons: Coupon[];
  selectedCoupon: Coupon | null;
  statistics: CouponStatistics | null;
  usage: CouponUsage | null;
  pagination: CouponPagination | null;
  loading: boolean;
  error: string | null;
  actionSuccess: boolean;
  loaded: boolean;
}

export interface CouponState {
  coupons: Coupon[];
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  couponCreated: boolean;
  couponApplied: boolean;
  availableCoupons: Coupon[];
  usedCoupons: Coupon[];
  expiredCoupons: Coupon[];
  customerCouponsLoaded: boolean;
}
