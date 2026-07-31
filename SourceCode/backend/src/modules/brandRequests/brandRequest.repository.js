/**
 * Pure function-based factory representing the BrandRequest Persistence database interface.
 * Follows the same pattern as CategoryRequestRepository for consistency.
 */
export const createBrandRequestRepository = ({ BrandRequest }) =>
{

    /**
     * Persists a new brand request document into the database.
     */
    const create = async (data, options = {}) =>
    {
        const [doc] = await BrandRequest.create([data], options);
        return doc.toObject();
    };

    /**
     * Finds a brand request by its unique database ObjectId.
     */
    const findById = async (id, options = {}) =>
    {
        return BrandRequest.findById(id, null, options)
            .populate('requestedBy', 'sellerName email businessDetails.businessName')
            .populate('brandId', 'name slug logo')
            .populate('approvedBy', 'fullName email')
            .populate('rejectedBy', 'fullName email')
            .lean();
    };

    /**
     * Returns all brand requests for a specific seller.
     */
    const findBySellerId = async (sellerId, { page = 1, limit = 20 } = {}) =>
    {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            BrandRequest.find({ requestedBy: sellerId }, null, { lean: true })
                .populate('brandId', 'name slug logo')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            BrandRequest.countDocuments({ requestedBy: sellerId }),
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
     * Finds a pending brand request with matching name and seller for duplicate detection.
     */
    const findDuplicate = async ({ sellerId, name }) =>
    {
        return BrandRequest.findOne({
            requestedBy: sellerId,
            name: { $regex: `^${name.trim()}$`, $options: 'i' },
            status: 'PENDING',
        }).lean();
    };

    /**
     * Finds if a brand with the given name already exists (active or pending).
     */
    const findByNameInBrands = async (name) =>
    {
        return BrandRequest.findOne({
            name: { $regex: `^${name.trim()}$`, $options: 'i' },
            status: 'PENDING',
        }).lean();
    };

    /**
     * Returns all brand requests with pagination, search, and status filter.
     * Used by admin for managing brand requests.
     */
    const findAll = async ({ page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = {}) =>
    {
        const filter = {};

        if (status)
        {
            filter.status = status;
        }

        if (search)
        {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { reason: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([
            BrandRequest.find(filter, null, { lean: true })
                .populate('requestedBy', 'sellerName email businessDetails.businessName')
                .populate('brandId', 'name slug logo')
                .populate('approvedBy', 'fullName email')
                .populate('rejectedBy', 'fullName email')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            BrandRequest.countDocuments(filter),
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
     * Updates a brand request document with the provided data.
     */
    const updateById = async (id, updateData, options = {}) =>
    {
        return BrandRequest.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true, ...options }
        )
            .populate('requestedBy', 'sellerName email businessDetails.businessName')
            .populate('brandId', 'name slug logo')
            .populate('approvedBy', 'fullName email')
            .populate('rejectedBy', 'fullName email')
            .lean();
    };

    /**
     * Counts pending brand requests for admin dashboard.
     */
    const countPending = async () =>
    {
        return BrandRequest.countDocuments({ status: 'PENDING' });
    };

    return Object.freeze({
        create,
        findById,
        findBySellerId,
        findDuplicate,
        findByNameInBrands,
        findAll,
        updateById,
        countPending,
    });
};
