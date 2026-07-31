import mongoose from 'mongoose';
import { BRAND_REQUEST_STATUS } from '../../constants/enums.js';

/**
 * BrandRequest schema for seller-submitted brand creation requests.
 * Follows the same pattern as CategoryRequest for consistency.
 * Admins review, approve, or reject brand requests.
 */
const BrandRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Requested brand name is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    logo: {
        type: String,
        default: null,
    },
    website: {
        type: String,
        trim: true,
        default: '',
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: [true, 'Seller reference is required'],
        index: true,
    },
    status: {
        type: String,
        enum: Object.values(BRAND_REQUEST_STATUS),
        default: BRAND_REQUEST_STATUS.PENDING,
        required: [true, 'Request status is required'],
        index: true,
    },
    reason: {
        // Seller's reason for requesting this brand.
        type: String,
        trim: true,
        default: '',
    },
    rejectionReason: {
        // Admin's reason for rejecting the request.
        type: String,
        trim: true,
        default: null,
    },
    brandId: {
        // Links to the Brand entity created upon approval.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
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
    // Automatically adds createdAt and updatedAt fields.
    timestamps: true,
});

// Indexes to improve query performance.
BrandRequestSchema.index({ status: 1, createdAt: -1 });
BrandRequestSchema.index({ requestedBy: 1, status: 1 });
BrandRequestSchema.index({ name: 1, status: 1 });

export const BrandRequest = mongoose.model('BrandRequest', BrandRequestSchema);
