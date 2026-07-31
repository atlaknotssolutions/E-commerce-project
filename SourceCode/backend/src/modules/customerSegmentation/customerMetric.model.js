import mongoose from 'mongoose';

const CustomerMetricSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    totalOrders: {
        type: Number,
        default: 0,
        min: 0,
    },
    lifetimeSpend: {
        type: Number,
        default: 0,
        min: 0,
    },
    averageOrderValue: {
        type: Number,
        default: 0,
        min: 0,
    },
    lastOrderDate: {
        type: Date,
        default: null,
    },
    firstOrderDate: {
        type: Date,
        default: null,
    },
    daysSinceLastOrder: {
        type: Number,
        default: 0,
        min: 0,
    },
    segment: {
        type: String,
        default: 'ALL_CUSTOMERS',
    },
    segments: [{
        type: String,
    }],
    computedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

CustomerMetricSchema.index({ segment: 1 });
CustomerMetricSchema.index({ lifetimeSpend: -1 });
CustomerMetricSchema.index({ totalOrders: -1 });

export const CustomerMetric = mongoose.model('CustomerMetric', CustomerMetricSchema);
