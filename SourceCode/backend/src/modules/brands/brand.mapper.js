export const mapBrand = (brand) =>
{
    if (!brand) return null;
    return {
        id: brand._id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description || '',
        logo: brand.logo || '',
        bannerImage: brand.bannerImage || '',
        website: brand.website || '',
        isActive: brand.isActive,
        isFeatured: brand.isFeatured,
        displayOrder: brand.displayOrder,
        categoryId: brand.categoryId || [],
        metaTitle: brand.metaTitle || '',
        metaDescription: brand.metaDescription || '',
        isDeleted: brand.isDeleted,
        deletedAt: brand.deletedAt || null,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
    };
};

export const mapBrands = (brands) =>
{
    if (!brands || !Array.isArray(brands)) return [];
    return brands.map(mapBrand);
};
