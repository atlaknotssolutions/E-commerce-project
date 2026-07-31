
import { Product } from './productTypes';
import { Address, User } from './userTypes';

export interface OrderState
{
    orders: Order[];
    orderItem: OrderItem | null;
    currentOrder: Order | null;
    paymentOrder: any | null;
    loading: boolean;
    error: string | null;
    orderCanceled: boolean;
    returns: ReturnRequest[];
    returnsLoaded: boolean;
    returnLoading: boolean;
    returnError: string | null;
}

export interface Order
{
    id: string;
    orderId: string;
    user: User;
    sellerId: string;
    orderItems: OrderItem[];
    orderDate: string;
    shippingAddress: Address;
    paymentDetails: any;
    paymentStatus?: string;
    payment?: PaymentInfo | null;   
    totalMrpPrice: number;
    totalSellingPrice?: number; // Optional field
    couponPrice?: number; // Coupon discount allocated to this order
    discount?: number; // Optional field
    couponDiscount?: number;
    orderStatus: OrderStatus;
    totalItem: number;
    deliverDate: string;
    trackingNumber?: string;
    carrier?: string;
    shipmentStatus?: ShipmentStatus;
    shippedAt?: string;
    estimatedDelivery?: string;
    deliveredAt?: string;
    shipmentHistory?: ShipmentHistoryEntry[];
}

export enum OrderStatus
{
    PENDING = "PENDING",
    PLACED = "PLACED",
    CONFIRMED = "CONFIRMED",
    PACKED = "PACKED",
    SHIPPED = "SHIPPED",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
}

export interface OrderItem
{
    id: string;
    order: Order;
    product: Product;
    size: string;
    variantId?: string;
    variantAttributes?: Record<string, string>;
    quantity: number;
    mrpPrice: number;
    sellingPrice: number;
    userId: string;
}

export interface PaymentInfo {
    method: string;
    status: string;
    amount: number;
    transactionId: string | null;
    paymentLinkId: string | null;
}

export enum ShipmentStatus {
    UNFULFILLED = "UNFULFILLED",
    PACKING = "PACKING",
    SHIPPED = "SHIPPED",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    RETURNED = "RETURNED",
}

export enum Carrier {
    DELHIVERY = "DELHIVERY",
    BLUE_DART = "BLUE_DART",
    DTDC = "DTDC",
    INDIA_POST = "INDIA_POST",
    XPRESS_BEES = "XPRESS_BEES",
    EKART = "EKART",
    SHADOWFAX = "SHADOWFAX",
    OTHER = "OTHER",
}

export interface ShipmentHistoryEntry {
    fromStatus?: ShipmentStatus;
    toStatus: ShipmentStatus;
    changedBy: string;
    changedByModel: string;
    changedByRole: string;
    changedAt: string;
    note?: string;
}

export interface ShipmentTracking {
    orderId: string;
    orderStatus: OrderStatus;
    trackingNumber: string | null;
    carrier: string | null;
    shipmentStatus: ShipmentStatus;
    shippedAt: string | null;
    estimatedDelivery: string | null;
    deliveredAt: string | null;
    shipmentHistory: ShipmentHistoryEntry[];
}

export enum ReturnStatus {
    REQUESTED = "REQUESTED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    ITEM_RECEIVED = "ITEM_RECEIVED",
    REFUND_COMPLETED = "REFUND_COMPLETED",
}

export enum ReturnReason {
    DEFECTIVE_PRODUCT = "DEFECTIVE_PRODUCT",
    WRONG_ITEM_RECEIVED = "WRONG_ITEM_RECEIVED",
    NOT_AS_DESCRIBED = "NOT_AS_DESCRIBED",
    CHANGE_OF_MIND = "CHANGE_OF_MIND",
    DAMAGED_IN_TRANSIT = "DAMAGED_IN_TRANSIT",
    SIZE_OR_FIT_ISSUE = "SIZE_OR_FIT_ISSUE",
    MISSING_ACCESSORIES = "MISSING_ACCESSORIES",
    QUALITY_ISSUE = "QUALITY_ISSUE",
    OTHER = "OTHER",
}

export interface ReturnHistoryEntry {
    fromStatus?: ReturnStatus;
    toStatus: ReturnStatus;
    changedBy: string;
    changedByModel: string;
    changedByRole: string;
    changedAt: string;
    note?: string;
}

export interface ReturnOrderRef {
    id: string;
    orderId: string;
    orderStatus: string;
}

export interface ReturnCustomerRef {
    id: string;
    fullName: string;
    email: string;
    mobile: string;
}

export interface ReturnSellerRef {
    id: string;
    sellerName: string;
    email: string;
    mobile: string;
    businessDetails: {
        businessName?: string;
        [key: string]: any;
    };
}

export interface ReturnProductRef {
    id: string;
    title: string;
    images: string[];
    sellingPrice: number;
}

export interface ReturnRequest {
    id: string;
    returnId: string;
    order: ReturnOrderRef;
    customer: ReturnCustomerRef;
    seller: ReturnSellerRef;
    product: ReturnProductRef;
    orderItemId: string;
    reason: ReturnReason;
    description: string;
    images: string[];
    refundAmount: number;
    returnStatus: ReturnStatus;
    sellerNote?: string;
    requestedAt: string;
    resolvedAt?: string;
    returnHistory: ReturnHistoryEntry[];
    createdAt: string;
    updatedAt: string;
}