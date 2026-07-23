import
{
    mapHomeCategory,
    mapHomeCategories,
} from '../../utils/mappers/homeCategory.mapper.js';

import
{
    HOME_PAGE_SECTIONS,
    HOME_PAGE_SECTION_VALUES,
    HOME_PAGE_SECTION_LIMITS,
} from '../../constants/enums.js';


/**
 * Pure function-based service representing Home Category business operations.
 * Encapsulates all business rules related to homepage category management.
 */
export const createHomeCategoryService = ({
    homeCategoryRepository,
    createApiError,
}) =>
{


    const validateSection = (section) =>
    {
        if (!HOME_PAGE_SECTION_VALUES.includes(section))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_HOME_SECTION',
                message: `Invalid homepage section: ${section}`,
            });
        }
    };
    /**
     * Creates a single home category.
     */
    const createCategory = async (payload) =>
    {
        validateSection(payload.section);

        const sectionCount = await homeCategoryRepository.countBySection(payload.section);
        const limit = HOME_PAGE_SECTION_LIMITS[payload.section];

        if (limit !== undefined && sectionCount >= limit)
        {
            throw createApiError({
                statusCode: 400,
                code: 'SECTION_LIMIT_REACHED',
                message: `Maximum items reached for the ${payload.section} section (limit: ${limit}).`,
            });
        }

        const existing = await homeCategoryRepository.findByCategoryIdAndSection(
            payload.categoryId,
            payload.section
        );

        if (existing)
        {
            throw createApiError({
                statusCode: 409,
                code: 'DUPLICATE_HOME_CATEGORY',
                message:
                    `Category "${payload.name || existing.name}" already exists in the ${payload.section} section.`,
            });
        }

        const category = await homeCategoryRepository.create(payload);

        return mapHomeCategory(category);
    };

    /**
     * Creates multiple home categories only if collection is empty.
     */
    const createCategories = async (payload) =>
    {
        payload.forEach((item) => validateSection(item.section));

        const alreadyExists = await homeCategoryRepository.exists();

        if (!alreadyExists)
        {
            const categories = await homeCategoryRepository.createMany(payload);

            return mapHomeCategories(categories);
        }

        const categories = await homeCategoryRepository.findAll();

        return mapHomeCategories(categories);
    };

    /**
     * Returns all homepage categories.
     */
    const getAllCategories = async () =>
    {
        const categories = await homeCategoryRepository.findAll();

        return mapHomeCategories(categories);
    };

    /**
     * Returns a single homepage category.
     */
    const getCategoryById = async (id) =>
    {
        const category = await homeCategoryRepository.findById(id);

        if (!category)
        {
            throw createApiError({
                statusCode: 404,
                code: 'HOME_CATEGORY_NOT_FOUND',
                message: 'Home category not found.',
            });
        }

        return mapHomeCategory(category);
    };

    /**
     * Updates a homepage category.
     */
    const updateCategory = async (id, payload) =>
    {
        await getCategoryById(id);

        if (payload.section)
        {
            validateSection(payload.section);
        }

        const updated = await homeCategoryRepository.update(id, payload);

        return mapHomeCategory(updated);
    };

    /**
     * Deletes a homepage category.
     */
    const deleteCategory = async (id) =>
    {
        await getCategoryById(id);

        await homeCategoryRepository.remove(id);

        return {
            success: true,
            message: 'Home category deleted successfully.',
        };
    };

    const updateCategoryStatus = async (id, isActive) =>
    {
        await getCategoryById(id);

        const updated = await homeCategoryRepository.updateStatus(
            id,
            isActive
        );

        return mapHomeCategory(updated);
    };

    const reorderCategories = async (items) =>
    {
        if (!Array.isArray(items) || items.length === 0)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_REORDER_PAYLOAD',
                message: 'Reorder payload must be a non-empty array.',
            });
        }

        await homeCategoryRepository.bulkUpdateOrder(items);
    };

    return Object.freeze({
        createCategory,
        createCategories,
        getAllCategories,
        getCategoryById,
        updateCategory,
        updateCategoryStatus,
        deleteCategory,
        reorderCategories,
    });
};



// /**
//  * Pure function-based factory representing the HomeCategory Business Service layer.
//  * Encapsulates all business rules for homepage category management while delegating
//  * persistence responsibilities to the repository layer.
//  */
// export const createHomeCategoryService = ({
//     homeCategoryRepository,
//     createApiError,
// }) =>
// {

//     /**
//      * Creates a new homepage category.
//      */
//     const createHomeCategory = async (payload) =>
//     {
//         if (!payload)
//         {
//             throw createApiError({
//                 statusCode: 400,
//                 code: 'INVALID_REQUEST',
//                 message: 'Home category payload is required.',
//             });
//         }

//         return homeCategoryRepository.create(payload);
//     };

//     /**
//      * Creates multiple homepage categories.
//      */
//     const createHomeCategories = async (payload) =>
//     {
//         if (!Array.isArray(payload) || payload.length === 0)
//         {
//             throw createApiError({
//                 statusCode: 400,
//                 code: 'INVALID_CATEGORY_LIST',
//                 message: 'Category list must be a non-empty array.',
//             });
//         }

//         // Uses bulk insert if repository supports it.
//         if (typeof homeCategoryRepository.createMany === 'function')
//         {
//             return homeCategoryRepository.createMany(payload);
//         }

//         // Fallback for older repository implementations.
//         const createdCategories = [];

//         for (const category of payload)
//         {
//             const created = await homeCategoryRepository.create(category);
//             createdCategories.push(created);
//         }

//         return createdCategories;
//     };

//     /**
//      * Returns all homepage categories.
//      */
//     const getAllHomeCategories = async () =>
//     {
//         const categories = await homeCategoryRepository.findAll();

// return mapHomeCategories(categories);
//     };

//     /**
//      * Returns a homepage category by id.
//      */
//     const getHomeCategoryById = async (id) =>
//     {
//         const category = await homeCategoryRepository.findById(id);

//         if (!category)
//         {
//             throw createApiError({
//                 statusCode: 404,
//                 code: 'HOME_CATEGORY_NOT_FOUND',
//                 message: 'Requested homepage category does not exist.',
//             });
//         }

//         return category;
//     };

//     /**
//      * Updates an existing homepage category.
//      */
//     const updateHomeCategory = async (id, payload) =>
//     {
//         await getHomeCategoryById(id);

//         return homeCategoryRepository.update(id, payload);
//     };

//     /**
//      * Deletes a homepage category.
//      */
//     const deleteHomeCategory = async (id) =>
//     {
//         const category = await getHomeCategoryById(id);

//         await homeCategoryRepository.deleteById(id);

//         return {
//             message: 'Homepage category deleted successfully.',
//             deletedCategory: category,
//         };
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