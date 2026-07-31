/**
 * Pure function-based controller representing Category HTTP APIs.
 * Handles request/response lifecycle while delegating business logic to the service layer.
 */
export const createCategoryController = ({
    categoryService,
    asyncHandler,
}) =>
{
    /**
     * GET /categories
     * Example:
     * /categories?level=1
     */
    const getCategoriesByLevel = async (req, res) =>
    {
        const categories =
            await categoryService.getCategoriesByLevel({
                level: req.query.level,
                parentId: req.query.parentId,
            });

        return res.status(200).json({
            success: true,
            data: categories,
        });
    };

    /**
 * Returns complete category hierarchy.
 * Supports optional sellerId filter to show only categories with seller's products.
 */
    const getCategoryTree = asyncHandler(async (req, res) =>
    {
        const { sellerId } = req.query;

        const tree =
            await categoryService.getCategoryTree({ sellerId });

        return res.status(200).json({
            success: true,
            message: 'Category tree fetched successfully.',
            data: tree,
        });

    });

    /**
     * GET /admin/categories
     */
    const getAllCategories = async (req, res) =>
    {
        const categories = await categoryService.getAllCategories();

        return res.status(200).json({
            success: true,
            data: categories,
        });
    };

    /**
     * GET /admin/categories/:id
     */
    const getCategoryById = async (req, res) =>
    {
        const category = await categoryService.getCategoryById(req.params.id);

        return res.status(200).json({
            success: true,
            data: category,
        });
    };

    /**
     * POST /admin/categories
     */
    const createCategory = async (req, res) =>
    {
        const { name, parentCategory, level, supportedAttributes } = req.body;

        const category = await categoryService.createCategory({
            name,
            parentCategory,
            level,
            supportedAttributes,
        });

        return res.status(201).json({
            success: true,
            message: 'Category created successfully.',
            data: category,
        });
    };

    /**
     * PATCH /admin/categories/:id
     */
    const updateCategory = async (req, res) =>
    {
        const category = await categoryService.updateCategory(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: 'Category updated successfully.',
            data: category,
        });
    };

    /**
     * DELETE /admin/categories/:id
     */
    const deleteCategory = async (req, res) =>
    {
        const result = await categoryService.deleteCategory(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully.',
        });
    };

    return Object.freeze({
        getCategoriesByLevel,
        getCategoryTree,
        getAllCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
    });
};