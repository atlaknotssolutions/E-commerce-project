export const createCategoryRequestRepository = ({ CategoryRequest }) => {
    const create = async (data) => {
        const [doc] = await CategoryRequest.create([data]);
        return doc.toObject();
    };

    const findById = async (id) => {
        return CategoryRequest.findById(id)
            .populate('seller', 'sellerName email')
            .populate('parentCategory', 'name level')
            .populate('approvedBy', 'name email')
            .populate('rejectedBy', 'name email')
            .lean();
    };

    const findBySellerId = async (sellerId) => {
        return CategoryRequest.find({ seller: sellerId })
            .populate('parentCategory', 'name level')
            .sort({ createdAt: -1 })
            .lean();
    };

    const findDuplicate = async ({ sellerId, requestedName, parentCategory }) => {
        return CategoryRequest.findOne({
            seller: sellerId,
            requestedName,
            parentCategory: parentCategory || null,
            status: 'PENDING',
        }).lean();
    };

    const findAll = async ({ status, search } = {}) => {
        const filter = {};
        if (status) filter.status = status;
        if (search) {
            filter.requestedName = { $regex: search, $options: 'i' };
        }
        return CategoryRequest.find(filter)
            .populate('seller', 'sellerName email')
            .populate('parentCategory', 'name level')
            .populate('approvedBy', 'name email')
            .populate('rejectedBy', 'name email')
            .sort({ createdAt: -1 })
            .lean();
    };

    const updateById = async (id, updateData) => {
        return CategoryRequest.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('seller', 'sellerName email')
            .populate('parentCategory', 'name level')
            .populate('approvedBy', 'name email')
            .populate('rejectedBy', 'name email')
            .lean();
    };

    return Object.freeze({
        create,
        findById,
        findBySellerId,
        findDuplicate,
        findAll,
        updateById,
    });
};
