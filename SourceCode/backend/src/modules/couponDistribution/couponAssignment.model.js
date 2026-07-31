import mongoose from 'mongoose';
import { COUPON_TRIGGER_VALUES, COUPON_ASSIGNMENT_STATUS_VALUES } from '../../constants/enums.js';

const CouponAssignmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        required: true,
    },
    trigger: {
        type: String,
        enum: COUPON_TRIGGER_VALUES,
        required: true,
    },
    assignedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: null,
    },
    claimedAt: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: COUPON_ASSIGNMENT_STATUS_VALUES,
        default: 'ASSIGNED',
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

CouponAssignmentSchema.index({ userId: 1, status: 1 });
CouponAssignmentSchema.index({ couponId: 1 });
CouponAssignmentSchema.index({ trigger: 1 });
CouponAssignmentSchema.index({ status: 1, expiresAt: 1 });

export const CouponAssignment = mongoose.model('CouponAssignment', CouponAssignmentSchema);
