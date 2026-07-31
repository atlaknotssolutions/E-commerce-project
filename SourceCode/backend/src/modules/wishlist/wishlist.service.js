/**
 * Pure function-based factory representing the Wishlist Business Service layer.
 * Coordinates user favorites retrievals and implements seamless members toggling logic.
 */
export const createWishlistService = ({
    wishlistRepository,
    productRepository,
    mapProduct,
    mapProducts,
    createApiError
}) =>
{

    /**
     * Discovers and retrieves a customer's active wishlist.
     * Lazy-initializes a new blank wishlist document atomically if absent.
     */
    const getOrCreateWishlist = async ({ userId }) =>
    {
        let wishlist = await wishlistRepository.findByUserId({ userId });

        // Lazy Onboarding Initialization: If wishlist record is missing, build it immediately
        if (!wishlist)
        {
            await wishlistRepository.createWishlist({ userId });
            wishlist = await wishlistRepository.findByUserId({ userId });
        }

        if (wishlist && wishlist.products)
        {
            wishlist.products = mapProducts(wishlist.products);
        }

        return wishlist;
    };

    /**
     * Toggles product membership inside customer's wishlist.
     * Pulls/Removes item if already present, otherwise Pushes/Adds item cleanly.
     */
    const toggleProductInWishlist = async ({ userId, productId }) =>
    {

        // 1. Core Validation: Ensure targeted product exists in catalogue registries
        const product = await productRepository.findById(productId);
        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'Wishlist toggle failed. The requested product listing does not exist.'
            });
        }

        // 2. Fetch or initialize active user wishlist container
        const wishlist = await getOrCreateWishlist({ userId });

        // 3. Evaluate if targeted product is currently saved in favorites array
        const isCurrentlySaved = wishlist.products.some(
            (savedProduct) => savedProduct._id.toString() === productId.toString()
        );

        let updatedWishlist = null;

        if (isCurrentlySaved)
        {
            updatedWishlist = await wishlistRepository.removeProductFromWishlist({ userId, productId });
        } else
        {
            updatedWishlist = await wishlistRepository.addProductToWishlist({ userId, productId });
        }

        if (updatedWishlist && updatedWishlist.products)
        {
            updatedWishlist.products = mapProducts(updatedWishlist.products);
        }

        return updatedWishlist;
    };

    return Object.freeze({
        getOrCreateWishlist,
        toggleProductInWishlist,
    });
};