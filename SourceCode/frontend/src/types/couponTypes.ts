import { Cart } from "./cartTypes";

export type CouponTargetType = 'ALL_CUSTOMERS' | 'NEW_CUSTOMERS' | 'EXISTING_CUSTOMERS' | 'FIRST_TIME'
  | 'SEGMENT_NEW_CUSTOMER' | 'SEGMENT_RETURNING_CUSTOMER' | 'SEGMENT_REGULAR_CUSTOMER'
  | 'SEGMENT_TOP_CUSTOMER' | 'SEGMENT_VIP_CUSTOMER' | 'SEGMENT_INACTIVE_CUSTOMER'
  | 'SEGMENT_HIGH_SPENDER' | 'SEGMENT_FREQUENT_BUYER'
  | 'SEGMENT_NEW_SELLER' | 'SEGMENT_ACTIVE_SELLER' | 'SEGMENT_TOP_SELLER'
  | 'SEGMENT_HIGH_REVENUE_SELLER' | 'SEGMENT_FAST_GROWING_SELLER'
  | 'SEGMENT_PREMIUM_SELLER' | 'SEGMENT_TRUSTED_SELLER';
export type CouponScope = 'ALL' | 'CATEGORY' | 'PRODUCT' | 'ORDER' | 'SELLER_STORE';

export interface Coupon {
  _id: string;
  id: string;
  code: string;
  name: string;
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
  ownerType: 'PLATFORM' | 'SELLER';
  sellerId?: string | null;
  scope: CouponScope;
  scopeIds: string[];
  targetType: CouponTargetType;
  priority: number;
  stackable: boolean;
  metadata: Record<string, any>;
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
