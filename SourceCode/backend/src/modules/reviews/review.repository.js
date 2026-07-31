/**
 * Pure function-based factory representing the Review Persistence database interface.
 * Decouples database collections lookup pipelines using Dependency Injection.
 */
export const createReviewRepository = ({ Review }) =>
{

    /**
     * Commits a new product review document directly into the database.
     */
    const create = async (reviewData, options = {}) =>
    {
        const [newReview] = await Review.create([reviewData], options);
        if (!newReview) return null;
        await newReview.populate({ path: 'user', select: 'fullName profileImage' });
        return newReview.toObject();
    };

    /**
     * Discovers a review document by its unique database ObjectId.
     */
    const findById = async (id, options = {}) =>
    {
        return Review.findById(id, null, options).lean();
    };

    /**
     * Pulls product-specific reviews list chronologically descending (newest first).
     * Populates associated customer reviewer details securely.
     */
    const findByProductId = async (productId, options = {}) =>
    {
        return Review.find({ product: productId }, null, options)
            .sort({ createdAt: -1 })
            .populate('user', 'fullName profileImage') // Populates customer details securely (Masking other private properties)
            .lean(); // Returns plain lightweight JS objects for fast memory rendering
    };

    /**
     * Discovers a specific review by customer user and product combination.
     * Used for duplicate prevention checks before creating new reviews.
     */
    const findByUserAndProduct = async ({ userId, productId }, options = {}) =>
    {
        return Review.findOne({ user: userId, product: productId }, null, options).lean();
    };

    /**
     * Pulls all reviews authored by a specific customer user, newest first.
     * Populates associated product details for display in review history.
     */
    const findByUserId = async (userId, options = {}) =>
    {
        return Review.find({ user: userId }, null, options)
            .sort({ createdAt: -1 })
            .populate('user', 'fullName profileImage')
            .populate('product', 'title images sellingPrice')
            .lean();
    };

    /**
     * Modifies an existing review document. Returns the newly updated state.
     */
    const update = async (id, updateData, options = {}) =>
    {
        const updated = await Review.findByIdAndUpdate(
            id,
            { $set: updateData },
            { ...options, new: true, runValidators: true }
        );
        if (!updated) return null;
        await updated.populate({ path: 'user', select: 'fullName profileImage' });
        return updated.toObject();
    };

    /**
     * Erases a review document permanently from the collection.
     */
    const deleteReview = async (id, options = {}) =>
    {
        return Review.findByIdAndDelete(id, options).lean();
    };

    return Object.freeze({
        create,
        findById,
        findByProductId,
        findByUserAndProduct,
        findByUserId,
        update,
        delete: deleteReview,
    });
};