import { MAX_CATEGORY_DEPTH } from '../../constants/enums.js';

/**
 * Pure function-based factory representing the Category Business Service layer.
 * Implements loose coupling architectures by accepting repository instances as parameters.
 */
export const createCategoryService = ({ categoryRepository, createApiError }) =>
{

    /**
     * Transforms raw dynamic text inputs into clean, alphanumeric URL-friendly slugs.
     * Removes special character vectors to prevent database script injection vulnerabilities.
     * Example: 'Computers & Laptops' -> 'computers_laptops'
     */
    const buildCategoryId = (name) =>
    {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    };

    /**
     * Generates a unique attribute id from the attribute name.
     * Example: 'Color' -> 'color', 'RAM Size' -> 'ram_size'
     */
    const buildAttributeId = (name) =>
    {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    };

    /**
     * Validates and normalizes an array of supportedAttributes.
     * Auto-generates missing id/code fields, validates types and options.
     * Returns the cleaned array ready for persistence.
     */
    const validateAndNormalizeAttributes = (attributes = []) =>
    {
        if (!Array.isArray(attributes) || attributes.length === 0) return [];

        const validTypes = ['text', 'number', 'select', 'multi_select', 'boolean', 'color'];
        const seenIds = new Set();
        const seenCodes = new Set();

        return attributes.map((attr, index) =>
        {
            const name = (attr.name || '').trim();
            if (!name)
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'INVALID_ATTRIBUTE',
                    message: `Attribute at position ${index + 1} is missing a name.`,
                });
            }

            const id = attr.id?.trim() || buildAttributeId(name);
            const code = attr.code?.trim() || buildAttributeId(name);

            // Enforce uniqueness within the category
            if (seenIds.has(id))
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'DUPLICATE_ATTRIBUTE_ID',
                    message: `Duplicate attribute id '${id}' at position ${index + 1}.`,
                });
            }
            if (seenCodes.has(code))
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'DUPLICATE_ATTRIBUTE_CODE',
                    message: `Duplicate attribute code '${code}' at position ${index + 1}.`,
                });
            }
            seenIds.add(id);
            seenCodes.add(code);

            const type = validTypes.includes(attr.type) ? attr.type : 'text';

            // Validate select/multi_select have options
            if ((type === 'select' || type === 'multi_select') && (!Array.isArray(attr.options) || attr.options.length === 0))
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'ATTRIBUTE_OPTIONS_REQUIRED',
                    message: `Attribute '${name}' (type: ${type}) requires at least one option.`,
                });
            }

            return {
                id,
                name,
                code,
                type,
                required: Boolean(attr.required),
                options: Array.isArray(attr.options) ? attr.options : [],
                sortable: Boolean(attr.sortable),
                filterable: Boolean(attr.filterable),
                variantAttribute: Boolean(attr.variantAttribute),
                displayOrder: typeof attr.displayOrder === 'number' ? attr.displayOrder : index,
                active: attr.active !== undefined ? Boolean(attr.active) : true,
            };
        });
    };



    const createCategory = async ({
        name,
        level,
        parentCategory = null,
        supportedAttributes = [],
    }) =>
    {

        let numericLevel = Number(level);

        if (
            isNaN(numericLevel) ||
            numericLevel < 1 ||
            numericLevel > MAX_CATEGORY_DEPTH
        )
        {
            if (level !== undefined)
            {
                throw createApiError({
                    statusCode: 400,
                    code: "INVALID_LEVEL",
                    message: "Category level must be between 1 and 3.",
                });
            }

            if (parentCategory)
            {
                const parent =
                    await categoryRepository.findById(
                        parentCategory
                    );

                if (!parent)
                {
                    throw createApiError({
                        statusCode: 404,
                        code: "PARENT_NOT_FOUND",
                        message:
                            "Parent category not found.",
                    });
                }

                if (parent.level >= MAX_CATEGORY_DEPTH)
                {
                    throw createApiError({
                        statusCode: 400,
                        code: "CATEGORY_LEVEL_LIMIT",
                        message: `Maximum category depth is ${MAX_CATEGORY_DEPTH}.`,
                    });
                }

                numericLevel = parent.level + 1;
            } else
            {
                numericLevel = 1;
            }
        }

        const categoryId = buildCategoryId(name);

        const existing =
            await categoryRepository.findByCategoryId(categoryId);

        if (existing)
        {
            throw createApiError({
                statusCode: 409,
                code: "CATEGORY_ALREADY_EXISTS",
                message: "Category already exists.",
            });
        }

        if (numericLevel === 1)
        {
            parentCategory = null;
        }

        if (numericLevel > 1)
        {

            if (!parentCategory)
            {
                throw createApiError({
                    statusCode: 400,
                    code: "PARENT_REQUIRED",
                    message:
                        "Parent category is required.",
                });
            }

            const parent =
                await categoryRepository.findById(
                    parentCategory
                );

            if (!parent)
            {
                throw createApiError({
                    statusCode: 404,
                    code: "PARENT_NOT_FOUND",
                    message:
                        "Parent category not found.",
                });
            }

            if (
                parent.level !== numericLevel - 1
            )
            {
                throw createApiError({
                    statusCode: 400,
                    code: "INVALID_PARENT_LEVEL",
                    message:
                        "Invalid parent category level.",
                });
            }
        }

        const normalizedAttributes = validateAndNormalizeAttributes(supportedAttributes);

        return categoryRepository.createCategory({
            name: name.trim(),
            categoryId,
            parentCategory,
            level: numericLevel,
            supportedAttributes: normalizedAttributes,
        });
    };


    /**
     * Updates category.
     */
    const updateCategory = async (
        id,
        {
            name,
            parentCategory = null,
            supportedAttributes = undefined,
        }
    ) =>
    {

        const existing = await categoryRepository.findById(id);

        if (!existing)
        {
            throw createApiError({
                statusCode: 404,
                code: "CATEGORY_NOT_FOUND",
                message: "Category not found.",
            });
        }

        const updateData = {};

        if (name?.trim())
        {
            updateData.name = name.trim();
            updateData.categoryId = buildCategoryId(name);
        }

        if (parentCategory !== undefined)
        {

            if (parentCategory)
            {

                const parent = await categoryRepository.findById(parentCategory);

                if (!parent)
                {
                    throw createApiError({
                        statusCode: 404,
                        code: "PARENT_CATEGORY_NOT_FOUND",
                        message: "Parent category not found.",
                    });
                }

                if (parent.level >= MAX_CATEGORY_DEPTH)
                {
                    throw createApiError({
                        statusCode: 400,
                        code: "CATEGORY_LEVEL_LIMIT",
                        message: `Maximum category depth is ${MAX_CATEGORY_DEPTH}.`,
                    });
                }

                updateData.parentCategory = parentCategory;
                updateData.level = parent.level + 1;

            } else
            {

                updateData.parentCategory = null;
                updateData.level = 1;

            }
        }

        if (supportedAttributes !== undefined)
        {
            updateData.supportedAttributes = validateAndNormalizeAttributes(supportedAttributes);
        }

        return categoryRepository.updateById(id, updateData);
    };


    /**
     * Deletes category.
     */
    const deleteCategory = async (id) =>
    {

        const category = await categoryRepository.findById(id);

        if (!category)
        {
            throw createApiError({
                statusCode: 404,
                code: "CATEGORY_NOT_FOUND",
                message: "Category not found.",
            });
        }

        const children = await categoryRepository.findChildren(id);

        if (children.length)
        {
            throw createApiError({
                statusCode: 400,
                code: "CATEGORY_HAS_CHILDREN",
                message: "Delete child categories first.",
            });
        }

        const ProductModel = mongoose.model('Product');
        const productCount = await ProductModel.countDocuments({ category: id });

        if (productCount > 0)
        {
            throw createApiError({
                statusCode: 400,
                code: "CATEGORY_HAS_PRODUCTS",
                message: `Cannot delete category. ${productCount} product(s) are assigned to this category.`,
            });
        }

        await categoryRepository.deleteById(id);

        return {
            success: true,
            message: "Category deleted successfully.",
        };
    };

    /**
     * Automatic Cascading Hierarchy Resolver.
     * Resolves and registers 3-level categories tree recursively under database.
     * Supports transactional sessions context options flawlessly.
     */
    const resolveCategoryHierarchy = async ({ category, category2, category3 }, options = {}) =>
    {

        // 1. Inputs validation checks boundary
        if (!category || !category2 || !category3)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INCOMPLETE_CATEGORY_INPUTS',
                message: 'Platform onboarding requires explicit specifications across Level 1, Level 2, and Level 3 category structures.'
            });
        }

        // 2. Generate standardised string IDs slugs keys
        const lvl1Id = buildCategoryId(category);
        const lvl2Id = buildCategoryId(category2);
        const lvl3Id = buildCategoryId(category3);

        // ==========================================
        // LAYER 1: Root Node Resolution (Level 1)
        // ==========================================
        let lvl1Node = await categoryRepository.findByCategoryId(lvl1Id, options);

        if (!lvl1Node)
        {
            // Auto registers Root Level node if absent in system
            lvl1Node = await categoryRepository.createCategory({
                name: category.trim(),
                categoryId: lvl1Id,
                level: 1,
            }, options);
        }

        // ==========================================
        // LAYER 2: Sub Node Resolution (Level 2)
        // ==========================================
        let lvl2Node = await categoryRepository.findByCategoryId(lvl2Id, options);

        if (!lvl2Node)
        {
            // Creates Sub category linking parent Level 1 identity key
            lvl2Node = await categoryRepository.createCategory({
                name: category2.trim(),
                categoryId: lvl2Id,
                parentCategory: lvl1Node._id,
                level: 2,
            }, options);
        }

        // ==========================================
        // LAYER 3: Leaf Node Resolution (Level 3)
        // ==========================================
        let lvl3Node = await categoryRepository.findByCategoryId(lvl3Id, options);

        if (!lvl3Node)
        {
            // Creates leaf node targeting parent Level 2 identity key
            lvl3Node = await categoryRepository.createCategory({
                name: category3.trim(),
                categoryId: lvl3Id,
                parentCategory: lvl2Node._id,
                level: 3,
            }, options);
        }

        // Returns absolute final resolved Level 3 leaf document for product mapping assignment
        return lvl3Node;
    };



    /**
     * Fetches active category records grouping by structural levels.
     */
    const getCategoriesByLevel = async ({
        level,
        parentId,
    }) =>
    {

        const numericLevel = parseInt(level, 10);

        if (
            isNaN(numericLevel) ||
            numericLevel < 1 ||
            numericLevel > 3
        )
        {
            throw createApiError({
                statusCode: 400,
                code: "INVALID_LEVEL_PARAMETER",
                message:
                    "Level must be between 1 and 3.",
            });
        }

        if (numericLevel === 1)
        {
            return categoryRepository.findByLevel(1);
        }

        return categoryRepository.findByLevelAndParent(
            numericLevel,
            parentId
        );
    };

    /**
 * Returns all categories.
 */
    const getAllCategories = async () =>
    {
        return categoryRepository.findAll();
    };

    /**
 * Returns single category.
 */
    const getCategoryById = async (id) =>
    {
        const category = await categoryRepository.findById(id);

        if (!category)
        {
            throw createApiError({
                statusCode: 404,
                code: "CATEGORY_NOT_FOUND",
                message: "Category not found.",
            });
        }

        return category;
    };


    /**
 * Returns category hierarchy.
 * When sellerId is provided, only includes categories that have products belonging to that seller.
 * Parent categories are automatically included if any descendant has products.
 */
    const getCategoryTree = async ({ sellerId } = {}) =>
    {
        const categories =
            await categoryRepository.findAllForTree();

        if (!sellerId)
        {
            // Return full tree when no seller filter
            return buildTree(categories);
        }

        const ProductModel = mongoose.model('Product');
        const productCategoryIds = await ProductModel.distinct('category', { seller: sellerId });
        const validIds = new Set(productCategoryIds.map((id) => id.toString()));

        // Walk up from each valid leaf to include all ancestors
        const includeIds = new Set();
        const idToParent = {};
        categories.forEach((cat) =>
        {
            if (cat.parentCategory)
            {
                idToParent[cat._id.toString()] = cat.parentCategory.toString();
            }
        });

        // For each valid category, include it and all ancestors
        validIds.forEach((id) =>
        {
            includeIds.add(id);
            let current = id;
            while (idToParent[current])
            {
                includeIds.add(idToParent[current]);
                current = idToParent[current];
            }
        });

        const filtered = categories.filter(
            (cat) => includeIds.has(cat._id.toString())
        );

        return buildTree(filtered);
    };

    /**
     * Builds a nested tree from a flat list of categories.
     */
    const buildTree = (categories) =>
    {
        const map = {};
        categories.forEach((cat) =>
        {
            map[cat._id.toString()] = { ...cat, children: [] };
        });

        const tree = [];
        categories.forEach((cat) =>
        {
            const node = map[cat._id.toString()];
            if (!cat.parentCategory)
            {
                tree.push(node);
            }
            else
            {
                const parent = map[cat.parentCategory.toString()];
                if (parent)
                {
                    parent.children.push(node);
                }
            }
        });

        return tree;
    };


    return Object.freeze({
        resolveCategoryHierarchy,
        getCategoriesByLevel,
        getAllCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
        buildCategoryId,
        getCategoryTree,
        buildTree,
    });
};
