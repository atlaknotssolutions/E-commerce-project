/**
 * Pure function-based factory representing the Category Persistence database interface.
 * Strictly abstracts query pipelines from business levels utilizing Dependency Injection.
 */
export const createCategoryRepository = ({ Category }) =>
{


    /**
 * Returns every category.
 */
    const findAll = async (options = {}) =>
    {
        return Category.find({}, null, options)
            .populate("parentCategory", "name")
            .sort({
                level: 1,
                name: 1,
            })
            .lean();
    };


    /**
    * Finds category by Mongo ID.
    */
    const findById = async (id, options = {}) =>
    {
        return Category.findById(id, null, options)
            .populate("parentCategory", "name")
            .lean();
    };


    /**
 * Finds a category by its display name.
 */
    const findByName = async (name, options = {}) =>
    {
        return Category.findOne(
            {
                name: name.trim(),
            },
            null,
            options
        ).lean();
    };

    /**
     * Discovers a unique category document matching its URL-friendly business identifier string.
     * Employs standard casing normalizations to prevent duplicate route check mismatches.
     */
    const findByCategoryId = async (categoryId, options = {}) =>
    {
        return Category.findOne(
            { categoryId: categoryId.toLowerCase().trim() },
            null, // Project complete document mapping
            options
        ).lean(); // Returns plain lightweight JS objects for fast memory rendering
    };

    /**
     * Persists a new category node under database.
     * Supports array-wrap formats to execute flawlessly within atomic transaction sessions.
     */
    const createCategory = async ({ name, categoryId, parentCategory = null, level }, options = {}) =>
    {
        const [newCategory] = await Category.create([{
            name,
            categoryId: categoryId.toLowerCase().trim(),
            parentCategory,
            level,
        }], options);

        return newCategory ? newCategory.toObject() : null;
    };

    /**
 * Updates category.
 */
    const updateById = async (id, updateData, options = {}) =>
    {
        return Category.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
                ...options,
            }
        )
            .populate("parentCategory", "name")
            .lean();
    };


    /**
 * Updates an existing category.
 */
    const updateCategory = async (
        id,
        updateData,
        options = {}
    ) =>
    {
        return Category.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
                ...options,
            }
        ).lean();
    };


    /**
 * Deletes a category by id.
 */
    const deleteCategory = async (
        id,
        options = {}
    ) =>
    {
        return Category.findByIdAndDelete(
            id,
            options
        ).lean();
    };
    /**
     * Pulls category listings belonging to a specific hierarchy depth level (1, 2, or 3).
     * Sorts listings alphabetically by name for polished UI renderings.
     */
    const findByLevel = async (level, options = {}) =>
    {
        return Category.find(
            { level },
            null,
            options
        ).sort({ name: 1 }).lean(); // Descending index sorting order bypasses system overheads
    };


    /**
 * Deletes category.
 */
    const deleteById = async (id, options = {}) =>
    {
        return Category.findByIdAndDelete(id, options).lean();
    };


    /**
 * Fetches categories belonging to a specific hierarchy level
 * and optional parent category.
 */
    const findByLevelAndParent = async (
        level,
        parentCategory = null,
        options = {}
    ) =>
    {
        const query = { level };

        if (parentCategory)
        {
            query.parentCategory = parentCategory;
        } else if (level > 1)
        {
            query.parentCategory = null;
        }

        return Category.find(query, null, options)
            .sort({ name: 1 })
            .lean();
    };

    /**
 * Finds immediate child categories.
 */
    const findChildren = async (
        parentCategory,
        options = {}
    ) =>
    {
        return Category.find(
            {
                parentCategory,
            },
            null,
            options
        ).lean();
    };

    /**
 * Returns all categories ordered by hierarchy.
 */
    const findAllForTree = async (options = {}) =>
    {
        return Category.find({}, null, options)
            .sort({
                level: 1,
                name: 1,
            })
            .lean();
    };

    return Object.freeze({
        findByCategoryId,
        createCategory,
        findByLevel,
        findAll,
        findById,
        updateById,
        deleteById,
        findByName,
        updateCategory,
        deleteCategory,
        findByLevelAndParent,
        findChildren,
        findAllForTree,
    });
};