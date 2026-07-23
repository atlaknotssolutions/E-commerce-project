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
     * Resolves incoming category string IDs (like "men_t_shirts") to Mongoose ObjectIds [INDEX].
     * Prevents CastError crashes, returning clean 200 OK structures back to frontend [INDEX].
     */
    const getAllProducts = async (filterParams) =>
    {
        let resolvedCategoryObjectId = null;

        // Resolves and maps incoming categoryId string to actual Mongoose ObjectId [INDEX]
        if (filterParams.category)
        {
            const CategoryModel = mongoose.model('Category');

            const categoryDoc = await CategoryModel.findOne({
                categoryId: filterParams.category.toLowerCase().trim()
            }).lean();

            if (categoryDoc)
            {
                resolvedCategoryObjectId = categoryDoc._id; // Extracted Mongoose ObjectId [INDEX]
            } else
            {
                // If no matching categoryId is found in DB, return empty paginated result cleanly
                return {
                    content: [],
                    totalPages: 0,
                    totalElements: 0,
                    pageNumber: parseInt(filterParams.pageNumber, 10) || 0,
                };
            }
        }

        // Passes the resolved ObjectId cleanly to the repository query builder [INDEX]
        const result = await productRepository.getAllProducts({
            ...filterParams,
            category: resolvedCategoryObjectId,
        });

        return {
            ...result,
            content: mapProducts(result.content),
        };
    };

    // ==========================================
    // VARIANT BUSINESS RULES
    // ==========================================

    /**
     * Validates SKU uniqueness per seller and attribute combination uniqueness.
     */
    const validateVariantConstraints = async (sellerId, variantData, excludeProductId = null) =>
    {
        // Check duplicate SKU per seller
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

        // Check duplicate attribute combination
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

        // Validate SKU uniqueness if SKU is being changed
        if (updateData.sku && updateData.sku !== existingVariant.sku)
        {
            await validateVariantConstraints(sellerId, updateData, productId);
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

    return Object.freeze({
        createProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        searchProducts,
        getAllProducts,
        addVariant,
        updateVariant,
        removeVariant,
        updateVariantStock,
    });
};