/**
 * Converts MongoDB HomeCategory document
 * into frontend compatible HomeCategory DTO.
 */
export const mapHomeCategory = (category) =>
{
    if (!category)
    {
        return null;
    }

    return {
        id: category._id.toString(),
        name: category.name,
        image: category.image,
        categoryId: category.categoryId,
        section: category.section,
        parentCategoryId: category.parentCategoryId || null,
        isActive: category.isActive,
        displayOrder: category.displayOrder,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
    };
};


export const mapHomeCategories = (categories = []) =>
{
    return categories.map(mapHomeCategory);
};