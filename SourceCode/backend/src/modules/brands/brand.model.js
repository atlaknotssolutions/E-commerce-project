import mongoose from 'mongoose';

/**
 * Brand schema for managing product brands across the marketplace.
 * Brands are global platform entities created and managed by admins.
 * Sellers can request new brands via BrandRequest workflow.
 */
const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Brand name is required'],
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: [true, 'Brand slug is required'],
        unique: true,
        lowercase: true,
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
    logoPublicId: {
        // Cloudinary public ID for logo deletion on replacement.
        type: String,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    displayOrder: {
        type: Number,
        default: 0,
        min: [0, 'Display order cannot be negative'],
    },
    categoryId: {
        // Optional many-to-many: brand available in these categories.
        // Empty array means brand is available across all categories.
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Category',
        default: [],
    },
    metaTitle: {
        type: String,
        trim: true,
        default: '',
    },
    metaDescription: {
        type: String,
        trim: true,
        default: '',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'createdByModel',
        required: [true, 'Creator reference is required'],
    },
    createdByModel: {
        type: String,
        required: [true, 'Creator model type is required'],
        enum: ['User'],
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'updatedByModel',
        default: null,
    },
    updatedByModel: {
        type: String,
        enum: ['User'],
        default: null,
    },
}, {
    // Automatically adds createdAt and updatedAt fields.
    timestamps: true,
});

// Indexes to improve query performance.
BrandSchema.index({ isActive: 1, isDeleted: 1 });
BrandSchema.index({ isFeatured: 1, displayOrder: 1 });
BrandSchema.index({ categoryId: 1 });
BrandSchema.index({ createdBy: 1 });

// Full-text search index for brand name and description.
BrandSchema.index(
    { name: 'text', description: 'text' },
    { weights: { name: 10, description: 3 }, name: 'BrandTextSearchIndex' }
);

export const Brand = mongoose.model('Brand', BrandSchema);
