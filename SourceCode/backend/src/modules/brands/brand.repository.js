/**
 * Pure function-based factory representing the Brand Persistence database interface.
 * Strictly abstracts query pipelines from business levels utilizing Dependency Injection.
 */
export const createBrandRepository = ({ Brand, Product }) =>
{

    /**
     * Commits a new brand document into the database.
     * Supports array-wrap formats to execute flawlessly within atomic transaction sessions.
     */
    const create = async (brandData, options = {}) =>
    {
        const [newBrand] = await Brand.create([brandData], options);
        return newBrand ? newBrand.toObject() : null;
    };

    /**
     * Discovers a brand document by its unique database ObjectId.
     */
    const findById = async (id, options = {}) =>
    {
        return Brand.findById(id, null, options)
            .populate('categoryId', 'name categoryId level')
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email')
            .lean();
    };

    /**
     * Discovers a brand document matching its URL-friendly slug identifier.
     */
    const findBySlug = async (slug, options = {}) =>
    {
        return Brand.findOne(
            { slug: slug.toLowerCase().trim() },
            null,
            options
        ).lean();
    };

    /**
     * Finds a brand by its display name (case-insensitive).
     */
    const findByName = async (name, options = {}) =>
    {
        return Brand.findOne(
            { name: { $regex: `^${name.trim()}$`, $options: 'i' } },
            null,
            options
        ).lean();
    };

    /**
     * Finds a brand by exact name for uniqueness validation.
     */
    const findByNameExact = async (name, excludeId = null, options = {}) =>
    {
        const query = {
            name: { $regex: `^${name.trim()}$`, $options: 'i' },
            isDeleted: false,
        };

        if (excludeId)
        {
            query._id = { $ne: excludeId };
        }

        return Brand.findOne(query, null, options).lean();
    };

    /**
     * Returns all active, non-deleted brands for public and seller views.
     * Supports category filtering and text search.
     */
    const findActive = async ({ page = 1, limit = 20, search, categoryId } = {}) =>
    {
        const filter = { isActive: true, isDeleted: false };

        if (search)
        {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (categoryId)
        {
            filter.categoryId = categoryId;
        }

        const skip = (page - 1) * limit;
        const sort = { displayOrder: 1, name: 1 };

        const [data, total] = await Promise.all([
            Brand.find(filter, null, { lean: true })
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Brand.countDocuments(filter),
        ]);

        return {
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    };

    /**
     * Returns featured brands for homepage display.
     */
    const findFeatured = async ({ limit = 10 } = {}) =>
    {
        return Brand.find(
            { isFeatured: true, isActive: true, isDeleted: false },
            null,
            { lean: true }
        )
            .sort({ displayOrder: 1, name: 1 })
            .limit(limit);
    };

    /**
     * Returns all brands for admin view with pagination, search, and filters.
     */
    const findAll = async ({ page = 1, limit = 20, search, isActive, isFeatured, isDeleted, sortBy = 'createdAt', sortOrder = 'desc' } = {}) =>
    {
        const filter = {};

        if (isActive !== undefined && isActive !== null && isActive !== '')
        {
            filter.isActive = isActive === 'true' || isActive === true;
        }

        if (isFeatured !== undefined && isFeatured !== null && isFeatured !== '')
        {
            filter.isFeatured = isFeatured === 'true' || isFeatured === true;
        }

        if (isDeleted !== undefined && isDeleted !== null && isDeleted !== '')
        {
            filter.isDeleted = isDeleted === 'true' || isDeleted === true;
        } else
        {
            // Default: exclude deleted brands
            filter.isDeleted = false;
        }

        if (search)
        {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([
            Brand.find(filter, null, { lean: true })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('categoryId', 'name categoryId level')
                .populate('createdBy', 'fullName email')
                .populate('updatedBy', 'fullName email'),
            Brand.countDocuments(filter),
        ]);

        return {
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    };

    /**
     * Updates a brand document with the provided data.
     */
    const update = async (id, updateData, options = {}) =>
    {
        return Brand.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true, ...options }
        )
            .populate('categoryId', 'name categoryId level')
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email')
            .lean();
    };

    /**
     * Toggles the active status of a brand.
     */
    const updateStatus = async (id, isActive, options = {}) =>
    {
        return Brand.findByIdAndUpdate(
            id,
            { $set: { isActive } },
            { new: true, runValidators: true, ...options }
        ).lean();
    };

    /**
     * Toggles the featured status of a brand.
     */
    const updateFeatured = async (id, isFeatured, options = {}) =>
    {
        return Brand.findByIdAndUpdate(
            id,
            { $set: { isFeatured } },
            { new: true, runValidators: true, ...options }
        ).lean();
    };

    /**
     * Updates the display order of a brand.
     */
    const updateDisplayOrder = async (id, displayOrder, options = {}) =>
    {
        return Brand.findByIdAndUpdate(
            id,
            { $set: { displayOrder } },
            { new: true, runValidators: true, ...options }
        ).lean();
    };

    /**
     * Soft-deletes a brand by setting isDeleted and deletedAt.
     */
    const softDelete = async (id, options = {}) =>
    {
        return Brand.findByIdAndUpdate(
            id,
            { $set: { isDeleted: true, deletedAt: new Date() } },
            { new: true, runValidators: true, ...options }
        ).lean();
    };

    /**
     * Restores a soft-deleted brand.
     */
    const restore = async (id, options = {}) =>
    {
        return Brand.findByIdAndUpdate(
            id,
            { $set: { isDeleted: false, deletedAt: null } },
            { new: true, runValidators: true, ...options }
        ).lean();
    };

    /**
     * Permanently deletes a brand from the database.
     */
    const hardDelete = async (id, options = {}) =>
    {
        return Brand.findByIdAndDelete(id, options).lean();
    };

    /**
     * Counts products referencing a specific brand.
     * Used to prevent hard deletion of brands with existing products.
     */
    const countProducts = async (brandId) =>
    {
        return Product.countDocuments({ brand: brandId });
    };

    /**
     * Aggregates brand statistics for admin dashboard.
     */
    const getStats = async () =>
    {
        const [total, active, featured, deleted] = await Promise.all([
            Brand.countDocuments({ isDeleted: false }),
            Brand.countDocuments({ isActive: true, isDeleted: false }),
            Brand.countDocuments({ isFeatured: true, isDeleted: false }),
            Brand.countDocuments({ isDeleted: true }),
        ]);

        return {
            total,
            active,
            featured,
            inactive: total - active,
            deleted,
        };
    };

    /**
     * Full-text keyword search for brands.
     * Leverages MongoDB native $text index matching with text score relevance rankings.
     */
    const search = async ({ query, page = 1, limit = 20 }) =>
    {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Brand.find(
                { $text: { $search: query }, isDeleted: false },
                { score: { $meta: 'textScore' } }
            )
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(limit)
                .lean(),
            Brand.countDocuments(
                { $text: { $search: query }, isDeleted: false }
            ),
        ]);

        return {
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    };

    return Object.freeze({
        create,
        findById,
        findBySlug,
        findByName,
        findByNameExact,
        findActive,
        findFeatured,
        findAll,
        update,
        updateStatus,
        updateFeatured,
        updateDisplayOrder,
        softDelete,
        restore,
        hardDelete,
        countProducts,
        getStats,
        search,
    });
};
