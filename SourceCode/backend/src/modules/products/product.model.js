import mongoose from 'mongoose';

/**
 * Subdocument schema for a single product image.
 * Supports both legacy string-only entries and structured image objects.
 */
const ProductImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, 'Product image URL is required'],
    },
    publicId: {
        type: String,
    },
    isPrimary: {
        type: Boolean,
        default: false,
    },
}, {
    _id: false,
});

/**
 * Subdocument schema for a single product variant.
 * Each variant represents a purchasable combination of attributes (Color, Size, Storage, etc.)
 * with its own SKU, pricing, stock, images, and status.
 */
const VariantAttributeSchema = new mongoose.Schema({
    key: {
        type: String,
        required: [true, 'Attribute key is required'],
        trim: true,
    },
    value: {
        type: String,
        required: [true, 'Attribute value is required'],
        trim: true,
    },
}, { _id: false });

const ProductVariantSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: [true, 'Variant SKU is required'],
        trim: true,
    },
    attributes: {
        color: { type: String, trim: true },
        size: { type: String, trim: true },
        storage: { type: String, trim: true },
        ram: { type: String, trim: true },
        custom: {
            type: [VariantAttributeSchema],
            default: [],
        },
    },
    price: {
        type: Number,
        required: [true, 'Variant price is required'],
        min: [0, 'Variant price cannot be negative'],
    },
    mrpPrice: {
        type: Number,
        required: [true, 'Variant MRP price is required'],
        min: [0, 'Variant MRP price cannot be negative'],
    },
    discountPercent: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        required: [true, 'Variant stock quantity is required'],
        min: [0, 'Variant stock cannot be negative'],
        default: 0,
    },
    reservedQuantity: {
        type: Number,
        min: [0, 'Reserved quantity cannot be negative'],
        default: 0,
    },
    images: {
        type: [ProductImageSchema],
        default: [],
    },
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    _id: true,
});

/**
 * Product schema for storing product details.
 */
const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
    },
    mrpPrice: {
        type: Number,
        required: [true, 'MRP original price is required'],
        min: [0, 'MRP price cannot be negative'],
    },
    sellingPrice: {
        type: Number,
        required: [true, 'Real Selling price is required'],
        min: [0, 'Selling price cannot be negative'],
    },
    discountPercent: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        required: [true, 'Available stock inventory quantity is required'],
        min: [0, 'Available stock quantity cannot be negative'],
        default: 0,
    },
    reservedQuantity: {
        type: Number,
        min: [0, 'Reserved quantity cannot be negative'],
        default: 0,
    },
    color: {
        type: String,
        trim: true,
    },
    images: {
        type: [ProductImageSchema],
        required: [true, 'At least one product catalog image is required'],
        validate: {
            validator: (arr) => arr && arr.length > 0,
            message: 'At least one product catalog image is required',
        },
    },
    variants: {
        type: [ProductVariantSchema],
        default: [],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference to the product category.
        required: [true, 'Leaf product category hierarchy mapping is required'],
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller', // Reference to the seller.
        required: [true, 'Vendor ownership reference is required'],
    },
    sizes: {
        type: String, // Example: "S,M,L,XL"
        trim: true,
    },
    brand: {
        type: String,
        trim: true,
    },
    approvalStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
    },
    publishStatus: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED', 'UNPUBLISHED'],
        default: 'DRAFT',
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    featuredAt: {
        type: Date,
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    moderationHistory: {
        type: [{
            action: { type: String, required: true },
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            reason: { type: String, default: null },
            previousStatus: { type: String, default: null },
            newStatus: { type: String, default: null },
            timestamp: { type: Date, default: Date.now },
        }],
        default: [],
    },
}, {
    // Automatically adds createdAt and updatedAt fields.
    timestamps: true,
});

/**
 * Normalize legacy string-only image entries to structured objects before saving.
 */
ProductSchema.pre('save', function (next)
{
    if (this.images && this.images.length > 0)
    {
        this.images = this.images.map((img) =>
        {
            if (typeof img === 'string')
            {
                return { url: img, isPrimary: false };
            }
            return img;
        });
    }
    next();
});

/**
 * Normalize images in findByIdAndUpdate/findOneAndUpdate operations.
 */
ProductSchema.pre('findOneAndUpdate', function (next)
{
    const update = this.getUpdate();
    if (update && update.$set && update.$set.images && Array.isArray(update.$set.images))
    {
        update.$set.images = update.$set.images.map((img) =>
        {
            if (typeof img === 'string')
            {
                return { url: img, isPrimary: false };
            }
            return img;
        });
    }
    next();
});

