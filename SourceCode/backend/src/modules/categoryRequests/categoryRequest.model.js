import mongoose from 'mongoose';
import { MAX_CATEGORY_DEPTH } from '../../constants/enums.js';

const CATEGORY_REQUEST_STATUSES = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};

const CategoryRequestSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: [true, 'Seller reference is required.'],
        index: true,
    },
    requestedName: {
        type: String,
        required: [true, 'Requested category name is required.'],
        trim: true,
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    requestedLevel: {
        type: Number,
        min: 1,
        max: MAX_CATEGORY_DEPTH,
    },
    reason: {
        type: String,
        trim: true,
        default: '',
    },
    status: {
        type: String,
        enum: Object.values(CATEGORY_REQUEST_STATUSES),
        default: CATEGORY_REQUEST_STATUSES.PENDING,
        required: true,
        index: true,
    },
    rejectionReason: {
        type: String,
        trim: true,
        default: null,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    approvedAt: {
        type: Date,
        default: null,
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    rejectedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

CategoryRequestSchema.index({ status: 1, createdAt: -1 });
CategoryRequestSchema.index({ seller: 1, status: 1 });
CategoryRequestSchema.index({ requestedName: 1, parentCategory: 1, status: 1 });

export const CategoryRequest = mongoose.model('CategoryRequest', CategoryRequestSchema);
export { CATEGORY_REQUEST_STATUSES };
