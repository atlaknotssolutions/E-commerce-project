import mongoose from 'mongoose';

/**
 * Coupon schema for managing discount offers.
 */
const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true,
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
// CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, validityStartDate: 1, validityEndDate: 1 });

export const Coupon = mongoose.model('Coupon', CouponSchema);