import mongoose from 'mongoose';
import { COMMISSION_STATUS } from '../../constants/enums.js';

const CommissionSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Commission must be linked to an order'],
    },
    orderId: {
        type: String,
        required: [true, 'Human-readable order ID is required'],
        trim: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: [true, 'Commission must be linked to a seller'],
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Commission must be linked to a customer'],
    },
    orderAmount: {
        type: Number,
        required: [true, 'Order amount is required'],
        min: 0,
    },
    commissionPercentage: {
        type: Number,
        required: [true, 'Commission percentage is required'],
        min: 0,
        max: 100,
    },
    commissionAmount: {
        type: Number,
        required: [true, 'Commission amount is required'],
        min: 0,
    },
    gstPercentage: {
        type: Number,
        required: [true, 'GST percentage is required'],
        min: 0,
        max: 100,
    },
    gstAmount: {
        type: Number,
        required: [true, 'GST amount is required'],
        min: 0,
    },
    sellerAmount: {
        type: Number,
        required: [true, 'Seller settlement amount is required'],
        min: 0,
    },
    currency: {
        type: String,
        default: 'INR',
        trim: true,
    },
    status: {
        type: String,
        enum: Object.values(COMMISSION_STATUS),
        default: COMMISSION_STATUS.CALCULATED,
    },
    calculatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

CommissionSchema.index({ order: 1 }, { unique: true });
CommissionSchema.index({ seller: 1, createdAt: -1 });
CommissionSchema.index({ status: 1, createdAt: -1 });
CommissionSchema.index({ customer: 1, createdAt: -1 });

export const Commission = mongoose.model('Commission', CommissionSchema);
