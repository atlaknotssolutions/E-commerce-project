export const mapCategory = (category) =>
{
    if (!category) return null;

    return {
        id: category._id.toString(),
        name: category.name,
        categoryId: category.categoryId,
        level: category.level,
        parentCategory: mapCategory(category.parentCategory),
        supportedAttributes: category.supportedAttributes || [],
    };
};

const mapVariant = (variant) =>
{
    if (!variant) return null;

    const attrs = variant.attributes || {};

    return {
        id: variant._id ? variant._id.toString() : variant.id,
        sku: variant.sku,
        attributes: {
            color: attrs.color,
            size: attrs.size,
            storage: attrs.storage,
            ram: attrs.ram,
            custom: attrs.custom || [],
            dynamic: attrs.dynamic || [],
        },
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

    const mappedVariants = product.variants
        ? product.variants.map(mapVariant)
        : [];

    const activeVariants = mappedVariants.filter((v) => v && v.isActive);
    const prices = activeVariants.length > 0
        ? activeVariants.map((v) => v.price).filter((p) => typeof p === 'number' && p > 0)
        : [];

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

        variants: mappedVariants,

        minPrice: prices.length > 0 ? Math.min(...prices) : product.sellingPrice || 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : product.sellingPrice || 0,
        variantCount: activeVariants.length,
    };
};

export const mapProducts = (products = []) =>
    products.map(mapProduct);