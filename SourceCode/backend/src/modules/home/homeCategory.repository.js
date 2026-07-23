/**
 * Pure function-based repository representing HomeCategory persistence operations.
 * Encapsulates all MongoDB interactions.
 */
export const createHomeCategoryRepository = ({ HomeCategory }) =>
{
    /**
     * Creates a single category.
     */
    const create = (payload) =>
    {
        return HomeCategory.create(payload);
    };

    /**
     * Creates multiple categories.
     */
    const createMany = (payload) =>
    {
        return HomeCategory.insertMany(payload);
    };

    /**
     * Returns all categories.
     */
    const findAll = () =>
    {
        return HomeCategory.find().sort({ displayOrder: 1, createdAt: 1 });
    };

    /**
     * Returns one category.
     */
    const findById = (id) =>
    {
        return HomeCategory.findById(id);
    };

    /**
     * Checks collection contains any document.
     */
    const exists = async () =>
    {
        const count = await HomeCategory.countDocuments();

        return count > 0;
    };

    /**
     * Updates one category.
     */
    const update = (id, payload) =>
    {
        return HomeCategory.findByIdAndUpdate(
            id,
            payload,
            {
                new: true,
                runValidators: true,
            }
        );
    };

    /**
     * Deletes one category.
     */
    const remove = (id) =>
    {
        return HomeCategory.findByIdAndDelete(id);
    };

    const updateStatus = (id, isActive) =>
    {
        return HomeCategory.findByIdAndUpdate(
            id,
            { isActive },
            {
                new: true,
                runValidators: true,
            }
        );
    };

    const bulkUpdateOrder = (updates) =>
    {
        const bulkOps = updates.map(({ id, displayOrder }) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { displayOrder } },
            },
        }));
        return HomeCategory.bulkWrite(bulkOps);
    };

    const findByCategoryIdAndSection = (categoryId, section) =>
    {
        return HomeCategory.findOne({ categoryId, section });
    };

    const countBySection = (section) =>
    {
        return HomeCategory.countDocuments({ section });
    };

    return Object.freeze({
        create,
        createMany,
        findAll,
        findById,
        exists,
        update,
        updateStatus,
        remove,
        bulkUpdateOrder,
        findByCategoryIdAndSection,
        countBySection,
    });
};




// /**
//  * Pure function-based factory representing the HomeCategory Persistence database interface.
//  * Decouples database collections lookup pipelines using Dependency Injection.
//  */
// export const createHomeCategoryRepository = ({ HomeCategory }) =>
// {

//     /**
//      * Commits a new homepage category item document directly into the database.
//      * Supports array-wrap configurations to run smoothly inside transactions.
//      */
//     const create = async (homeCategoryData, options = {}) =>
//     {
//         const [newHomeCategory] = await HomeCategory.create([homeCategoryData], options);
//         return newHomeCategory ? newHomeCategory.toObject() : null;
//     };

//     /**
//      * Discovers a home category layout document by its unique database ObjectId.
//      */
//     const findById = async (id, options = {}) =>
//     {
//         return HomeCategory.findById(id, null, options).lean();
//     };

//     /**
//      * Pulls all registered homepage categories configurations list.
//      */
//     const findAll = async (options = {}) =>
//     {
//         return HomeCategory.find({}, null, options).lean();
//     };

//     /**
//      * Pulls category listings belonging to a specific homepage design section (e.g. GRID, DEALS).
//      */
//     const findBySection = async (section, options = {}) =>
//     {
//         return HomeCategory.find({ section }, null, options).lean();
//     };

//     /**
//      * Modifies an existing homepage category document. Returns the newly updated state.
//      */
//     const update = async (id, updateData, options = {}) =>
//     {
//         return HomeCategory.findByIdAndUpdate(
//             id,
//             { $set: updateData },
//             { ...options, new: true, runValidators: true } // Returns updated record enforcing schema validations
//         ).lean();
//     };

//     /**
//  * Creates multiple homepage categories.
//  */
//     const createMany = async (categories, options = {}) =>
//     {
//         const documents = await HomeCategory.insertMany(
//             categories,
//             options
//         );

//         return documents.map(document => document.toObject());
//     };

//     /**
//      * Deletes a homepage category.
//      */
//     const deleteById = async (id, options = {}) =>
//     {
//         return HomeCategory.findByIdAndDelete(id, options).lean();
//     };

//     return Object.freeze({
//         create,
//         createMany,
//         findById,
//         findAll,
//         findBySection,
//         update,
//         deleteById,
//     });
// };