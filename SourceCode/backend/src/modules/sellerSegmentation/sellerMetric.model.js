import mongoose from 'mongoose';

const SellerMetricSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
        unique: true,
    },
    totalOrders: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalRevenue: {
        type: Number,
        default: 0,
        min: 0,
    },
    averageOrderValue: {
        type: Number,
        default: 0,
        min: 0,
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    returnCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    returnRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    cancellationCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    cancellationRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    fulfillmentRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    revenueGrowth: {
        type: Number,
        default: 0,
    },
    orderGrowth: {
        type: Number,
        default: 0,
    },
    lastOrderDate: {
        type: Date,
        default: null,
    },
    daysSinceLastOrder: {
        type: Number,
        default: 0,
        min: 0,
    },
    daysSinceRegistration: {
        type: Number,
        default: 0,
        min: 0,
    },
    segment: {
        type: String,
        default: 'ALL_SELLERS',
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

SellerMetricSchema.index({ segment: 1 });
SellerMetricSchema.index({ totalRevenue: -1 });
SellerMetricSchema.index({ averageRating: -1 });

export const SellerMetric = mongoose.model('SellerMetric', SellerMetricSchema);
