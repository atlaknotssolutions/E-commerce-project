/**
 * Pure function-based factory representing the Wishlist Persistence database interface.
 * Implements loose-coupling by accepting Mongoose Model through Dependency Injection.
 */
export const createWishlistRepository = ({ Wishlist }) =>
{

    /**
     * Initializes a brand-new, empty wishlist record linked to a specific user.
     */
    const createWishlist = async ({ userId }, options = {}) =>
    {
        const [newWishlist] = await Wishlist.create([{
            user: userId,
            products: [], // Onboarding setups start with clean empty favorites arrays
        }], options);

        return newWishlist ? newWishlist.toObject() : null;
    };

    /**
     * Discovers and retrieves a customer's active wishlist based on their User ID.
     * Populates full dynamic Product details inside the products reference list.
     */
    const findByUserId = async ({ userId }, options = {}) =>
    {
        return Wishlist.findOne({ user: userId }, null, options)
            .populate({
                path: 'products',
                populate: [
                    { path: 'category' },
                    { path: 'seller', select: 'sellerName email mobile businessDetails.businessName pickupAddress' }
                ]
            })
            .lean();
    };

    /**
     * Appends a product ID atomically to the customer's favorites array.
     * Employs $addToSet to natively prevent duplicate entries.
     */
    const addProductToWishlist = async ({ userId, productId }, options = {}) =>
    {
        return Wishlist.findOneAndUpdate(
            { user: userId },
            { $addToSet: { products: productId } },
            { ...options, new: true }
        )
            .populate({
                path: 'products',
                populate: [
                    { path: 'category' },
                    { path: 'seller', select: 'sellerName email mobile businessDetails.businessName pickupAddress' }
                ]
            })
            .lean();
    };

    const removeProductFromWishlist = async ({ userId, productId }, options = {}) =>
    {
        return Wishlist.findOneAndUpdate(
            { user: userId },
            { $pull: { products: productId } },
            { ...options, new: true }
        )
            .populate({
                path: 'products',
                populate: [
                    { path: 'category' },
                    { path: 'seller', select: 'sellerName email mobile businessDetails.businessName pickupAddress' }
                ]
            })
            .lean();
    };

    return Object.freeze({
        createWishlist,
        findByUserId,
        addProductToWishlist,
        removeProductFromWishlist,
    });
};