/**
 * Transform images to always output structured objects in JSON/object responses.
 * Normalizes both product-level and variant-level images.
 */
ProductSchema.set('toJSON', {
    transform: (doc, ret) =>
    {
        if (ret.images && Array.isArray(ret.images))
        {
            ret.images = ret.images.map((img) =>
            {
                if (typeof img === 'string')
                {
                    return { url: img, isPrimary: false };
                }
                return img;
            });
        }

        // Normalize variant-level images too
        if (ret.variants && Array.isArray(ret.variants))
        {
            ret.variants = ret.variants.map((variant) =>
            {
                if (variant.images && Array.isArray(variant.images))
                {
                    variant.images = variant.images.map((img) =>
                    {
                        if (typeof img === 'string')
                        {
                            return { url: img, isPrimary: false };
                        }
                        return img;
                    });
                }
                return variant;
            });
        }

        return ret;
    },
});

ProductSchema.set('toObject', {
    transform: (doc, ret) =>
    {
        if (ret.images && Array.isArray(ret.images))
        {
            ret.images = ret.images.map((img) =>
            {
                if (typeof img === 'string')
                {
                    return { url: img, isPrimary: false };
                }
                return img;
            });
        }

        // Normalize variant-level images too
        if (ret.variants && Array.isArray(ret.variants))
        {
            ret.variants = ret.variants.map((variant) =>
            {
                if (variant.images && Array.isArray(variant.images))
                {
                    variant.images = variant.images.map((img) =>
                    {
                        if (typeof img === 'string')
                        {
                            return { url: img, isPrimary: false };
                        }
                        return img;
                    });
                }
                return variant;
            });
        }

        return ret;
    },
});

/**
 * Calculate the discount percentage before validation.
 * Applies to both product-level and variant-level prices.
 */
ProductSchema.pre('validate', function (next)
{
    if (this.mrpPrice && this.sellingPrice)
    {
        const calculatedDiscount = ((this.mrpPrice - this.sellingPrice) / this.mrpPrice) * 100;
        this.discountPercent = Math.round(calculatedDiscount);
    }

    // Auto-create a default variant from legacy flat product data when variants are empty
    if (!this.variants || this.variants.length === 0)
    {
        const defaultVariantAttributes = {};
        if (this.color) defaultVariantAttributes.color = this.color;
        if (this.sizes) defaultVariantAttributes.size = this.sizes;

        const hasAttributes = Object.keys(defaultVariantAttributes).length > 0;

        if (hasAttributes || this.mrpPrice || this.sellingPrice || this.quantity)
        {
            this.variants = [{
                sku: `SKU-${String(this._id)}-DEFAULT`,
                attributes: {
                    color: this.color || undefined,
                    size: this.sizes || undefined,
                    storage: undefined,
                    ram: undefined,
                    custom: [],
                },
                price: this.sellingPrice || 0,
                mrpPrice: this.mrpPrice || 0,
                quantity: this.quantity || 0,
                reservedQuantity: this.reservedQuantity || 0,
                images: this.images || [],
                isActive: true,
            }];
        }
    }

    // Compute discountPercent for each variant
    if (this.variants && this.variants.length > 0)
    {
        for (const variant of this.variants)
        {
            if (variant.mrpPrice && variant.price)
            {
                const variantDiscount = ((variant.mrpPrice - variant.price) / variant.mrpPrice) * 100;
                variant.discountPercent = Math.round(variantDiscount);
            }
        }
    }

    next();
});

// Indexes to improve query performance.
ProductSchema.index({ category: 1 });
ProductSchema.index({ seller: 1, createdAt: -1 });
ProductSchema.index({ color: 1 });
ProductSchema.index({ sellingPrice: 1 });
ProductSchema.index({ discountPercent: 1 });
ProductSchema.index({ 'variants.sku': 1 }, { sparse: true });
ProductSchema.index({ approvalStatus: 1, isDeleted: 1 });
ProductSchema.index({ publishStatus: 1, isFeatured: 1 });
ProductSchema.index({ approvalStatus: 1, createdAt: -1 });

// Full-text search index for product title and description.
ProductSchema.index(
    { title: 'text', description: 'text' },
    { weights: { title: 10, description: 3 }, name: 'ProductTextSearchIndex' }
);

export const Product = mongoose.model('Product', ProductSchema);