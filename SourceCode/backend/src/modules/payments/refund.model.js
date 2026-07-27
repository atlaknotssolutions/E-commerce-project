import mongoose from 'mongoose';
import { REFUND_STATUS, REFUND_METHOD, GATEWAY, GATEWAY_REFUND_STATUS } from '../../constants/enums.js';

/**
 * Refund schema for tracking refund transactions against return requests.
 * Separate collection to keep return and refund concerns decoupled.
 * Gateway-level data lives in GatewayEvent (append-only log).
 * This model stores lightweight pointers for fast queries.
 */
const RefundSchema = new mongoose.Schema({
    returnRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReturnRequest',
        required: [true, 'Refund must be linked to a return request'],
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Refund must be linked to an order'],
    },
    paymentOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentOrder',
        required: [true, 'Refund must be linked to a payment order'],
    },
    amount: {
        type: Number,
        required: [true, 'Refund amount is required'],
        min: [0, 'Refund amount cannot be negative'],
    },
    status: {
        type: String,
        enum: Object.values(REFUND_STATUS),
        default: REFUND_STATUS.PENDING,
    },
    method: {
        type: String,
        enum: Object.values(REFUND_METHOD),
        required: [true, 'Refund method is required'],
    },
    providerRefundId: {
        type: String,
        trim: true,
        sparse: true,
    },

    // Gateway integration fields (lightweight pointers)
    gateway: {
        type: String,
        enum: Object.values(GATEWAY),
        default: null,
    },
    gatewayStatus: {
        type: String,
        enum: Object.values(GATEWAY_REFUND_STATUS),
        default: null,
    },
    gatewayEventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GatewayEvent',
        default: null,
    },
    processedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Indexes to improve query performance.
RefundSchema.index({ returnRequestId: 1 });
RefundSchema.index({ orderId: 1 });
RefundSchema.index({ paymentOrderId: 1 });
RefundSchema.index({ status: 1 });
RefundSchema.index({ gatewayStatus: 1 });

export const Refund = mongoose.model('Refund', RefundSchema);
