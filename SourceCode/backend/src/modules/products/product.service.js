// /**
//  * Pure function-based factory representing the Product Catalog Business Service layer.
//  * Enforces strict security ownership checks and cascade classification workflows.
//  */
// export const createProductService = ({
//     productRepository,
//     categoryService,
//     createApiError
// }) =>
// {

//     /**
//      * Onboards a brand-new product listing.
//      * Automatically resolves and registers hierarchical categories prior to creation.
//      */
//     const createProduct = async ({ productData, categoryParams, sellerId }) =>
//     {

//         // 1. Service Orchestration: Calls category service to resolve and find/create leaf Level 3 Category
//         const leafCategory = await categoryService.resolveCategoryHierarchy(categoryParams);

//         // 2. Assemble product attributes linking resolved Category and active Seller IDs
//         const preparedProductData = {
//             ...productData,
//             category: leafCategory._id,
//             seller: sellerId, // Strictly binds seller tracking identity
//         };

//         // 3. Commit product write operations
//         return productRepository.create(preparedProductData);
//     };

//     /**
//      * Modifies an existing product record safely.
//      * Enforces strict merchant-ownership checks prior to writing updates.
//      */
//     const updateProduct = async ({ productId, updateData, sellerId }) =>
//     {

//         // 1. Locate dynamic targeted catalog document
//         const product = await productRepository.findById(productId);
//         if (!product)
//         {
//             throw createApiError({
//                 statusCode: 404,
//                 code: 'PRODUCT_NOT_FOUND',
//                 message: 'Product modification failed. The requested product catalogue item was not found.'
//             });
//         }

//         // 2. Core Security Check: Validate that the requesting seller owns this product listing
//         const isOwner = product.seller._id.toString() === sellerId.toString();
//         if (!isOwner)
//         {
//             throw createApiError({
//                 statusCode: 403,
//                 code: 'ACCESS_FORBIDDEN',
//                 message: 'Access Denied: You do not possess authorizations to modify another vendor’s catalogue listing.'
//             });
//         }

//         // 3. Commit updates safely in database
//         return productRepository.update(productId, updateData);
//     };

//     /**
//      * Erases a catalog listing permanently.
//      * Enforces strict merchant-ownership validation barriers.
//      */
//     const deleteProduct = async ({ productId, sellerId }) =>
//     {

//         // 1. Locate target document
//         const product = await productRepository.findById(productId);
//         if (!product)
//         {
//             throw createApiError({
//                 statusCode: 404,
//                 code: 'PRODUCT_NOT_FOUND',
//                 message: 'Product deletion failed. The targeted listing does not exist.'
//             });
//         }

//         // 2. Security Check: Enforce seller ownership limits
//         const isOwner = product.seller._id.toString() === sellerId.toString();
//         if (!isOwner)
//         {
//             throw createApiError({
//                 statusCode: 403,
//                 code: 'ACCESS_FORBIDDEN',
//                 message: 'Access Denied: Deletion rejected. You can only remove catalogue items belonging to your own store.'
//             });
//         }

//         // 3. Trigger hard deletion pipeline
//         await productRepository.delete(productId);

//         return { success: true, message: 'Catalog listing successfully erased.' };
//     };

//     /**
//      * Retrieves single product detail.
//      * Throws standard 404 exceptions on missing database entries.
//      */
//     const getProductById = async ({ productId }) =>
//     {
//         const product = await productRepository.findById(productId);

//         if (!product)
//         {
//             throw createApiError({
//                 statusCode: 404,
//                 code: 'PRODUCT_NOT_FOUND',
//                 message: 'The requested product catalogue item was not found in the database.'
//             });
//         }

//         return product;
//     };

//     /**
//      * Leverages text scoring metrics sorting algorithms to execute textual searches.
//      */
//     const searchProducts = async ({ query }) =>
//     {
//         if (!query || query.trim() === '')
//         {
//             return []; // Return empty dataset immediately on blank parameters search
//         }

//         return productRepository.searchProducts({ searchQuery: query.trim() });
//     };

//     /**
//      * Custom dynamic listing filter compiler.
//      * Passes parameters smoothly to persistence pipelines.
//      */
//     const getAllProducts = async (filterParams) =>
//     {
//         return productRepository.getAllProducts(filterParams);
//     };

//     return Object.freeze({
//         createProduct,
//         updateProduct,
//         deleteProduct,
//         getProductById,
//         searchProducts,
//         getAllProducts,
//     });
// };


