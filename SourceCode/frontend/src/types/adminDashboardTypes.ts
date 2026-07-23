// Admin Dashboard Types

// ==========================================
// Analytics Types (matches backend response)
// ==========================================

export interface AdminUserAnalytics {
    totalUsers: number;
    totalCustomers: number;
    totalSellers: number;
    pendingSellers: number;
}

export interface AdminSellerAnalytics {
    totalSellers: number;
    pendingSellers: number;
}

export interface AdminCustomerAnalytics {
    totalCustomers: number;
}

export interface AdminProductAnalytics {
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
}

export interface AdminOrderAnalytics {
    totalOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
}

export interface AdminRevenueAnalytics {
    totalRevenue: number;
    todayRevenue: number;
    thisMonthRevenue: number;
    averageOrderValue: number;
}

export interface AdminReviewAnalytics {
    totalReviews: number;
    averageRating: number;
}

export interface AdminDashboardAnalytics {
    users: AdminUserAnalytics;
    sellers: AdminSellerAnalytics;
    customers: AdminCustomerAnalytics;
    products: AdminProductAnalytics;
    orders: AdminOrderAnalytics;
    revenue: AdminRevenueAnalytics;
    reviews: AdminReviewAnalytics;
}

// ==========================================
// Dashboard State
// ==========================================

export interface AdminDashboardState {
    analytics: AdminDashboardAnalytics | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    lastUpdated: string | null;
}
