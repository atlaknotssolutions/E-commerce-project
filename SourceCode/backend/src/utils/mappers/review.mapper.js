/**
 * Maps a User/Customer reference into a frontend-friendly DTO.
 * Handles both populated (object) and non-populated (ObjectId string) values.
 */
const mapUserRef = (user) =>
{
    if (!user) return null;

    if (typeof user === "object" && user._id)
    {
        return {
            id: user._id.toString(),
            fullName: user.fullName,
        };
    }

    if (typeof user === "object" && user.id)
    {
        return {
            id: user.id.toString(),
            fullName: user.fullName,
        };
    }

    return { id: user.toString() };
};

/**
 * Maps a Product reference into a frontend-friendly DTO.
 * Handles both populated (object) and non-populated (ObjectId string) values.
 */
const mapProductRef = (product) =>
{
    if (!product) return null;

    if (typeof product === "object" && product._id)
    {
        return {
            id: product._id.toString(),
            title: product.title,
            images: product.images || [],
            sellingPrice: product.sellingPrice,
        };
    }

    return { id: product.toString() };
};

/**
 * Maps a Review document into a frontend-friendly DTO.
 * Normalizes all populated references and strips MongoDB internals.
 */
export const mapReview = (review) =>
{
    if (!review) return null;

    return {
        id: review._id?.toString(),
        reviewText: review.reviewText,
        rating: review.rating,
        productImages: review.productImages || [],
        user: mapUserRef(review.user),
        product: mapProductRef(review.product),
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
    };
};

/**
 * Maps an array of Review documents into frontend-friendly DTOs.
 */
export const mapReviews = (reviews = []) => reviews.map(mapReview);
