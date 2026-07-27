import mongoose from 'mongoose';
import { PAYOUT_STATUS, GATEWAY, GATEWAY_PAYOUT_STATUS } from '../../constants/enums.js';

/**
 * Payout schema for storing seller payout details.
 * Gateway-level data lives in GatewayEvent (append-only log).
 * This model stores lightweight pointers for fast queries.
 */
const PayoutSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: [true, 'Payout must connect to a valid active merchant seller'],
    },
    amount: {
        type: Number,
        required: [true, 'Payout settlement total clear amount is required'],
        min: [0, 'Payout clear amount cannot be negative'],
    },
    status: {
        type: String,
        enum: Object.values(PAYOUT_STATUS),
        default: PAYOUT_STATUS.PENDING,
        required: true,
    },
    requestedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    processedAt: {
        type: Date,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    },
    rejectionReason: {
        type: String,
        trim: true,
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
    }],

    // Gateway integration fields (lightweight pointers)
    gateway: {
        type: String,
        enum: Object.values(GATEWAY),
        default: null,
    },
    gatewayPayoutId: {
        type: String,
        trim: true,
        default: null,
    },
    referenceId: {
        type: String,
        trim: true,
        default: null,
    },
    gatewayStatus: {
        type: String,
        enum: Object.values(GATEWAY_PAYOUT_STATUS),
        default: null,
    },
    gatewayEventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GatewayEvent',
        default: null,
    },
}, {
    timestamps: true,
});

PayoutSchema.index({ seller: 1, requestedAt: -1 });
PayoutSchema.index({ status: 1 });
PayoutSchema.index({ gatewayPayoutId: 1 }, { sparse: true });
PayoutSchema.index({ gatewayStatus: 1 });
PayoutSchema.index(
    { seller: 1 },
    { unique: true, partialFilterExpression: { status: PAYOUT_STATUS.PENDING } }
);

export const Payout = mongoose.model('Payout', PayoutSchema);
