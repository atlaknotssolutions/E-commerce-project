import express from "express";

export const createCategoryRoutes = ({
    categoryController,
    asyncHandler,
}) =>
{
    const router = express.Router();

    /**
     * GET /categories?level=1
     * GET /categories?level=2
     * GET /categories?level=3
     */


    /**
 * Returns complete category hierarchy.
 * Public API
 */
    router.get(
        '/tree',
        asyncHandler(categoryController.getCategoryTree)
    );

    router.get(
        "/",
        asyncHandler(categoryController.getCategoriesByLevel)
    );

    return router;
};