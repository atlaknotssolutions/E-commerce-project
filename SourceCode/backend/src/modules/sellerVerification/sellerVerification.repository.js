/**
 * Pure function-based factory representing the Seller Verification Persistence layer.
 * Handles verification workflow queries with audit trail support.
 */
export const createSellerVerificationRepository = ({ Seller }) =>
{
    /**
     * Finds sellers filtered by verification status with pagination.
     */
    const findByVerificationStatus = async (
        verificationStatus,
        { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = {}
    ) =>
    {
        const filter = { verificationStatus };

        if (search && search.trim())
        {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { sellerName: regex },
                { email: regex },
                { mobile: regex },
                { 'businessDetails.businessName': regex },
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [sellers, total] = await Promise.all([
            Seller.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            Seller.countDocuments(filter),
        ]);

        return {
            sellers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    };

    /**
     * Finds pending verification sellers.
     */
    const findPendingSellers = (opts) => findByVerificationStatus('PENDING', opts);

    /**
     * Finds approved sellers.
     */
    const findApprovedSellers = (opts) => findByVerificationStatus('APPROVED', opts);

    /**
     * Finds rejected sellers.
     */
    const findRejectedSellers = (opts) => findByVerificationStatus('REJECTED', opts);

    /**
     * Finds suspended sellers (by accountStatus, not verificationStatus).
     */
    const findSuspendedSellers = async (
        { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = {}
    ) =>
    {
        const filter = { accountStatus: 'SUSPENDED' };

        if (search && search.trim())
        {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { sellerName: regex },
                { email: regex },
                { mobile: regex },
                { 'businessDetails.businessName': regex },
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [sellers, total] = await Promise.all([
            Seller.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            Seller.countDocuments(filter),
        ]);

        return { sellers, total, page, limit, totalPages: Math.ceil(total / limit) };
    };

    /**
     * Finds a single seller by ID.
     */
    const findSellerById = async (sellerId) =>
    {
        return Seller.findById(sellerId).lean();
    };

    /**
     * Updates verification status and appends audit entry to history.
     * Uses atomic $push to never overwrite existing history.
     */
    const updateVerificationStatus = async ({ sellerId, verificationStatus, accountStatus, auditEntry }) =>
    {
        const update = {
            $set: { verificationStatus },
        };

        if (accountStatus)
        {
            update.$set.accountStatus = accountStatus;
        }

        if (auditEntry)
        {
            update.$push = { verificationHistory: auditEntry };
        }

        return Seller.findByIdAndUpdate(
            sellerId,
            update,
            { new: true, runValidators: true }
        ).lean();
    };

    /**
     * Counts sellers grouped by verification and account status.
     */
    const countByVerificationStatus = async () =>
    {
        const verificationCounts = await Seller.aggregate([
            { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
        ]);

        const accountCounts = await Seller.aggregate([
            { $group: { _id: '$accountStatus', count: { $sum: 1 } } },
        ]);

        const result = {
            PENDING: 0,
            APPROVED: 0,
            REJECTED: 0,
            SELLER_SUSPENDED: 0,
            totalSellers: 0,
        };

        for (const item of verificationCounts)
        {
            if (result[item._id] !== undefined)
            {
                result[item._id] = item.count;
            }
            result.totalSellers += item.count;
        }

        for (const item of accountCounts)
        {
            if (item._id === 'SUSPENDED')
            {
                result.SELLER_SUSPENDED = item.count;
            }
        }

        return result;
    };

    return Object.freeze({
        findPendingSellers,
        findApprovedSellers,
        findRejectedSellers,
        findSuspendedSellers,
        findSellerById,
        updateVerificationStatus,
        countByVerificationStatus,
    });
};
