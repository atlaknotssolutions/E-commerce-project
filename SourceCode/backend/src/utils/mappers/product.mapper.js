export const mapCategory = (category) =>
{
    if (!category) return null;

    return {
        id: category._id.toString(),
        name: category.name,
        categoryId: category.categoryId,
        level: category.level,
        parentCategory: mapCategory(category.parentCategory),
    };
};

const mapVariant = (variant) =>
{
    if (!variant) return null;

    return {
        id: variant._id ? variant._id.toString() : variant.id,
        sku: variant.sku,
        attributes: variant.attributes || {},
        price: variant.price,
        mrpPrice: variant.mrpPrice,
        discountPercent: variant.discountPercent || 0,
        quantity: variant.quantity,
        images: variant.images || [],
        weight: variant.weight,
        isActive: variant.isActive !== undefined ? variant.isActive : true,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
    };
};

export const mapProduct = (product) =>
{
    if (!product) return null;

    return {
        ...product,

        id: product._id.toString(),

        category: mapCategory(product.category),

        seller: product.seller
            ? {
                ...product.seller,
                id: product.seller._id.toString(),
            }
            : null,

        variants: product.variants
            ? product.variants.map(mapVariant)
            : [],
    };
};

export const mapProducts = (products = []) =>
    products.map(mapProduct);