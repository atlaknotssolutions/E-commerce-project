/**
 * Pure function-based factory representing the Product Moderation Persistence layer.
 * Handles product approval workflow queries with audit trail support.
 */
export const createProductModerationRepository = ({ Product, Seller }) =>
{
    /**
     * Finds products filtered by approval status with pagination.
     */
    const findByApprovalStatus = async (
        approvalStatus,
        { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = {}
    ) =>
    {
        const filter = { approvalStatus, isDeleted: false };

        if (search && search.trim())
        {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { title: regex },
                { brand: regex },
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('category')
                .populate({
                    path: 'seller',
                    select: 'sellerName email businessDetails.businessName',
                })
                .lean(),
            Product.countDocuments(filter),
        ]);

        return {
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    };

    const findPendingProducts = (opts) => findByApprovalStatus('PENDING', opts);
    const findApprovedProducts = (opts) => findByApprovalStatus('APPROVED', opts);
    const findRejectedProducts = (opts) => findByApprovalStatus('REJECTED', opts);

    /**
     * Finds products filtered by publish status with pagination.
     */
    const findByPublishStatus = async (
        publishStatus,
        { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = {}
    ) =>
    {
        const filter = { publishStatus, isDeleted: false };

        if (search && search.trim())
        {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { title: regex },
                { brand: regex },
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('category')
                .populate({
                    path: 'seller',
                    select: 'sellerName email businessDetails.businessName',
                })
                .lean(),
            Product.countDocuments(filter),
        ]);

        return {
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    };

    const findPublishedProducts = (opts) => findByPublishStatus('PUBLISHED', opts);
    const findUnpublishedProducts = (opts) => findByPublishStatus('UNPUBLISHED', opts);

    /**
     * Finds featured products with pagination.
     */
    const findFeaturedProducts = async (
        { page = 1, limit = 20, search, sortBy = 'featuredAt', sortOrder = 'desc' } = {}
    ) =>
    {
        const filter = { isFeatured: true, isDeleted: false };

        if (search && search.trim())
        {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { title: regex },
                { brand: regex },
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('category')
                .populate({
                    path: 'seller',
                    select: 'sellerName email businessDetails.businessName',
                })
                .lean(),
            Product.countDocuments(filter),
        ]);

        return {
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    };

    /**
     * Finds all products (for moderation overview) with pagination.
     * Excludes soft-deleted products.
     */
    const findAllProducts = async (
        { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', approvalStatus, publishStatus } = {}
    ) =>
    {
        const filter = { isDeleted: false };

        if (approvalStatus)
        {
            filter.approvalStatus = approvalStatus;
        }
        if (publishStatus)
        {
            filter.publishStatus = publishStatus;
        }

        if (search && search.trim())
        {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { title: regex },
                { brand: regex },
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('category')
                .populate({
                    path: 'seller',
                    select: 'sellerName email businessDetails.businessName',
                })
                .lean(),
            Product.countDocuments(filter),
        ]);

        return {
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    };

    /**
     * Finds a single product by ID with populated references.
     */
    const findProductById = async (productId) =>
    {
        return Product.findById(productId)
            .populate('category')
            .populate({
                path: 'seller',
                select: 'sellerName email mobile businessDetails.businessName businessDetails.businessAddress',
            })
            .lean();
    };

    /**
     * Updates product moderation fields and appends audit entry to moderation history.
     * Uses atomic $push to never overwrite existing history.
     */
    const updateModerationStatus = async ({ productId, approvalStatus, publishStatus, isFeatured, featuredAt, auditEntry }) =>
    {
        const update = { $set: {} };

        if (approvalStatus !== undefined)
        {
            update.$set.approvalStatus = approvalStatus;
        }
        if (publishStatus !== undefined)
        {
            update.$set.publishStatus = publishStatus;
        }
        if (isFeatured !== undefined)
        {
            update.$set.isFeatured = isFeatured;
        }
        if (featuredAt !== undefined)
        {
            update.$set.featuredAt = featuredAt;
        }

        if (auditEntry)
        {
            update.$push = { moderationHistory: auditEntry };
        }

        return Product.findByIdAndUpdate(
            productId,
            update,
            { new: true, runValidators: true }
        )
            .populate('category')
            .populate({
                path: 'seller',
                select: 'sellerName email businessDetails.businessName',
            })
            .lean();
    };

    /**
     * Soft-deletes a product by setting isDeleted and deletedAt.
     */
    const softDeleteProduct = async ({ productId, adminId, reason, auditEntry }) =>
    {
        const update = {
            $set: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        };

        if (auditEntry)
        {
            update.$push = { moderationHistory: auditEntry };
        }

        return Product.findByIdAndUpdate(
            productId,
            update,
            { new: true, runValidators: true }
        ).lean();
    };

    /**
     * Counts products grouped by approval status for dashboard stats.
     */
    const countByModerationStatus = async () =>
    {
        const approvalCounts = await Product.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$approvalStatus', count: { $sum: 1 } } },
        ]);

        const publishCounts = await Product.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$publishStatus', count: { $sum: 1 } } },
        ]);

        const featuredCount = await Product.countDocuments({ isFeatured: true, isDeleted: false });

        const result = {
            PENDING: 0,
            APPROVED: 0,
            REJECTED: 0,
            DRAFT: 0,
            PUBLISHED: 0,
            UNPUBLISHED: 0,
            featured: featuredCount,
            totalProducts: 0,
        };

        for (const item of approvalCounts)
        {
            if (result[item._id] !== undefined)
            {
                result[item._id] = item.count;
            }
            result.totalProducts += item.count;
        }

        for (const item of publishCounts)
        {
            if (result[item._id] !== undefined)
            {
                result[item._id] = item.count;
            }
        }

        return result;
    };

    /**
     * Finds a seller by ID (for notification target resolution).
     */
    const findSellerById = async (sellerId) =>
    {
        return Seller.findById(sellerId).lean();
    };

    return Object.freeze({
        findPendingProducts,
        findApprovedProducts,
        findRejectedProducts,
        findPublishedProducts,
        findUnpublishedProducts,
        findFeaturedProducts,
        findAllProducts,
        findProductById,
        updateModerationStatus,
        softDeleteProduct,
        countByModerationStatus,
        findSellerById,
    });
};
