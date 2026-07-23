// Seller Dashboard Summary Types
export interface SalesSummary {
    totalRevenue: number;
    todayRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
}

export interface OrderSummary {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    packedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
}

export interface ProductSummary {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
}

export interface ReturnSummary {
    totalReturns: number;
    pendingReturns: number;
    approvedReturns: number;
    rejectedReturns: number;
    completedRefunds: number;
}

export interface ReviewSummary {
    totalReviews: number;
    averageRating: number;
}

export interface NotificationSummary {
    unreadNotifications: number;
}

export interface DashboardSummary {
    sales: SalesSummary;
    orders: OrderSummary;
    products: ProductSummary;
    returns: ReturnSummary;
    reviews: ReviewSummary;
    notifications: NotificationSummary;
}

// Revenue Analytics Types
export interface RevenueSummary {
    totalRevenue: number;
    averageRevenue: number;
    highestRevenue: number;
    lowestRevenue: number;
}

export interface RevenueDataset {
    label: string;
    data: number[];
}

export interface RevenueChart {
    labels: string[];
    datasets: RevenueDataset[];
}

export interface RevenueAnalytics {
    period: string;
    summary: RevenueSummary;
    chart: RevenueChart;
}

// Product Analytics Types
export interface ProductOverview {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
}

export interface TopSellingProduct {
    id: string;
    title: string;
    thumbnail: string;
    totalSold: number;
    revenue: number;
    remainingStock: number;
}

export interface LowestSellingProduct {
    id: string;
    title: string;
    thumbnail: string;
    totalSold: number;
    remainingStock: number;
}

export interface LowStockProduct {
    id: string;
    title: string;
    stock: number;
    status: string;
}

export interface OutOfStockProduct {
    id: string;
    title: string;
    thumbnail: string;
    category: string;
}

export interface NewProduct {
    id: string;
    title: string;
    createdAt: string;
    status: string;
}

export interface ProductAnalytics {
    overview: ProductOverview;
    topSelling: TopSellingProduct[];
    lowestSelling: LowestSellingProduct[];
    lowStock: LowStockProduct[];
    outOfStock: OutOfStockProduct[];
    newProducts: NewProduct[];
}

// Order Analytics Types
export interface OrderOverview {
    totalOrders: number;
    todayOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    packedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    returnedOrders: number;
}

export interface OrderRevenue {
    totalRevenue: number;
    averageOrderValue: number;
    highestOrderValue: number;
    lowestOrderValue: number;
}

export interface StatusDistribution {
    status: string;
    count: number;
}

export interface RecentOrder {
    id: string;
    orderId: string;
    customer: string;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
}

export interface TopCustomer {
    id: string;
    fullName: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
}

export interface OrderAnalytics {
    overview: OrderOverview;
    revenue: OrderRevenue;
    statusDistribution: StatusDistribution[];
    recentOrders: RecentOrder[];
    topCustomers: TopCustomer[];
}

// Customer Analytics Types
export interface CustomerOverview {
    totalCustomers: number;
    newCustomers: number;
    repeatCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
}

export interface CustomerGrowth {
    currentMonth: number;
    previousMonth: number;
    growthPercentage: number;
}

export interface CustomerRetention {
    repeatPurchaseRate: number;
    retentionPercentage: number;
}

export interface TopCustomerDetailed {
    id: string;
    fullName: string;
    email: string;
    mobile: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
}

export interface NewCustomer {
    id: string;
    fullName: string;
    email: string;
    firstOrderDate: string;
}

export interface RepeatCustomer {
    id: string;
    fullName: string;
    totalOrders: number;
    totalSpent: number;
}

export interface CustomerAnalytics {
    overview: CustomerOverview;
    growth: CustomerGrowth;
    retention: CustomerRetention;
    topCustomers: TopCustomerDetailed[];
    newCustomers: NewCustomer[];
    repeatCustomers: RepeatCustomer[];
}

// Return & Refund Analytics Types
export interface ReturnOverview {
    totalReturns: number;
    approvedReturns: number;
    rejectedReturns: number;
    pendingReturns: number;
    receivedReturns: number;
    completedRefunds: number;
    pendingRefunds: number;
}

export interface RefundSummary {
    totalRefundAmount: number;
    averageRefundAmount: number;
    largestRefund: number;
    smallestRefund: number;
}

export interface RecentReturn {
    id: string;
    returnId: string;
    orderId: string;
    customer: string;
    product: string;
    refundAmount: number;
    reason: string;
    returnStatus: string;
    requestedAt: string;
}

export interface TopReturnedProduct {
    id: string;
    title: string;
    returnCount: number;
    refundAmount: number;
}

export interface ReturnReason {
    reason: string;
    count: number;
    percentage: number;
}

export interface ReturnRefundAnalytics {
    overview: ReturnOverview;
    refundSummary: RefundSummary;
    statusDistribution: StatusDistribution[];
    recentReturns: RecentReturn[];
    topReturnedProducts: TopReturnedProduct[];
    returnReasons: ReturnReason[];
}

// Notification Types
export interface SellerNotification {
    id: string;
    title: string;
    type: string;
    priority: string;
    isRead: boolean;
    createdAt: string;
    metadata: Record<string, unknown>;
}

// Recent Activity Types
export interface RecentActivity {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    metadata: Record<string, unknown>;
}

// Unread Count Response
export interface UnreadCountResponse {
    count: number;
}

// Dashboard State
export interface SellerDashboardState {
    summary: DashboardSummary | null;
    revenue: RevenueAnalytics | null;
    products: ProductAnalytics | null;
    orders: OrderAnalytics | null;
    customers: CustomerAnalytics | null;
    returns: ReturnRefundAnalytics | null;
    notifications: SellerNotification[];
    recentActivities: RecentActivity[];
    loading: boolean;
    error: string | null;
    loaded: boolean;
    refreshing: boolean;
}
