import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS, SHIPMENT_STATUS, CARRIERS, COUPON_SCOPE_VALUES, STATUS_HISTORY_ACTOR_VALUES } from '../../constants/enums.js';

/**
 * Subdocument schema for a single status history entry.
 * Records every order lifecycle transition for audit and timeline.
 */
const OrderStatusHistorySchema = new mongoose.Schema({
    fromStatus: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        required: [true, 'Previous status is required for audit trail'],
    },
    toStatus: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        required: [true, 'New status is required for audit trail'],
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'changedByModel',
        required: [true, 'Actor who performed the transition is required'],
    },
    changedByModel: {
        type: String,
        required: [true, 'Actor model type is required'],
        enum: STATUS_HISTORY_ACTOR_VALUES,
    },
    changedByRole: {
        type: String,
        required: [true, 'Actor role is required for audit trail'],
    },
    changedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    note: {
        type: String,
        trim: true,
    },
}, { _id: false });

/**
 * Subdocument schema for a single shipment history entry.
 * Records every shipment lifecycle transition for audit and tracking timeline.
 */
const ShipmentHistorySchema = new mongoose.Schema({
    fromStatus: {
        type: String,
        enum: Object.values(SHIPMENT_STATUS),
    },
    toStatus: {
        type: String,
        enum: Object.values(SHIPMENT_STATUS),
        required: [true, 'New shipment status is required for audit trail'],
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'changedByModel',
        required: [true, 'Actor who performed the transition is required'],
    },
    changedByModel: {
        type: String,
        required: [true, 'Actor model type is required'],
        enum: STATUS_HISTORY_ACTOR_VALUES,
    },
    changedByRole: {
        type: String,
        required: [true, 'Actor role is required for audit trail'],
    },
    changedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    note: {
        type: String,
        trim: true,
    },
}, { _id: false });

/**
 * Snapshot of a product at the time the order is placed.
 * This keeps the original order details even if the product changes later.
 */
const OrderItemSnapshotSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the original product.
        required: [true, 'Product reference in ordered snapshot is required'],
    },
    title: {
        type: String,
        required: [true, 'Product title snapshot is required'],
        trim: true,
    },
    size: {
        type: String,
        required: [true, 'Ordered size snapshot is required'],
        trim: true,
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        // Points to embedded variant subdocument at time of order
    },
    variantAttributes: {
        type: mongoose.Schema.Types.Mixed,
        // Snapshot of variant attributes { color, size, storage, ram, custom }
    },
    quantity: {
        type: Number,
        required: [true, 'Ordered quantity is required'],
        min: [1, 'Quantity cannot be less than 1'],
    },
    mrpPrice: {
        type: Number, // MRP at the time of purchase.
        required: [true, 'Ordered MRP total snapshot is required'],
    },
    sellingPrice: {
        type: Number, // Selling price at the time of purchase.
        required: [true, 'Ordered selling price snapshot is required'],
    },
}, { _id: true });

/**
 * Snapshot of the shipping address used for this order.
 * Changes to the user's address won't affect past orders.
 */
const ShippingAddressSnapshotSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    streetAddress: { type: String, required: true, trim: true },
    locality: {               // <-- add this
        type: String,
        trim: true,
    },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
}, { _id: false });

/**
 * Order schema for storing customer orders.
 */
const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: [true, 'Human-readable business orderId is required'],
        unique: true, // Ensures every order ID is unique.
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Order must connect to an active purchasing customer'],
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: [true, 'Order must connect to an active merchant vendor'],
    },
    orderItems: [OrderItemSnapshotSchema], // List of ordered products.
    shippingAddress: {
        type: ShippingAddressSnapshotSchema,
        required: [true, 'Logistics delivery destination snapshots are required'],
    },
    totalMrpPrice: {
        type: Number,
        required: [true, 'Aggregated invoice MRP is required'],
        min: 0,
    },
    totalSellingPrice: {
        type: Number,
        required: [true, 'Aggregated invoice Selling Price is required'],
        min: 0,
    },
    couponPrice: {
        type: Number,
        default: 0,
        min: [0, 'Coupon discount cannot be negative'],
    },
    couponSnapshot: {
        type: new mongoose.Schema({
            couponId: { type: String, required: true },
            couponCode: { type: String, required: true },
            couponName: { type: String, default: '' },
            ownerType: { type: String, enum: ['PLATFORM', 'SELLER', 'SHARED'], required: true },
            sellerId: { type: String, default: null },
            scope: { type: String, enum: COUPON_SCOPE_VALUES, required: true },
            scopeIds: [{ type: String }],
            discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
            discountPercentage: { type: Number, default: 0 },
            discountValue: { type: Number, default: 0 },
            maximumDiscount: { type: Number, default: 0 },
            minimumOrderValue: { type: Number, default: 0 },
            couponDiscountApplied: { type: Number, required: true, min: 0 },
            sellerContribution: { type: Number, default: 0, min: 0 },
            platformContribution: { type: Number, default: 0, min: 0 },
            appliedAt: { type: Date, default: Date.now },
            appliedBy: { type: String, default: '' },
        }, { _id: false }),
        default: null,
    },
    discount: {
        type: Number,
        default: 0,
    },
    // Settlement Engine fields (populated on delivery)
    platformContribution: {
        type: Number,
        default: 0,
        min: 0,
    },
    sellerContribution: {
        type: Number,
        default: 0,
        min: 0,
    },
    couponOwnerType: {
        type: String,
        enum: ['PLATFORM', 'SELLER', 'SHARED', null],
        default: null,
    },
    commissionAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    gstAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    settlementAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    netSellerEarnings: {
        type: Number,
        default: 0,
        min: 0,
    },
    orderStatus: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PENDING,
    },
    totalItem: {
        type: Number,
        required: [true, 'Invoice total articles count is required'],
        min: 1,
    },
    paymentStatus: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
    },
    orderDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    deliverDate: {
        type: Date,
        required: true,
    },
    reservedAt: {
        type: Date,
    },
    reservationExpiresAt: {
        type: Date,
    },
    trackingNumber: {
        type: String,
        trim: true,
        sparse: true,
    },
    carrier: {
        type: String,
        enum: Object.values(CARRIERS),
    },
    shipmentStatus: {
        type: String,
        enum: Object.values(SHIPMENT_STATUS),
        default: SHIPMENT_STATUS.UNFULFILLED,
    },
    shippedAt: {
        type: Date,
    },
    estimatedDelivery: {
        type: Date,
    },
    deliveredAt: {
        type: Date,
    },
    shipmentHistory: [ShipmentHistorySchema],
    statusHistory: [OrderStatusHistorySchema],
}, {
    // Automatically adds createdAt and updatedAt fields.
    timestamps: true,
});

/**
 * Set the expected delivery date if it is not provided.
 */
OrderSchema.pre('validate', function (next)
{
    if (!this.deliverDate && this.orderDate)
    {
        const computedDelivery = new Date(this.orderDate);
        computedDelivery.setDate(computedDelivery.getDate() + 7); // Default delivery is 7 days after the order date.
        this.deliverDate = computedDelivery;
    }
    next();
});

// Indexes to improve query performance.
OrderSchema.index({ user: 1, orderDate: -1 });
OrderSchema.index({ seller: 1, orderDate: -1 });
// OrderSchema.index({ seller: 1, orderDate: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ orderStatus: 1, reservationExpiresAt: 1 }, { partialFilterExpression: { reservationExpiresAt: { $type: 'date' } } });

export const Order = mongoose.model('Order', OrderSchema);