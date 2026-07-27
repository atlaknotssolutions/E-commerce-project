/**
 * Centralized application constants.
 * 
 * These immutable values represent core business rules:
 * - User roles
 * - Account lifecycle states
 * - Order processing states
 * - Payment statuses and methods
 * 
 * Object.freeze() prevents accidental modification.
 * Keeping them centralized avoids duplicate values across the application.
 */

// Application user roles
export const ROLES = Object.freeze({
  CUSTOMER: 'ROLE_CUSTOMER',
  SELLER: 'ROLE_SELLER',
  ADMIN: 'ROLE_ADMIN',
});

// User account lifecycle states
export const ACCOUNT_STATUS = Object.freeze({
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
});

// Order lifecycle states
export const ORDER_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PLACED: 'PLACED',
  CONFIRMED: 'CONFIRMED',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
});

// Payment transaction states
export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});

// Supported payment gateways
export const PAYMENT_METHODS = Object.freeze({
  RAZORPAY: 'RAZORPAY',
  STRIPE: 'STRIPE',
});

// Supported shipping carriers
export const CARRIERS = Object.freeze({
  DELHIVERY: 'DELHIVERY',
  BLUE_DART: 'BLUE_DART',
  DTDC: 'DTDC',
  INDIA_POST: 'INDIA_POST',
  XPRESS_BEES: 'XPRESS_BEES',
  EKART: 'EKART',
  SHADOWFAX: 'SHADOWFAX',
  OTHER: 'OTHER',
});

// Shipment lifecycle states
export const SHIPMENT_STATUS = Object.freeze({
  UNFULFILLED: 'UNFULFILLED',
  PACKING: 'PACKING',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
});

// Return request lifecycle states
export const RETURN_STATUS = Object.freeze({
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ITEM_RECEIVED: 'ITEM_RECEIVED',
  REFUND_COMPLETED: 'REFUND_COMPLETED',
});

// Standardized reasons for return requests
export const RETURN_REASON = Object.freeze({
  DEFECTIVE_PRODUCT: 'DEFECTIVE_PRODUCT',
  WRONG_ITEM_RECEIVED: 'WRONG_ITEM_RECEIVED',
  NOT_AS_DESCRIBED: 'NOT_AS_DESCRIBED',
  CHANGE_OF_MIND: 'CHANGE_OF_MIND',
  DAMAGED_IN_TRANSIT: 'DAMAGED_IN_TRANSIT',
  SIZE_OR_FIT_ISSUE: 'SIZE_OR_FIT_ISSUE',
  MISSING_ACCESSORIES: 'MISSING_ACCESSORIES',
  QUALITY_ISSUE: 'QUALITY_ISSUE',
  OTHER: 'OTHER',
});

// Refund processing states
export const REFUND_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});

// Refund delivery method
export const REFUND_METHOD = Object.freeze({
  ORIGINAL_PAYMENT: 'ORIGINAL_PAYMENT',
  BANK_TRANSFER: 'BANK_TRANSFER',
  STORE_CREDIT: 'STORE_CREDIT',
});

export const HOME_PAGE_SECTIONS = Object.freeze({
  ELECTRIC_CATEGORIES: 'ELECTRIC_CATEGORIES',
  GRID: 'GRID',
  SHOP_BY_CATEGORIES: 'SHOP_BY_CATEGORIES',
  DEALS: 'DEALS',
});

export const HOME_PAGE_SECTION_VALUES = Object.freeze(
  Object.values(HOME_PAGE_SECTIONS)
);

// Maximum allowed category depth in the hierarchy.
export const MAX_CATEGORY_DEPTH = 3;

export const HOME_PAGE_SECTION_LIMITS = Object.freeze({
  GRID: 8,
  DEALS: 20,
  ELECTRIC_CATEGORIES: 12,
  SHOP_BY_CATEGORIES: 16,
});

// Seller verification lifecycle states
export const VERIFICATION_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

// Product moderation approval states
export const PRODUCT_APPROVAL_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

// Product publish lifecycle states
export const PUBLISH_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
});

// Commission lifecycle states
export const COMMISSION_STATUS = Object.freeze({
  CALCULATED: 'CALCULATED',
  APPROVED: 'APPROVED',
  SETTLED: 'SETTLED',
  CANCELLED: 'CANCELLED',
});

// Payout lifecycle states
export const PAYOUT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
});

// Gateway provider identifiers (customer payments + seller payouts)
export const GATEWAY = Object.freeze({
  MOCK_RAZORPAYX: 'MOCK_RAZORPAYX',
  MOCK_RAZORPAY: 'MOCK_RAZORPAY',
  RAZORPAY: 'RAZORPAY',
  RAZORPAYX: 'RAZORPAYX',
  STRIPE: 'STRIPE',
  CASHFREE: 'CASHFREE',
  PHONEPE: 'PHONEPE',
  PAYPAL: 'PAYPAL',
});

// Gateway-level payout status (separate from business PAYOUT_STATUS)
export const GATEWAY_PAYOUT_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REVERSED: 'reversed',
});

// Gateway-level refund status (separate from business REFUND_STATUS)
export const GATEWAY_REFUND_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REVERSED: 'reversed',
});

// Gateway event types (append-only event log)
// Uppercase = mock gateways write these (enum constants)
// Lowercase = business services write these at initiation/webhook time
export const GATEWAY_EVENT_TYPE = Object.freeze({
  PAYOUT_REQUESTED: 'PAYOUT_REQUESTED',
  PAYOUT_PROCESSING: 'PAYOUT_PROCESSING',
  PAYOUT_WEBHOOK_RECEIVED: 'PAYOUT_WEBHOOK_RECEIVED',
  PAYOUT_PROCESSED: 'PAYOUT_PROCESSED',
  PAYOUT_FAILED: 'PAYOUT_FAILED',
  PAYOUT_CANCELLED: 'PAYOUT_CANCELLED',
  PAYOUT_RETRY: 'PAYOUT_RETRY',
  REFUND_REQUESTED: 'REFUND_REQUESTED',
  REFUND_PROCESSING: 'REFUND_PROCESSING',
  REFUND_WEBHOOK_RECEIVED: 'REFUND_WEBHOOK_RECEIVED',
  REFUND_PROCESSED: 'REFUND_PROCESSED',
  REFUND_FAILED: 'REFUND_FAILED',
  REFUND_RETRY: 'REFUND_RETRY',
  PAYOUT_INITIATED: 'payout.initiated',
  PAYOUT_WEBHOOK: 'payout.webhook',
  REFUND_INITIATED: 'refund.initiated',
  REFUND_WEBHOOK: 'refund.webhook',
});

// Brand request lifecycle states
export const BRAND_REQUEST_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

// Brand sort options for listing
export const BRAND_SORT_OPTIONS = Object.freeze({
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  CREATED_ASC: 'created_asc',
  CREATED_DESC: 'created_desc',
  DISPLAY_ORDER: 'display_order',
});