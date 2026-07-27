import mongoose from 'mongoose';

/**
 * Subdocument schema for a single attribute definition supported by a category.
 * Allows categories to define which variant attributes are available
 * (e.g., Color, Size, Material, RAM, Storage) without hardcoding.
 *
 * Each attribute can be flagged as:
 *   - variantAttribute: creates separate SKU combinations
 *   - filterable: shown in customer-facing product filters
 *   - sortable: allows sorting products by this attribute
 */
const AttributeDefinitionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, 'Attribute id is required'],
        trim: true,
    },
    name: {
        type: String,
        required: [true, 'Attribute display name is required'],
        trim: true,
    },
    code: {
        type: String,
        required: [true, 'Attribute code is required'],
        trim: true,
        lowercase: true,
    },
    type: {
        type: String,
        enum: ['text', 'number', 'select', 'multi_select', 'boolean', 'color'],
        default: 'text',
    },
    required: {
        type: Boolean,
        default: false,
    },
    options: {
        type: [String],
        default: [],
    },
    sortable: {
        type: Boolean,
        default: false,
    },
    filterable: {
        type: Boolean,
        default: false,
    },
    variantAttribute: {
        type: Boolean,
        default: false,
    },
    displayOrder: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, { _id: false });

/**
 * Category schema for organizing products.
 * Supports up to 3 levels of nested categories.
 * Leaf categories (level 3) can define supportedAttributes for product variants.
 */
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category display name is required'],
        trim: true,
    },
    categoryId: {
        type: String,
        required: [true, 'URL-friendly unique business categoryId is required'],
        unique: true, // Ensures every category has a unique identifier.
        lowercase: true,
        trim: true,
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // References another category as its parent.
        default: null, // Top-level categories do not have a parent.
    },
    level: {
        type: Number,
        required: [true, 'Hierarchy structural level is required'],
        min: [1, 'Structural level cannot be less than 1'],
        max: [3, 'Structural level hierarchy cannot exceed 3'],
    },
    supportedAttributes: {
        type: [AttributeDefinitionSchema],
        default: [],
    },
}, {
    // Automatically adds createdAt and updatedAt fields.
    timestamps: true,
});

// Indexes to improve query performance.
CategorySchema.index({ level: 1 });
CategorySchema.index({ parentCategory: 1 });

export const Category = mongoose.model('Category', CategorySchema);