import { HOME_PAGE_SECTIONS } from '../../constants/enums.js';
import { mapHomeCategories } from '../../utils/mappers/homeCategory.mapper.js';
import { mapDeals } from '../../utils/mappers/deal.mapper.js';

/**
 * Pure function-based service representing Homepage business operations.
 * Responsible only for composing homepage response payload.
 */
export const createHomeService = ({
    homeCategoryRepository,
    dealRepository,
}) =>
{
    /**
     * Builds homepage payload.
     */
    const getHomePageData = async () =>
    {
        const categories = await homeCategoryRepository.findAll();

        // const deals = await dealRepository.findAllWithHomeCategory();
        const deals = await dealRepository.findAll();

        const grid = categories.filter(
            (item) => item.section === HOME_PAGE_SECTIONS.GRID
        );

        const shopByCategories = categories.filter(
            (item) => item.section === HOME_PAGE_SECTIONS.SHOP_BY_CATEGORIES
        );

        const electricCategories = categories.filter(
            (item) => item.section === HOME_PAGE_SECTIONS.ELECTRIC_CATEGORIES
        );

        const dealCategories = categories.filter(
            (item) => item.section === HOME_PAGE_SECTIONS.DEALS
        );

        return {
            grid: mapHomeCategories(grid),

            shopByCategories: mapHomeCategories(shopByCategories),

            electricCategories: mapHomeCategories(electricCategories),

            dealCategories: mapHomeCategories(dealCategories),

            deals: mapDeals(deals),
        };
    };

    return Object.freeze({
        getHomePageData,
    });
};




// /**
//  * Pure function-based factory representing the Home Merchandising Business Service layer.
//  * Coordinates dynamic landing page configurations and aggregates multi-section parameters concurrently.
//  */
// export const createHomeService = ({
//     homeCategoryRepository,
//     dealRepository,
//     createApiError,
// }) =>
// {

//     /**
//      * Administrative CRUD: Onboards a list of home categories merchandising banners.
//      */
//     const createHomeCategories = async (categoryList) =>
//     {
//         if (!Array.isArray(categoryList) || categoryList.length === 0)
//         {
//             throw createApiError({
//                 statusCode: 400,
//                 code: 'INVALID_CATEGORY_LIST',
//                 message: 'Onboarding failed. Category list payload must be a non-empty array.'
//             });
//         }

//         const savedList = [];

//         // Commits individual items sequentially into the database
//         for (const item of categoryList)
//         {
//             const savedItem = await homeCategoryRepository.create(item);
//             savedList.push(savedItem);
//         }

//         return savedList;
//     };

//     /**
//      * Public Landing Page Aggregator.
//      * Pulls all required sections and deals concurrently using parallel database cursor streams.
//      */
//     const getHomePageData = async () =>
//     {
//         try
//         {
//             // Parallel execution pipeline (Saves immense server execution overhead)
//             const [
//                 gridCategories,
//                 electricCategories,
//                 shopByCategories,
//                 deals
//             ] = await Promise.all([
//                 homeCategoryRepository.findBySection('GRID'),
//                 homeCategoryRepository.findBySection('ELECTRIC_CATEGORIES'),
//                 homeCategoryRepository.findBySection('SHOP_BY_CATEGORIES'),
//                 dealRepository.findAll()
//             ]);

//             // Returns compiled unified payload exactly matching React UI expectations
//             return {
//                 gridCategories,
//                 electricCategories,
//                 shopByCategories,
//                 deals,
//             };
//         } catch (error)
//         {
//             console.error('[HOMEPAGE COMPILATION EXCEPTION] Failed to aggregate resources:', error.message);
//             throw createApiError({
//                 statusCode: 500,
//                 code: 'HOMEPAGE_COMPILATION_FAILED',
//                 message: 'An unexpected error occurred while compiling the homepage layout.'
//             });
//         }
//     };


//     /**
//  * Administrative CRUD: Returns all homepage categories.
//  */
//     const getAllHomeCategories = async () =>
//     {
//         return homeCategoryRepository.findAll();
//     };

//     /**
//      * Administrative CRUD: Updates a homepage category.
//      */
//     const updateHomeCategory = async (id, payload) =>
//     {
//         return homeCategoryRepository.update(id, payload);
//     };

//     return Object.freeze({
//         createHomeCategories,
//         getHomePageData,
//         getAllHomeCategories,
//         updateHomeCategory,
//     });
// };