import crypto from 'crypto';
import mongoose from 'mongoose'; // Essential to resolve and query Category models dynamically [INDEX]
import { generateSku } from '../../utils/skuGenerator.js';

/**
 * Pure function-based factory representing the Product Catalog Business Service layer.
 * Enforces strict security ownership checks and dynamically resolves category strings.
 */
export const createProductService = ({
    productRepository,
    categoryService,
    createApiError,
    mapProduct,
    mapProducts
}) =>
{

    /**
     * Onboards a brand-new product listing.
     */
    /**
 * Onboards a brand-new product listing.
 */
    const createProduct = async ({ productData, categoryParams, sellerId }) =>
    {
        const leafCategory = await categoryService.resolveCategoryHierarchy(categoryParams);

        const preparedProductData = {
            ...productData,
            category: leafCategory._id,
            seller: sellerId,
        };

        // Business Validation
        if (preparedProductData.sellingPrice > preparedProductData.mrpPrice)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_PRICE',
                message: 'Selling price cannot exceed MRP price.'
            });
        }

        const product = await productRepository.create(preparedProductData);

        // Auto-generate SKU for the default variant (created by pre-validate hook)
        if (product && product.variants && product.variants.length > 0)
        {
            const defaultVariant = product.variants[0];
            // Only update if it still has the legacy SKU format
            if (defaultVariant.sku && defaultVariant.sku.startsWith('SKU-'))
            {
                const newSku = await generateSkuForVariant(
                    leafCategory._id,
                    {
                        color: preparedProductData.color,
                        size: preparedProductData.sizes,
                        dynamic: preparedProductData.variants?.[0]?.attributes?.dynamic || [],
                    },
                    sellerId
                );

                await productRepository.updateVariant(
                    product._id.toString(),
                    defaultVariant._id.toString(),
                    { sku: newSku }
                );

                // Re-fetch product with updated SKU
                const updated = await productRepository.findById(product._id);
                return mapProduct(updated);
            }
        }

        return mapProduct(product);
    };

    /**
     * Modifies an existing product record safely.
     */
    const updateProduct = async ({
        productId,
        updateData,
        categoryParams,
        sellerId
    }) =>
    {
        const product = await productRepository.findById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product modification failed. The requested product catalogue item was not found.'
            });
        }

        const isOwner = product.seller._id.toString() === sellerId.toString();

        if (!isOwner)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: 'Access Denied: You do not possess authorizations to modify another vendor’s catalogue listing.'
            });
        }

        let preparedUpdateData = {
            ...updateData,
        };

        // Preserve existing values if frontend doesn't send them
        if (
            preparedUpdateData.mrpPrice === undefined ||
            preparedUpdateData.mrpPrice === null ||
            preparedUpdateData.mrpPrice === ""
        )
        {
            preparedUpdateData.mrpPrice = product.mrpPrice;
        }

        if (
            preparedUpdateData.sellingPrice === undefined ||
            preparedUpdateData.sellingPrice === null ||
            preparedUpdateData.sellingPrice === ""
        )
        {
            preparedUpdateData.sellingPrice = product.sellingPrice;
        }

        // Resolve category hierarchy
        if (
            categoryParams?.category &&
            categoryParams?.category2 &&
            categoryParams?.category3
        )
        {
            const leafCategory = await categoryService.resolveCategoryHierarchy(categoryParams);

            preparedUpdateData.category = leafCategory._id;
        }

        // Business Validation
        if (preparedUpdateData.sellingPrice > preparedUpdateData.mrpPrice)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_PRICE',
                message: 'Selling price cannot exceed MRP price.'
            });
        }

        const updatedProduct = await productRepository.update(
            productId,
            preparedUpdateData
        );

        return mapProduct(updatedProduct);
    };
    /**
     * Erases a catalog listing permanently.
     */
    const deleteProduct = async ({ productId, sellerId }) =>
    {
        const product = await productRepository.findById(productId);
        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product deletion failed. The targeted listing does not exist.'
            });
        }

        const isOwner = product.seller._id.toString() === sellerId.toString();
        if (!isOwner)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: 'Deletion rejected: You can only remove catalogue items belonging to your own store.'
            });
        }

        await productRepository.delete(productId);

        return { success: true, message: 'Catalog listing successfully erased.' };
    };

    /**
     * Retrieves single product detail.
     */
    const getProductById = async ({ productId }) =>
    {
        const product = await productRepository.findById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'The requested product catalogue item was not found in the database.'
            });
        }

        return mapProduct(product);
    };

    /**
     * Leverages text scoring metrics sorting algorithms to execute textual searches.
     */
    const searchProducts = async ({ query }) =>
    {
        if (!query || query.trim() === '')
        {
            return [];
        }

        const products = await productRepository.searchProducts({
            searchQuery: query.trim(),
        });

        return mapProducts(products);
    };

    /**
     * Custom dynamic listing filter compiler.
     * Resolves incoming category string IDs (like "men_t_shirts") to Mongoose ObjectIds.
     * Prevents CastError crashes, returning clean 200 OK structures back to frontend.
     * Passes dynamic attribute filters (attr_*) to repository for variant-level filtering.
     */
    const getAllProducts = async (filterParams) =>
    {
        let resolvedCategoryObjectId = null;

        // Resolves and maps incoming categoryId string to actual Mongoose ObjectId
        if (filterParams.category)
        {
            const CategoryModel = mongoose.model('Category');

            const categoryDoc = await CategoryModel.findOne({
                categoryId: filterParams.category.toLowerCase().trim()
            }).lean();

            if (categoryDoc)
            {
                resolvedCategoryObjectId = categoryDoc._id;
            } else
            {
                return {
                    content: [],
                    totalPages: 0,
                    totalElements: 0,
                    pageNumber: parseInt(filterParams.pageNumber, 10) || 0,
                };
            }
        }

        // Passes the resolved ObjectId and any dynamicFilters to the repository query builder
        const result = await productRepository.getAllProducts({
            ...filterParams,
            category: resolvedCategoryObjectId,
        });

        return {
            ...result,
            content: mapProducts(result.content),
        };
    };

    /**
     * Retrieves filter metadata (available attribute values, price range, brands)
     * for a given category. Enriches raw aggregation data with category supportedAttributes metadata.
     *
     * @param {string} categoryIdStr - The category's business categoryId string (e.g., "men_t_shirts")
     * @returns {Object} Enriched filter metadata for the frontend FilterSection
     */
    const getFilterMetadata = async (categoryIdStr) =>
    {
        const CategoryModel = mongoose.model('Category');

        const categoryDoc = await CategoryModel.findOne({
            categoryId: categoryIdStr.toLowerCase().trim()
        }).lean();

        if (!categoryDoc)
        {
            return { attributes: [], priceRange: { min: 0, max: 0 }, brands: [] };
        }

        // Get raw aggregation data from products
        const rawMetadata = await productRepository.getFilterMetadata(categoryDoc._id);

        // Enrich with category supportedAttributes metadata (name, type, displayOrder, filterable)
        const supportedMap = {};
        if (categoryDoc.supportedAttributes && categoryDoc.supportedAttributes.length > 0)
        {
            categoryDoc.supportedAttributes.forEach((attr) =>
            {
                if (attr.active && attr.filterable)
                {
                    supportedMap[attr.code] = attr;
                }
            });
        }

        // Merge: only include attributes that are both filterable AND have product values
        const enrichedAttributes = rawMetadata.attributes
            .filter((raw) => supportedMap[raw.name])
            .map((raw) =>
            {
                const meta = supportedMap[raw.name];
                return {
                    name: meta.name,
                    code: meta.code,
                    type: meta.type,
                    displayOrder: meta.displayOrder || 0,
                    values: raw.values,
                };
            })
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        return {
            attributes: enrichedAttributes,
            priceRange: rawMetadata.priceRange,
            brands: rawMetadata.brands,
        };
    };

    // ==========================================
    // SKU GENERATION
    // ==========================================

    /**
     * Resolves the full category hierarchy chain (root → leaf) for a given category ID.
     * Traverses parentCategory references to build the name array.
     *
     * @param {string} categoryId - The leaf category's ObjectId
     * @returns {string[]} Array of category names from root to leaf, e.g., ["Men", "T-Shirts"]
     */
    const resolveCategoryHierarchyChain = async (categoryId) =>
    {
        const chain = [];
        let currentId = categoryId;
        let depth = 0;

        while (currentId && depth < 3)
        {
            const category = await categoryService.getCategoryById(currentId);
            if (!category) break;

            chain.unshift(category.name);
            currentId = category.parentCategory
                ? (category.parentCategory._id || category.parentCategory)
                : null;
            depth++;
        }

        return chain;
    };

    /**
     * Generates a unique SKU for a product variant.
     * Queries the repository to find the next available sequence number.
     *
     * @param {string} categoryId - The product's leaf category ObjectId
     * @param {Object} attributes - The variant's attributes (legacy + dynamic)
     * @param {string} sellerId - The seller's ObjectId
     * @returns {string} A unique SKU string, e.g., "MTS-BLK-001"
     */
    const generateSkuForVariant = async (categoryId, attributes, sellerId) =>
    {
        const hierarchy = await resolveCategoryHierarchyChain(categoryId);

        // Generate a sample SKU to extract the prefix (with dummy sequence 1)
        const sampleSku = generateSku({
            categoryHierarchy: hierarchy,
            attributes,
            sequence: 1,
        });

        // Extract the base prefix (everything before the sequence number)
        const parts = sampleSku.split('-');
        parts.pop(); // remove the sequence part
        const basePrefix = parts.join('-');

        // Query existing sequences for this prefix under this seller
        const maxSequence = await productRepository.findMaxSkuSequenceByPrefix(
            sellerId,
            basePrefix
        );

        return generateSku({
            categoryHierarchy: hierarchy,
            attributes,
            sequence: maxSequence + 1,
        });
    };

    // ==========================================
    // VARIANT BUSINESS RULES
    // ==========================================

    /**
     * Validates SKU uniqueness per seller, attribute combination uniqueness,
     * and optional dynamic attribute constraints against category supportedAttributes.
     */
    const validateVariantConstraints = async (sellerId, variantData, excludeProductId = null) =>
    {
        // Check duplicate SKU per seller — skip if SKU not yet assigned (auto-generated later)
        if (variantData.sku)
        {
            const skuConflict = await productRepository.findProductBySellerAndSku(
                sellerId, variantData.sku, excludeProductId
            );
            if (skuConflict)
            {
                throw createApiError({
                    statusCode: 409,
                    code: 'DUPLICATE_VARIANT_SKU',
                    message: `SKU '${variantData.sku}' is already used by another product in your store.`,
                });
            }
        }

        // Check duplicate attribute combination (legacy + dynamic)
        if (variantData.attributes)
        {
            const attrConflict = await productRepository.findProductBySellerAndAttributes(
                sellerId, variantData.attributes, excludeProductId
            );
            if (attrConflict)
            {
                throw createApiError({
                    statusCode: 409,
                    code: 'DUPLICATE_VARIANT_ATTRIBUTES',
                    message: 'A variant with this attribute combination already exists.',
                });
            }
        }
    };

    /**
     * Validates dynamic variant attributes against the category's supportedAttributes.
     * Ensures required attributes are present and values match allowed options.
     */
    const validateDynamicAttributes = async (categoryId, dynamicAttributes = []) =>
    {
        if (!categoryId || dynamicAttributes.length === 0) return;

        const category = await categoryService.getCategoryById(categoryId);
        if (!category || !category.supportedAttributes || category.supportedAttributes.length === 0) return;

        // Build lookup maps by both code and name for flexible matching
        const supportedByCode = {};
        const supportedByName = {};
        category.supportedAttributes.forEach((attr) =>
        {
            supportedByCode[attr.code] = attr;
            supportedByName[attr.name] = attr;
        });

        // Check required attributes are provided (only active attributes)
        for (const attrDef of category.supportedAttributes)
        {
            if (!attrDef.active) continue;

            if (attrDef.required)
            {
                const provided = dynamicAttributes.find(
                    (d) => d.name === attrDef.code || d.name === attrDef.name
                );
                if (!provided || !provided.value || provided.value.trim() === '')
                {
                    throw createApiError({
                        statusCode: 400,
                        code: 'MISSING_REQUIRED_ATTRIBUTE',
                        message: `Attribute '${attrDef.name}' is required for this category.`,
                    });
                }
            }
        }

        // Validate values against allowed options (for select and multi_select type attributes)
        for (const dynAttr of dynamicAttributes)
        {
            const supported = supportedByCode[dynAttr.name] || supportedByName[dynAttr.name];
            if (supported && (supported.type === 'select' || supported.type === 'multi_select') && supported.options?.length > 0)
            {
                // For multi_select, value may be comma-separated
                const values = supported.type === 'multi_select'
                    ? dynAttr.value.split(',').map((v) => v.trim())
                    : [dynAttr.value];

                for (const val of values)
                {
                    if (!supported.options.includes(val))
                    {
                        throw createApiError({
                            statusCode: 400,
                            code: 'INVALID_ATTRIBUTE_VALUE',
                            message: `Value '${val}' is not allowed for attribute '${supported.name}'. Allowed: ${supported.options.join(', ')}`,
                        });
                    }
                }
            }
        }
    };

    /**
     * Adds a new variant to an existing product.
     */
    const addVariant = async ({ productId, variantData, sellerId }) =>
    {
        const product = await productRepository.findById(productId);
        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product not found. Cannot add variant.',
            });
        }

        const isOwner = product.seller._id.toString() === sellerId.toString();
        if (!isOwner)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: 'Access Denied: You can only add variants to your own products.',
            });
        }

        // Validate variant price
        if (variantData.price > variantData.mrpPrice)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_VARIANT_PRICE',
                message: 'Variant selling price cannot exceed MRP price.',
            });
        }

        await validateVariantConstraints(sellerId, variantData, productId);

        // Validate dynamic attributes against category supportedAttributes
        const categoryId = product.category?._id || product.category;
        if (categoryId)
        {
            const dynamicAttrs = variantData.attributes?.dynamic || [];
            if (dynamicAttrs.length > 0)
            {
                await validateDynamicAttributes(categoryId, dynamicAttrs);
            }
        }

        // Auto-generate SKU — seller never types SKU manually
        if (categoryId)
        {
            variantData.sku = await generateSkuForVariant(
                categoryId,
                variantData.attributes || {},
                sellerId
            );
        } else
        {
            // Fallback for products without a resolved category
            variantData.sku = `SKU-${String(productId)}-${Date.now()}`;
        }

        const updatedProduct = await productRepository.addVariant(productId, variantData);
        return mapProduct(updatedProduct);
    };

    /**
     * Updates an existing variant within a product.
     */
    const updateVariant = async ({ productId, variantId, updateData, sellerId }) =>
    {
        const product = await productRepository.findById(productId);
        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product not found. Cannot update variant.',
            });
        }

        const isOwner = product.seller._id.toString() === sellerId.toString();
        if (!isOwner)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: 'Access Denied: You can only update variants of your own products.',
            });
        }

        const existingVariant = product.variants.find(
            (v) => v._id.toString() === variantId.toString()
        );
        if (!existingVariant)
        {
            throw createApiError({
                statusCode: 404,
                code: 'VARIANT_NOT_FOUND',
                message: 'The requested variant was not found in this product.',
            });
        }

        // Validate price if being updated
        const newPrice = updateData.price !== undefined ? updateData.price : existingVariant.price;
        const newMrp = updateData.mrpPrice !== undefined ? updateData.mrpPrice : existingVariant.mrpPrice;
        if (newPrice > newMrp)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_VARIANT_PRICE',
                message: 'Variant selling price cannot exceed MRP price.',
            });
        }

        // SKU is immutable — always preserve the original SKU
        delete updateData.sku;

        // Validate dynamic attributes against category supportedAttributes
        const categoryId = product.category?._id || product.category;
        if (categoryId)
        {
            const dynamicAttrs = updateData.attributes?.dynamic || [];
            if (dynamicAttrs.length > 0)
            {
                await validateDynamicAttributes(categoryId, dynamicAttrs);
            }
        }

        const updatedProduct = await productRepository.updateVariant(productId, variantId, updateData);
        return mapProduct(updatedProduct);
    };

    /**
     * Removes a variant from a product.
     */
    const removeVariant = async ({ productId, variantId, sellerId }) =>
    {
        const product = await productRepository.findById(productId);
        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product not found. Cannot remove variant.',
            });
        }

        const isOwner = product.seller._id.toString() === sellerId.toString();
        if (!isOwner)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: 'Access Denied: You can only remove variants from your own products.',
            });
        }

        const existingVariant = product.variants.find(
            (v) => v._id.toString() === variantId.toString()
        );
        if (!existingVariant)
        {
            throw createApiError({
                statusCode: 404,
                code: 'VARIANT_NOT_FOUND',
                message: 'The requested variant was not found in this product.',
            });
        }

        // Prevent removing the last variant
        if (product.variants.length <= 1)
        {
            throw createApiError({
                statusCode: 400,
                code: 'CANNOT_REMOVE_LAST_VARIANT',
                message: 'Cannot remove the last variant. A product must have at least one variant.',
            });
        }

        const updatedProduct = await productRepository.removeVariant(productId, variantId);
        return mapProduct(updatedProduct);
    };

    /**
     * Updates stock quantity for a specific variant.
     */
    const updateVariantStock = async ({ productId, variantId, quantity, sellerId }) =>
    {
        const product = await productRepository.findById(productId);
        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product not found.',
            });
        }

        const isOwner = product.seller._id.toString() === sellerId.toString();
        if (!isOwner)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: 'Access Denied: You can only update stock of your own products.',
            });
        }

        const existingVariant = product.variants.find(
            (v) => v._id.toString() === variantId.toString()
        );
        if (!existingVariant)
        {
            throw createApiError({
                statusCode: 404,
                code: 'VARIANT_NOT_FOUND',
                message: 'The requested variant was not found.',
            });
        }

        const updatedProduct = await productRepository.updateVariantStock(productId, variantId, quantity);
        return mapProduct(updatedProduct);
    };

    // ==========================================
    // BULK VARIANT OPERATIONS
    // ==========================================

    /**
     * Validates ownership and variant IDs exist in the product.
     * Returns the product document for use by bulk operations.
     */
    const validateBulkOperation = async (productId, variantIds, sellerId) =>
    {
        if (!Array.isArray(variantIds) || variantIds.length === 0)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_VARIANT_IDS',
                message: 'At least one variant ID is required.',
            });
        }

        const product = await productRepository.findById(productId);
        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product not found.',
            });
        }

        const isOwner = product.seller._id.toString() === sellerId.toString();
        if (!isOwner)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: 'Access Denied: You can only modify variants of your own products.',
            });
        }

        // Validate all variant IDs belong to this product
        const existingVariantIds = new Set(product.variants.map((v) => v._id.toString()));
        const invalidIds = variantIds.filter((id) => !existingVariantIds.has(id.toString()));
        if (invalidIds.length > 0)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_VARIANT_IDS',
                message: `The following variant IDs do not belong to this product: ${invalidIds.join(', ')}`,
            });
        }

        return product;
    };

    /**
     * Bulk updates pricing for multiple variants.
     */
    const bulkUpdateVariantPricing = async ({ productId, variantIds, priceData, sellerId }) =>
    {
        await validateBulkOperation(productId, variantIds, sellerId);

        if (priceData.price !== undefined && priceData.price < 0)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_PRICE',
                message: 'Selling price cannot be negative.',
            });
        }
        if (priceData.mrpPrice !== undefined && priceData.mrpPrice < 0)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_PRICE',
                message: 'MRP price cannot be negative.',
            });
        }

        const updatedProduct = await productRepository.bulkUpdateVariantPricing(
            productId, variantIds, priceData
        );
        return mapProduct(updatedProduct);
    };

    /**
     * Bulk updates stock for multiple variants.
     */
    const bulkUpdateVariantInventory = async ({ productId, variantIds, quantity, operation, sellerId }) =>
    {
        await validateBulkOperation(productId, variantIds, sellerId);

        if (quantity === undefined || quantity < 0)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_QUANTITY',
                message: 'Quantity must be a non-negative number.',
            });
        }

        if (!['set', 'increment', 'decrement'].includes(operation))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_OPERATION',
                message: 'Operation must be "set", "increment", or "decrement".',
            });
        }

        const updatedProduct = await productRepository.bulkUpdateVariantInventory(
            productId, variantIds, { quantity, operation }
        );
        return mapProduct(updatedProduct);
    };

    /**
     * Bulk updates active/inactive status for multiple variants.
     */
    const bulkUpdateVariantStatus = async ({ productId, variantIds, isActive, sellerId }) =>
    {
        await validateBulkOperation(productId, variantIds, sellerId);

        const updatedProduct = await productRepository.bulkUpdateVariantStatus(
            productId, variantIds, isActive
        );
        return mapProduct(updatedProduct);
    };

    return Object.freeze({
        createProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        searchProducts,
        getAllProducts,
        getFilterMetadata,
        addVariant,
        updateVariant,
        removeVariant,
        updateVariantStock,
        bulkUpdateVariantPricing,
        bulkUpdateVariantInventory,
        bulkUpdateVariantStatus,
    });
};