/**
 * Pure function-based controller representing Homepage Category HTTP APIs.
 * Handles request/response lifecycle while delegating business logic to the service layer.
 */
export const createHomeCategoryController = ({
    homeCategoryService,
}) =>
{
    /**
     * POST /admin/home-categories
     */
    const createHomeCategory = async (req, res) =>
    {
        const category = await homeCategoryService.createCategory(req.body);

        return res.status(201).json({
            success: true,
            message: 'Home category created successfully.',
            data: category,
        });
    };

    /**
     * POST /admin/home-categories/bulk
     */
    const createHomeCategories = async (req, res) =>
    {
        const categories = await homeCategoryService.createCategories(req.body);

        return res.status(201).json({
            success: true,
            message: 'Home categories processed successfully.',
            data: categories,
        });
    };

    /**
     * GET /admin/home-categories
     */
    const getAllHomeCategories = async (req, res) =>
    {
        const categories = await homeCategoryService.getAllCategories();

        return res.status(200).json({
            success: true,
            data: categories,
        });
    };

    /**
     * GET /admin/home-categories/:id
     */
    const getHomeCategoryById = async (req, res) =>
    {
        const category = await homeCategoryService.getCategoryById(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            data: category,
        });
    };

    /**
     * PATCH /admin/home-categories/:id
     */
    const updateHomeCategory = async (req, res) =>
    {
        const category = await homeCategoryService.updateCategory(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: 'Home category updated successfully.',
            data: category,
        });
    };

    /**
     * DELETE /admin/home-categories/:id
     */
    const deleteHomeCategory = async (req, res) =>
    {
        const result = await homeCategoryService.deleteCategory(
            req.params.id
        );

        return res.status(200).json(result);
    };


    const updateCategoryStatus = async (req, res) =>
    {
        const category =
            await homeCategoryService.updateCategoryStatus(
                req.params.id,
                req.body.isActive
            );

        return res.status(200).json({
            success: true,
            message: "Category status updated successfully.",
            data: category,
        });
    };

    const reorderHomeCategories = async (req, res) =>
    {
        await homeCategoryService.reorderCategories(req.body);

        return res.status(200).json({
            success: true,
            message: 'Categories reordered successfully.',
        });
    };

    return Object.freeze({
        createHomeCategory,
        createHomeCategories,
        getAllHomeCategories,
        getHomeCategoryById,
        updateHomeCategory,
        updateCategoryStatus,
        deleteHomeCategory,
        reorderHomeCategories,
    });
};



// /**
//  * Pure function-based factory representing the HomeCategory HTTP Controller layer.
//  * Handles incoming HTTP requests and delegates all business logic to the service layer.
//  */
// export const createHomeCategoryController = ({
//     homeCategoryService,
// }) =>
// {

//     /**
//      * Creates a new homepage category.
//      * POST /admin/home-categories
//      */
//     const createHomeCategory = async (req, res) =>
//     {
//         const createdCategory = await homeCategoryService.createHomeCategory(
//             req.body
//         );

//         res.status(201).json(createdCategory);
//     };

//     /**
//      * Creates multiple homepage categories.
//      * POST /admin/home-categories/bulk
//      */
//     const createHomeCategories = async (req, res) =>
//     {
//         const createdCategories =
//             await homeCategoryService.createHomeCategories(req.body);

//         res.status(201).json(createdCategories);
//     };

//     /**
//      * Returns all homepage categories.
//      * GET /admin/home-categories
//      */
//     const getAllHomeCategories = async (req, res) =>
//     {
//         const categories =
//             await homeCategoryService.getAllHomeCategories();

//         res.status(200).json(categories);
//     };

//     /**
//      * Returns a homepage category by id.
//      * GET /admin/home-categories/:id
//      */
//     const getHomeCategoryById = async (req, res) =>
//     {
//         const { id } = req.params;

//         const category =
//             await homeCategoryService.getHomeCategoryById(id);

//         res.status(200).json(category);
//     };

//     /**
//      * Updates a homepage category.
//      * PATCH /admin/home-categories/:id
//      */
//     const updateHomeCategory = async (req, res) =>
//     {
//         const { id } = req.params;

//         const updatedCategory =
//             await homeCategoryService.updateHomeCategory(
//                 id,
//                 req.body
//             );

//         res.status(200).json(updatedCategory);
//     };

//     /**
//      * Deletes a homepage category.
//      * DELETE /admin/home-categories/:id
//      */
//     const deleteHomeCategory = async (req, res) =>
//     {
//         const { id } = req.params;

//         const result =
//             await homeCategoryService.deleteHomeCategory(id);

//         res.status(200).json(result);
//     };

//     return Object.freeze({
//         createHomeCategory,
//         createHomeCategories,
//         getAllHomeCategories,
//         getHomeCategoryById,
//         updateHomeCategory,
//         deleteHomeCategory,
//     });
// };