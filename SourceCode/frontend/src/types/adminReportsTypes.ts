export interface DashboardSummary {
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    totalSellers: number;
    totalCoupons: number;
    grossRevenue: number;
    totalDiscount: number;
    totalRefunds: number;
    netRevenue: number;
    totalReturns: number;
    returnRate: string;
    couponsUsed: number;
}

export interface SalesDataPoint {
    _id: { date: string };
    totalSales: number;
    totalMrp: number;
    totalDiscount: number;
    orderCount: number;
    totalItems: number;
}

export interface RevenueDataPoint {
    _id: { date: string };
    grossRevenue: number;
    totalDiscount: number;
    orderCount: number;
}

export interface RevenueReport {
    trend: RevenueDataPoint[];
    summary: {
        grossRevenue: number;
        totalRefunds: number;
        totalCouponDiscount: number;
        netRevenue: number;
    };
}

export interface ProductReportItem {
    _id: string;
    title: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
    sellingPrice?: number;
    quantity?: number;
    category?: string;
    seller?: string;
}

export interface LowStockProduct {
    _id: string;
    title: string;
    quantity: number;
    sellingPrice: number;
    seller: string;
    category: string;
}

export interface ProductReport {
    bestSelling: ProductReportItem[];
    worstSelling: ProductReportItem[];
    outOfStock: number;
    lowStock: LowStockProduct[];
}

export interface SellerReportItem {
    _id: string;
    sellerName: string;
    email: string;
    businessName: string;
    totalRevenue: number;
    totalOrders: number;
    totalItems: number;
    averageOrderValue: number;
}

export interface SellerReport {
    topSellers: SellerReportItem[];
    lowestPerforming: SellerReportItem[];
    sellerCount: number;
}

export interface CustomerReport {
    newCustomers: number;
    totalCustomers: number;
    activeCustomers: number;
    returningCustomers: number;
}

export interface OrderStatusBreakdown {
    _id: string;
    count: number;
    totalAmount: number;
}

export interface OrderPaymentBreakdown {
    _id: string;
    count: number;
    totalAmount: number;
}

export interface OrderCityBreakdown {
    _id: string;
    count: number;
    totalAmount: number;
}

export interface OrderDateBreakdown {
    _id: string;
    count: number;
    totalAmount: number;
}

export interface OrderReport {
    byStatus: OrderStatusBreakdown[];
    byPaymentMethod: OrderPaymentBreakdown[];
    byCity: OrderCityBreakdown[];
    byDate: OrderDateBreakdown[];
    totalOrders: number;
}

export interface ReturnReasonBreakdown {
    _id: string;
    count: number;
}

export interface ReturnStatusBreakdown {
    _id: string;
    count: number;
    totalRefundAmount: number;
}

export interface TopReturnedProduct {
    _id: string;
    title: string;
    returnCount: number;
    totalRefundAmount: number;
}

export interface ReturnReport {
    totalReturns: number;
    returnRate: string;
    totalRefundAmount: number;
    byReason: ReturnReasonBreakdown[];
    byStatus: ReturnStatusBreakdown[];
    topReturnedProducts: TopReturnedProduct[];
}

export interface CouponUsageItem {
    _id: string;
    code: string;
    usageCount: number;
    discountPercentage: number;
    discountValue: number;
    discountType: string;
    isActive: boolean;
    usageLimit: number;
}

export interface CouponReport {
    usageStats: CouponUsageItem[];
    summary: {
        totalCoupons: number;
        activeCoupons: number;
        totalCouponsUsed: number;
        totalCouponDiscount: number;
        ordersWithCoupon: number;
        successRate: string;
    };
}

export type ReportTab = 'dashboard' | 'sales' | 'revenue' | 'products' | 'sellers' | 'customers' | 'orders' | 'returns' | 'coupons';

export interface ReportFilters {
    startDate: string | null;
    endDate: string | null;
    groupBy: 'daily' | 'weekly' | 'monthly' | 'yearly';
    status?: string;
    paymentMethod?: string;
}

export interface AdminReportsState {
    dashboard: DashboardSummary | null;
    sales: SalesDataPoint[];
    salesGroupBy: string;
    revenue: RevenueReport | null;
    revenueGroupBy: string;
    products: ProductReport | null;
    sellers: SellerReport | null;
    customers: CustomerReport | null;
    orders: OrderReport | null;
    returns: ReturnReport | null;
    coupons: CouponReport | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
}
