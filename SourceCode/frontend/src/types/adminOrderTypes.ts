// Admin Order Management Types

export interface AdminOrder {
    _id: string;
    id: string;
    orderId: string;
    orderItems: AdminOrderItem[];
    shippingAddress: {
        name: string;
        mobile: string;
        streetAddress: string;
        address?: string;
        locality?: string;
        city: string;
        state: string;
        pinCode: string;
    };
    totalMrpPrice: number;
    totalSellingPrice: number;
    couponPrice?: number;
    discount: number;
    couponDiscount?: number;
    orderStatus: string;
    totalItem: number;
    paymentStatus: string;
    orderDate: string;
    deliverDate: string;
    trackingNumber: string | null;
    carrier: string | null;
    shipmentStatus: string;
    shippedAt: string | null;
    estimatedDelivery: string | null;
    deliveredAt: string | null;
    statusHistory: AdminOrderStatusHistory[];
    shipmentHistory: AdminOrderShipmentHistory[];
    user: {
        _id: string;
        fullName?: string;
        email?: string;
        mobile?: string;
    } | null;
    seller: {
        _id: string;
        sellerName?: string;
        email?: string;
        businessDetails?: {
            businessName?: string;
        };
    } | null;
    payment?: {
        method: string;
        status: string;
        amount: number;
        transactionId: string | null;
        paymentLinkId: string | null;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface AdminOrderItem {
    _id: string;
    product: {
        _id: string;
        title?: string;
        images?: Array<{ url: string }>;
        sellingPrice?: number;
        color?: string;
    } | null;
    title: string;
    size: string;
    quantity: number;
    mrpPrice: number;
    sellingPrice: number;
    variantId?: string;
    variantAttributes?: Record<string, any>;
}

export interface AdminOrderStatusHistory {
    fromStatus: string;
    toStatus: string;
    changedBy: string;
    changedByModel: string;
    changedByRole: string;
    changedAt: string;
    note?: string;
}

export interface AdminOrderShipmentHistory {
    fromStatus: string | null;
    toStatus: string;
    changedBy: string;
    changedByModel: string;
    changedByRole: string;
    changedAt: string;
    note?: string;
}

export interface AdminOrderPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AdminOrderListResponse {
    success: boolean;
    data: AdminOrder[];
    pagination: AdminOrderPagination;
}

export interface AdminOrderDetailResponse {
    success: boolean;
    data: AdminOrder;
}

export interface AdminOrderStats {
    PENDING: number;
    PLACED: number;
    CONFIRMED: number;
    PACKED: number;
    SHIPPED: number;
    OUT_FOR_DELIVERY: number;
    DELIVERED: number;
    CANCELLED: number;
    totalOrders: number;
}

export interface AdminOrderStatsResponse {
    success: boolean;
    data: AdminOrderStats;
}

export interface AdminOrderActionResponse {
    success: boolean;
    data: AdminOrder;
}

export interface AdminOrderState {
    orders: AdminOrder[];
    selectedOrder: AdminOrder | null;
    stats: AdminOrderStats | null;
    pagination: AdminOrderPagination | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    actionSuccess: boolean;
}
