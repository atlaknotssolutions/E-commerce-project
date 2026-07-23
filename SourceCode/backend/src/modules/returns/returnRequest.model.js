import mongoose from 'mongoose';
import { RETURN_STATUS, RETURN_REASON } from '../../constants/enums.js';

/**
 * Subdocument schema for a single return status history entry.
 * Records every return request lifecycle transition for audit and timeline.
 */
const ReturnHistorySchema = new mongoose.Schema({
    fromStatus: {
        type: String,
        enum: Object.values(RETURN_STATUS),
    },
    toStatus: {
        type: String,
        enum: Object.values(RETURN_STATUS),
        required: [true, 'New return status is required for audit trail'],
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'changedByModel',
        required: [true, 'Actor who performed the transition is required'],
    },
    changedByModel: {
        type: String,
        required: [true, 'Actor model type is required'],
        enum: ['User', 'Seller', 'Admin'],
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
 * ReturnRequest schema for managing product returns.
 * Refund and shipment details live in their dedicated models.
 */
const ReturnRequestSchema = new mongoose.Schema({
    returnId: {
        type: String,
        required: [true, 'Human-readable business returnId is required'],
        unique: true,
        trim: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Return request must be linked to an order'],
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Return request must belong to a customer'],
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: [true, 'Return request must be assigned to a seller'],
    },
    orderItemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Reference to the original order item is required'],
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product reference is required'],
    },
    reason: {
        type: String,
        enum: Object.values(RETURN_REASON),
        required: [true, 'Return reason is required'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: '',
    },
    images: {
        type: [String],
        default: [],
    },
    refundAmount: {
        type: Number,
        min: 0,
        default: 0,
    },
    returnStatus: {
        type: String,
        enum: Object.values(RETURN_STATUS),
        default: RETURN_STATUS.REQUESTED,
    },
    sellerNote: {
        type: String,
        trim: true,
    },
    requestedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    resolvedAt: {
        type: Date,
    },
    returnHistory: [ReturnHistorySchema],
}, {
    timestamps: true,
});

// Indexes to improve query performance.
ReturnRequestSchema.index({ customer: 1, requestedAt: -1 });
ReturnRequestSchema.index({ seller: 1, requestedAt: -1 });
ReturnRequestSchema.index({ order: 1 });
ReturnRequestSchema.index({ returnStatus: 1 });
ReturnRequestSchema.index({ returnId: 1 });

export const ReturnRequest = mongoose.model('ReturnRequest', ReturnRequestSchema);
