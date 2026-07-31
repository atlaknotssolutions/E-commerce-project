import mongoose from 'mongoose';
import { CUSTOMER_SEGMENT_VALUES, SELLER_SEGMENT_VALUES, COUPON_SCOPE_VALUES } from '../../constants/enums.js';

/**
 * Coupon schema for managing discount offers.
 * Supports enterprise promotion system with target types, stacking, and ownership.
 */
const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    name: {
        type: String,
        trim: true,
        maxlength: 200,
        default: '',
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '',
    },
    discountType: {
        type: String,
        enum: ['PERCENTAGE', 'FLAT'],
        default: 'PERCENTAGE',
    },
    discountPercentage: {
        type: Number,
        min: [0, 'Discount percentage cannot be less than 0%'],
        max: [100, 'Discount percentage cannot exceed 100%'],
    },
    discountValue: {
        type: Number,
        min: [0, 'Discount value cannot be negative'],
    },
    maximumDiscount: {
        type: Number,
        min: [0, 'Maximum discount cannot be negative'],
        default: 0,
    },
    validityStartDate: {
        type: Date,
        required: [true, 'Validity start date is required'],
    },
    validityEndDate: {
        type: Date,
        required: [true, 'Validity end date is required'],
        validate: {
            validator: function (value)
            {
                return value > this.validityStartDate;
            },
            message: 'Validity end date must be scheduled after the validity start date'
        }
    },
    minimumOrderValue: {
        type: Number,
        required: [true, 'Minimum order value is required to apply the coupon'],
        min: [0, 'Minimum order value cannot be negative'],
        default: 0,
    },
    usageLimit: {
        type: Number,
        min: [0, 'Usage limit cannot be negative'],
        default: 0,
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    ownerType: {
        type: String,
        enum: ['PLATFORM', 'SELLER'],
        default: 'PLATFORM',
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    scope: {
        type: String,
        enum: COUPON_SCOPE_VALUES,
        default: 'ORDER',
    },
    scopeIds: [{
        type: mongoose.Schema.Types.ObjectId,
    }],
    targetType: {
        type: String,
        enum: ['ALL_CUSTOMERS', 'NEW_CUSTOMERS', 'EXISTING_CUSTOMERS', 'FIRST_TIME', ...CUSTOMER_SEGMENT_VALUES.filter(v => v.startsWith('SEGMENT_')), ...SELLER_SEGMENT_VALUES.filter(v => v.startsWith('SEGMENT_'))],
        default: 'ALL_CUSTOMERS',
    },
    priority: {
        type: Number,
        default: 0,
        min: 0,
    },
    stackable: {
        type: Boolean,
        default: false,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usedByUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

// Indexes to improve query performance.
CouponSchema.index({ isActive: 1, validityStartDate: 1, validityEndDate: 1 });
CouponSchema.index({ ownerType: 1, isActive: 1 });
CouponSchema.index({ sellerId: 1, isActive: 1, createdAt: -1 });
CouponSchema.index({ targetType: 1 });
CouponSchema.index({ priority: -1, stackable: 1 });

export const Coupon = mongoose.model('Coupon', CouponSchema);