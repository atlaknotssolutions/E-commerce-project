/**
 * Pure function-based factory representing the Coupon Persistence database interface.
 * Decouples database collections lookup pipelines using Dependency Injection.
 */
export const createCouponRepository = ({ Coupon }) =>
{

    /**
     * Discovers a promotional coupon document matching its unique code.
     * Normalizes casing internally prior to lookup execution.
     */
    const findByCode = async (code, options = {}) =>
    {
        return Coupon.findOne(
            { code: code.toUpperCase().trim() },
            null, // Fetch complete fields mappings
            options
        ).lean(); // Returns weightless standard plain Javascript memory objects
    };

    /**
     * Persists a new administrative coupon document under database.
     * Supports array-wrap configurations to run smoothly inside transactions.
     */
    const createCoupon = async (couponData, options = {}) =>
    {
        const [newCoupon] = await Coupon.create([couponData], options);
        return newCoupon ? newCoupon.toObject() : null;
    };

    /**
     * Pulls all registered coupons, sorted descending chronologically (newest first).
     * Used exclusively by system admins for analytical tables view.
     */
    const findAllCoupons = async (options = {}) =>
    {
        return Coupon.find({}, null, options)
            .sort({ createdAt: -1 })
            .lean();
    };

    /**
     * Erases a promo-code document permanently from the collection.
     */
    const deleteCoupon = async (id, options = {}) =>
    {
        return Coupon.findByIdAndDelete(id, options).lean();
    };

    // ==========================================
    // ADMIN-SPECIFIC QUERIES
    // ==========================================

    /**
     * Discovers a single coupon document by its unique database ObjectId.
     */
    const findById = async (id, options = {}) =>
    {
        return Coupon.findById(id, null, options).lean();
    };

    /**
     * Updates a coupon document with the provided data.
     */
    const updateCoupon = async (id, updateData, options = {}) =>
    {
        return Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true, ...options }).lean();
    };

    /**
     * Discovers all coupons with search, filters, and pagination.
     */
    const findAllWithFilters = async ({ page = 1, limit = 20, search, isActive, discountType, sortBy = 'createdAt', sortOrder = 'desc' } = {}) =>
    {
        const filter = {};

        if (isActive !== undefined && isActive !== null && isActive !== '')
        {
            filter.isActive = isActive === 'true' || isActive === true;
        }
        if (discountType)
        {
            filter.discountType = discountType;
        }
        if (search)
        {
            filter.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([
            Coupon.find(filter, null, { lean: true })
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Coupon.countDocuments(filter),
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
     * Counts coupons grouped by status for analytics.
     */
    const countByStatus = async () =>
    {
        const now = new Date();
        const [activeCount, expiredCount, disabledCount, totalCount] = await Promise.all([
            Coupon.countDocuments({ isActive: true, validityEndDate: { $gte: now } }),
            Coupon.countDocuments({ validityEndDate: { $lt: now } }),
            Coupon.countDocuments({ isActive: false }),
            Coupon.countDocuments(),
        ]);

        return {
            active: activeCount,
            expired: expiredCount,
            disabled: disabledCount,
            total: totalCount,
        };
    };

    /**
     * Returns the most used coupon.
     */
    const findMostUsedCoupon = async () =>
    {
        return Coupon.findOne({ usageCount: { $gt: 0 } })
            .sort({ usageCount: -1 })
            .lean();
    };

    /**
     * Returns aggregated usage statistics.
     */
    const getUsageStats = async () =>
    {
        const stats = await Coupon.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsageCount: { $sum: '$usageCount' },
                    avgUsageCount: { $avg: '$usageCount' },
                },
            },
        ]);
        return stats[0] || { totalUsageCount: 0, avgUsageCount: 0 };
    };

    /**
     * Returns usage history for a specific coupon.
     */
    const findUsageById = async (couponId) =>
    {
        return Coupon.findById(couponId, 'code usageCount usedByUsers')
            .populate('usedByUsers', 'fullName email mobile')
            .lean();
    };

    return Object.freeze({
        findByCode,
        createCoupon,
        findAllCoupons,
        deleteCoupon,
        findById,
        updateCoupon,
        findAllWithFilters,
        countByStatus,
        findMostUsedCoupon,
        getUsageStats,
        findUsageById,
    });
};