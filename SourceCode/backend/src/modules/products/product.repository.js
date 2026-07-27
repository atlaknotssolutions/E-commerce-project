// /**
//  * Pure function-based factory representing the Product Persistence Database Repository layer.
//  * Implements loose-coupling and advanced dynamic Query Building algorithms.
//  */
// export const createProductRepository = ({ Product }) =>
// {

//     /**
//      * Commits a new catalog product directly into the database.
//      */
//     const create = async (productData, options = {}) =>
//     {
//         const [newProduct] = await Product.create([productData], options);
//         return newProduct ? newProduct.toObject() : null;
//     };

//     /**
//      * Discovers a catalog item by its unique database ObjectId.
//      */
//     const findById = async (id, options = {}) =>
//     {
//         return Product.findById(id, null, options)
//             .populate('category') // Dynamically populates Level 3 category properties
//             .populate({
//                 path: 'seller',
//                 select: 'sellerName email mobile businessDetails.businessName pickupAddress' // Hides sensitive bank fields from product page lookups
//             })
//             .lean();
//     };

//     /**
//      * Modifies an existing product document. Returns the newly updated state.
//      */
//     const update = async (id, updateData, options = {}) =>
//     {
//         return Product.findByIdAndUpdate(
//             id,
//             { $set: updateData }, // Safe update properties patch operators
//             { ...options, new: true, runValidators: true } // Enforces Mongoose validations on update entries
//         ).lean();
//     };

//     /**
//      * Erases a catalog item record permanently from collection registries.
//      */
//     const deleteProduct = async (id, options = {}) =>
//     {
//         return Product.findByIdAndDelete(id, options).lean();
//     };

//     /**
//      * Pulls vendor-specific store listings chronologically descending (newest first).
//      */
//     const findBySellerId = async (sellerId, options = {}) =>
//     {
//         return Product.find({ seller: sellerId }, null, options)
//             .sort({ createdAt: -1 })
//             .populate('category')
//             .lean();
//     };

//     /**
//      * Full-Text Keyword Search Engine.
//      * Leverages MongoDB native $text index matching with text score relevance rankings.
//      */
//     const searchProducts = async ({ searchQuery }) =>
//     {
//         return Product.find(
//             { $text: { $search: searchQuery } },
//             { score: { $meta: 'textScore' } } // Attaches relevant query matches metrics scores
//         )
//             .sort({ score: { $meta: 'textScore' } }) // Priority order matching highest search density
//             .populate('category')
//             .lean();
//     };

//     /**
//      * Advanced Dynamic Catalog Queries Filter & Spring-Boot Compatible Pagination Builder.
//      * Compiles custom filters ranges on top of single database cursors scans.
//      * Implements secure mapping of frontend "stock" parameter to Mongoose "quantity" field.
//      */
//     const getAllProducts = async ({
//         category = null,
//         brand = null,
//         color = null,
//         size = null,
//         minPrice = 0,
//         maxPrice = Number.MAX_SAFE_INTEGER,
//         minDiscount = 0,
//         sort = 'newest',
//         stock = null, // Added stock parameter!
//         pageNumber = 0,
//         sizeLimit = 10
//     }) =>
//     {

//         // 1. Instantiate Mongoose querying filter criteria object
//         const filterQuery = {};

//         // A. Categories constraints resolution
//         // if (category)
//         // {
//         //     filterQuery.category = category; // Leaf Category ObjectId matching
//         // }

//         if (category)
//         {
//             const categoryDoc = await Category.findOne({
//                 categoryId: category
//             }).lean();

//             if (categoryDoc)
//             {
//                 filterQuery.category = categoryDoc._id;
//             } else
//             {
//                 // Invalid category -> no products
//                 return {
//                     content: [],
//                     totalPages: 0,
//                     totalElements: 0,
//                     pageNumber: parseInt(pageNumber, 10),
//                 };
//             }
//         }



//         // B. Alphanumeric filters mapping (Supports loose case-insensitive matching)
//         if (brand)
//         {
//             filterQuery.brand = { $regex: brand.trim(), $options: 'i' };
//         }
//         if (color)
//         {
//             filterQuery.color = { $regex: color.trim(), $options: 'i' };
//         }
//         if (size)
//         {
//             filterQuery.sizes = { $regex: size.trim(), $options: 'i' };
//         }

//         // C. Inventory Stock Status Filter (Corrects legacy Spring Boot bug mapping "stock" to "quantity")
//         if (stock)
//         {
//             const targetStock = stock.toLowerCase().trim();
//             if (targetStock === 'in_stock')
//             {
//                 filterQuery.quantity = { $gt: 0 }; // Quantity greater than 0
//             } else if (targetStock === 'out_of_stock')
//             {
//                 filterQuery.quantity = 0; // Out of stock (exactly 0)
//             }
//         }

//         // D. Mathematical Ranges validations filters (Prices & Discounts caps)
//         filterQuery.sellingPrice = {
//             $gte: parseFloat(minPrice),
//             $lte: parseFloat(maxPrice)
//         };

//         if (minDiscount > 0)
//         {
//             filterQuery.discountPercent = { $gte: parseInt(minDiscount, 10) };
//         }

//         // 2. Map sorting parameters properties to MongoDB operators
//         let sortCriteria = { createdAt: -1 }; // Default: Newest first

//         if (sort === 'price_low')
//         {
//             sortCriteria = { sellingPrice: 1 };
//         } else if (sort === 'price_high')
//         {
//             sortCriteria = { sellingPrice: -1 };
//         } else if (sort === 'discount')
//         {
//             sortCriteria = { discountPercent: -1 };
//         } else if (sort === 'newest')
//         {
//             sortCriteria = { createdAt: -1 };
//         }

//         // 3. Mathematical Pagination offsets conversions
//         const skipOffset = Math.max(0, parseInt(pageNumber, 10)) * parseInt(sizeLimit, 10);
//         const limitConstraint = Math.max(1, parseInt(sizeLimit, 10));

//         // 4. Concurrent Database Pipelines executions
//         const [content, totalElements] = await Promise.all([
//             // Pipeline A: Extract paginated items cursors
//             Product.find(filterQuery)
//                 .sort(sortCriteria)
//                 .skip(skipOffset)
//                 .limit(limitConstraint)
//                 .populate('category')
//                 .lean(),

//             // Pipeline B: Aggregate total elements counts matching filter criteria
//             Product.countDocuments(filterQuery)
//         ]);

//         const totalPages = Math.ceil(totalElements / limitConstraint);

//         // 5. Package output exactly matching Spring-compatible payloads format
//         return {
//             content,
//             totalPages,
//             totalElements,
//             pageNumber: parseInt(pageNumber, 10),
//         };
//     };

//     return Object.freeze({
//         create,
//         findById,
//         update,
//         delete: deleteProduct,
//         findBySellerId,
//         searchProducts,
//         getAllProducts,
//     });
// };


/**
 * Pure function-based factory representing the Product Persistence Database Repository layer.
 * Implements loose-coupling and advanced dynamic Query Building algorithms.
 */
export const createProductRepository = ({ Product }) =>
{

    /**
     * Commits a new catalog product directly into the database.
     */
    const create = async (productData, options = {}) =>
    {
        const [newProduct] = await Product.create([productData], options);
        return newProduct ? newProduct.toObject() : null;
    };

    /**
     * Discovers a catalog item by its unique database ObjectId.
     * Populates associated third-party references (Seller & Category profiles) cleanly.
     */
    const findById = async (id, options = {}) =>
    {
        return Product.findById(id, null, options)
            .populate('category') // Dynamically populates Level 3 category properties
            .populate({
                path: 'seller',
                select: 'sellerName email mobile businessDetails.businessName pickupAddress' // Hides sensitive bank fields from product page lookups
            })
            .lean();
        // console.log("========== PRODUCT ==========");
        // console.log(product);
    };

    /**
     * Modifies an existing product document. Returns the newly updated state.
     */
    const update = async (id, updateData, options = {}) =>
    {
        return Product.findByIdAndUpdate(
            id,
            { $set: updateData }, // Safe update properties patch operators
            { ...options, new: true, runValidators: true } // Enforces Mongoose validations on update entries
        ).lean();
    };

    /**
     * Erases a catalog item record permanently from collection registries.
     */
    const deleteProduct = async (id, options = {}) =>
    {
        return Product.findByIdAndDelete(id, options).lean();
    };

    /**
     * Pulls vendor-specific store listings chronologically descending (newest first).
     */
    const findBySellerId = async (sellerId, options = {}) =>
    {
        return Product.find({ seller: sellerId }, null, options)
            .sort({ createdAt: -1 })
            .populate('category')
            .populate({
                path: 'seller',
                select: 'sellerName email mobile businessDetails.businessName pickupAddress'
            })
            .lean();
    };

    // ==========================================
    // VARIANT CRUD OPERATIONS
    // ==========================================

    /**
     * Adds a new variant subdocument to a product.
     */
    const addVariant = async (productId, variantData, options = {}) =>
    {
        return Product.findByIdAndUpdate(
            productId,
            { $push: { variants: variantData } },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    /**
     * Updates a specific variant subdocument by its _id inside the product.
     */
    const updateVariant = async (productId, variantId, updateData, options = {}) =>
    {
        const setUpdate = {};
        for (const [key, value] of Object.entries(updateData))
        {
            setUpdate[`variants.$.${key}`] = value;
        }

        return Product.findOneAndUpdate(
            { _id: productId, 'variants._id': variantId },
            { $set: setUpdate },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    /**
     * Removes a specific variant subdocument from a product.
     */
    const removeVariant = async (productId, variantId, options = {}) =>
    {
        return Product.findByIdAndUpdate(
            productId,
            { $pull: { variants: { _id: variantId } } },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    /**
     * Finds a product with a specific variant by variant _id.
     */
    const findVariant = async (productId, variantId, options = {}) =>
    {
        return Product.findOne(
            { _id: productId, 'variants._id': variantId },
            null,
            options
        ).lean();
    };

    /**
     * Atomically updates stock quantity for a specific variant.
     * Uses $inc for safe concurrent stock modifications.
     */
    const updateVariantStock = async (productId, variantId, quantityChange, options = {}) =>
    {
        return Product.findOneAndUpdate(
            { _id: productId, 'variants._id': variantId },
            { $inc: { 'variants.$.quantity': quantityChange } },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    /**
     * Finds a product by seller that contains a variant with the given SKU.
     * Used for duplicate SKU validation.
     */
    const findProductBySellerAndSku = async (sellerId, sku, excludeProductId = null, options = {}) =>
    {
        const query = {
            seller: sellerId,
            'variants.sku': sku,
        };
        if (excludeProductId)
        {
            query._id = { $ne: excludeProductId };
        }
        return Product.findOne(query, null, options).lean();
    };

    /**
     * Finds the maximum sequence number used across all variants whose SKU
     * starts with the given prefix (e.g., "MTS-BLK").
     * Used by the SKU generator to determine the next available sequence.
     *
     * @param {string} sellerId - The seller's ObjectId
     * @param {string} skuPrefix - The SKU prefix to search for (e.g., "MTS-BLK")
     * @returns {number} The highest sequence found, or 0 if none exist
     */
    const findMaxSkuSequenceByPrefix = async (sellerId, skuPrefix) =>
    {
        const regex = new RegExp(`^${skuPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d{3}$`);

        const products = await Product.find(
            {
                seller: sellerId,
                'variants.sku': { $regex: regex },
            },
            {
                'variants.sku': 1,
            },
            { lean: true }
        ).exec();

        let maxSeq = 0;
        for (const product of products)
        {
            if (product.variants && Array.isArray(product.variants))
            {
                for (const variant of product.variants)
                {
                    if (variant.sku && regex.test(variant.sku))
                    {
                        const seqStr = variant.sku.split('-').pop();
                        const seq = parseInt(seqStr, 10);
                        if (!isNaN(seq) && seq > maxSeq)
                        {
                            maxSeq = seq;
                        }
                    }
                }
            }
        }

        return maxSeq;
    };

    /**
     * Checks if a product already has a variant with matching attribute combination.
     * Matches both legacy hardcoded fields and new dynamic attributes array.
     */
    const findProductBySellerAndAttributes = async (sellerId, attributes, excludeProductId = null, options = {}) =>
    {
        const conditions = [];

        // Legacy hardcoded field matching
        if (attributes.color) conditions.push({ 'variants.attributes.color': attributes.color });
        if (attributes.size) conditions.push({ 'variants.attributes.size': attributes.size });
        if (attributes.storage) conditions.push({ 'variants.attributes.storage': attributes.storage });
        if (attributes.ram) conditions.push({ 'variants.attributes.ram': attributes.ram });

        // Dynamic attribute matching — each pair must exist in the variant's dynamic array
        if (Array.isArray(attributes.dynamic) && attributes.dynamic.length > 0)
        {
            attributes.dynamic.forEach((attr) =>
            {
                if (attr.name && attr.value)
                {
                    conditions.push({
                        variants: {
                            $elemMatch: {
                                'attributes.dynamic': { $elemMatch: { name: attr.name, value: attr.value } }
                            }
                        }
                    });
                }
            });
        }

        if (conditions.length === 0) return null;

        const query = {
            seller: sellerId,
            $and: conditions,
        };
        if (excludeProductId)
        {
            query._id = { $ne: excludeProductId };
        }
        return Product.findOne(query, null, options).lean();
    };

    /**
     * Full-Text Keyword Search Engine.
     * Leverages MongoDB native $text index matching with text score relevance rankings.
     */
    const searchProducts = async ({ searchQuery }) =>
    {
        return Product.find(
            { $text: { $search: searchQuery } },
            { score: { $meta: 'textScore' } } // Attaches relevant query matches metrics scores
        )
            .sort({ score: { $meta: 'textScore' } }) // Priority order matching highest search density
            .populate('category')
            .populate({
                path: 'seller',
                select: 'sellerName email mobile businessDetails.businessName pickupAddress'
            })
            .lean();
    };

    /**
     * Aggregates filter metadata for a given category.
     * Returns unique dynamic attribute values, price range, and brands
     * based on actual products in the category.
     *
     * @param {string} categoryId - The category ObjectId to filter metadata for
     * @returns {Object} { attributes: [{name, code, values}], priceRange: {min, max}, brands: [] }
     */
    const getFilterMetadata = async (categoryId) =>
    {
        const pipeline = [
            { $match: { category: categoryId } },
            { $unwind: '$variants' },
            { $match: { 'variants.isActive': true } },
            {
                $facet: {
                    attributes: [
                        { $unwind: '$variants.attributes.dynamic' },
                        {
                            $group: {
                                _id: '$variants.attributes.dynamic.name',
                                values: { $addToSet: '$variants.attributes.dynamic.value' },
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    priceRange: [
                        {
                            $group: {
                                _id: null,
                                minPrice: { $min: '$variants.price' },
                                maxPrice: { $max: '$variants.price' }
                            }
                        }
                    ],
                    brands: [
                        { $group: { _id: '$brand' } },
                        { $sort: { _id: 1 } }
                    ]
                }
            }
        ];

        const [result] = await Product.aggregate(pipeline);

        return {
            attributes: (result?.attributes || []).map((a) => ({
                name: a._id,
                values: a.values.sort(),
            })),
            priceRange: result?.priceRange?.[0]
                ? { min: result.priceRange[0].minPrice, max: result.priceRange[0].maxPrice }
                : { min: 0, max: 0 },
            brands: (result?.brands || []).map((b) => b._id).filter(Boolean).sort(),
        };
    };

    /**
     * Advanced Dynamic Catalog Queries Filter & Spring-Boot Compatible Pagination Builder.
     * Compiles custom filters ranges on top of single database cursors scans.
     * Securely populates both category and seller details matching frontend expectations.
     * Supports dynamic attribute filtering via the `dynamicFilters` map.
     */
    const getAllProducts = async ({
        category = null,
        brand = null,
        color = null,
        size = null,
        minPrice = 0,
        maxPrice = Number.MAX_SAFE_INTEGER,
        minDiscount = 0,
        sort = 'newest',
        stock = null,
        pageNumber = 0,
        sizeLimit = 10,
        dynamicFilters = {}
    }) =>
    {

        // 1. Instantiate Mongoose querying filter criteria object
        const filterQuery = {};

        // A. Categories constraints resolution (Directly assigns pre-resolved Mongoose ObjectId passed from Service)
        if (category)
        {
            filterQuery.category = category;
        }

        // B. Alphanumeric filters mapping (Supports loose case-insensitive matching)
        if (brand)
        {
            filterQuery.brand = { $regex: brand.trim(), $options: 'i' };
        }
        if (color)
        {
            filterQuery.color = { $regex: color.trim(), $options: 'i' };
        }
        if (size)
        {
            filterQuery.sizes = { $regex: size.trim(), $options: 'i' };
        }

        // C. Inventory Stock Status Filter
        if (stock)
        {
            const targetStock = stock.toLowerCase().trim();
            if (targetStock === 'in_stock')
            {
                filterQuery.quantity = { $gt: 0 };
            } else if (targetStock === 'out_of_stock')
            {
                filterQuery.quantity = 0;
            }
        }

        // D. Mathematical Ranges validations filters (Prices & Discounts caps)
        filterQuery.sellingPrice = {
            $gte: parseFloat(minPrice),
            $lte: parseFloat(maxPrice)
        };

        if (minDiscount > 0)
        {
            filterQuery.discountPercent = { $gte: parseInt(minDiscount, 10) };
        }

        // E. Dynamic attribute filters — each filter requires at least one variant to match
        if (dynamicFilters && Object.keys(dynamicFilters).length > 0)
        {
            const dynamicConditions = Object.entries(dynamicFilters).map(([attrCode, attrValue]) => ({
                variants: {
                    $elemMatch: {
                        isActive: true,
                        'attributes.dynamic': {
                            $elemMatch: { name: attrCode, value: attrValue }
                        }
                    }
                }
            }));

            if (dynamicConditions.length === 1)
            {
                Object.assign(filterQuery, dynamicConditions[0]);
            } else if (dynamicConditions.length > 1)
            {
                filterQuery.$and = dynamicConditions;
            }
        }

        // 2. Map sorting parameters properties to MongoDB operators
        let sortCriteria = { createdAt: -1 }; // Default: Newest first

        if (sort === 'price_low')
        {
            sortCriteria = { sellingPrice: 1 };
        } else if (sort === 'price_high')
        {
            sortCriteria = { sellingPrice: -1 };
        } else if (sort === 'discount')
        {
            sortCriteria = { discountPercent: -1 };
        } else if (sort === 'newest')
        {
            sortCriteria = { createdAt: -1 };
        }

        // 3. Mathematical Pagination offsets conversions
        const skipOffset = Math.max(0, parseInt(pageNumber, 10)) * parseInt(sizeLimit, 10);
        const limitConstraint = Math.max(1, parseInt(sizeLimit, 10));

        // 4. Concurrent Database Pipelines executions
        const [content, totalElements] = await Promise.all([
            // Pipeline A: Extract paginated items cursors
            Product.find(filterQuery)
                .sort(sortCriteria)
                .skip(skipOffset)
                .limit(limitConstraint)
                .populate('category')
                .populate({
                    path: 'seller',
                    select: 'sellerName email mobile businessDetails'
                })
                .lean(),

            // Pipeline B: Aggregate total elements counts matching filter criteria
            Product.countDocuments(filterQuery)
        ]);

        const totalPages = Math.ceil(totalElements / limitConstraint);

        // 5. Package output exactly matching Spring-compatible payloads format
        return {
            content,
            totalPages,
            totalElements,
            pageNumber: parseInt(pageNumber, 10),
        };
    };

    const reserveProductStock = async ({ productId, quantity }, options = {}) =>
    {
        const result = await Product.findOneAndUpdate(
            { _id: productId, $expr: { $gte: [{ $subtract: ['$quantity', '$reservedQuantity'] }, quantity] } },
            { $inc: { reservedQuantity: quantity } },
            { ...options, new: true, runValidators: true }
        ).lean();

        if (!result) return null;

        if (result.reservedQuantity > result.quantity)
        {
            await Product.findOneAndUpdate(
                { _id: productId },
                { $inc: { reservedQuantity: -quantity } },
                { new: true, runValidators: true }
            );
            return null;
        }

        return result;
    };

    const reserveVariantStock = async ({ productId, variantId, quantity }, options = {}) =>
    {
        const result = await Product.findOneAndUpdate(
            { _id: productId, 'variants._id': variantId },
            { $inc: { 'variants.$.reservedQuantity': quantity } },
            { ...options, new: true, runValidators: true }
        ).lean();

        if (!result) return null;

        const variant = result.variants.find((v) => v._id.toString() === variantId.toString());
        if (!variant || variant.reservedQuantity > variant.quantity)
        {
            await Product.findOneAndUpdate(
                { _id: productId, 'variants._id': variantId },
                { $inc: { 'variants.$.reservedQuantity': -quantity } },
                { new: true, runValidators: true }
            );
            return null;
        }

        return result;
    };

    const releaseProductStock = async ({ productId, quantity }, options = {}) =>
    {
        return Product.findOneAndUpdate(
            { _id: productId, $expr: { $gte: ['$reservedQuantity', quantity] } },
            { $inc: { reservedQuantity: -quantity } },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    const releaseVariantStock = async ({ productId, variantId, quantity }, options = {}) =>
    {
        return Product.findOneAndUpdate(
            {
                _id: productId,
                variants: {
                    $elemMatch: {
                        _id: variantId,
                        reservedQuantity: { $gte: quantity },
                    },
                },
            },
            { $inc: { 'variants.$.reservedQuantity': -quantity } },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    const commitProductStock = async ({ productId, quantity }, options = {}) =>
    {
        return Product.findOneAndUpdate(
            { _id: productId },
            { $inc: { quantity: -quantity, reservedQuantity: -quantity } },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    const commitVariantStock = async ({ productId, variantId, quantity }, options = {}) =>
    {
        return Product.findOneAndUpdate(
            { _id: productId, 'variants._id': variantId },
            { $inc: { 'variants.$.quantity': -quantity, 'variants.$.reservedQuantity': -quantity } },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    // ==========================================
    // RESTOCK OPERATIONS (Return flow)
    // ==========================================

    /**
     * Restocks a non-variant product after a returned item is received.
     * Increments quantity to reflect stock replenishment.
     */
    const restockProductStock = async ({ productId, quantity }, options = {}) =>
    {
        return Product.findOneAndUpdate(
            { _id: productId },
            { $inc: { quantity } },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    /**
     * Restocks a specific variant after a returned item is received.
     * Increments variant quantity to reflect stock replenishment.
     */
    const restockVariantStock = async ({ productId, variantId, quantity }, options = {}) =>
    {
        return Product.findOneAndUpdate(
            { _id: productId, 'variants._id': variantId },
            { $inc: { 'variants.$.quantity': quantity } },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    // ==========================================
    // BULK VARIANT OPERATIONS
    // ==========================================

    /**
     * Bulk updates pricing fields (price, mrpPrice, discountPercent) for multiple variants.
     * Uses MongoDB positional array filters for a single atomic write.
     */
    const bulkUpdateVariantPricing = async (productId, variantIds, priceData, options = {}) =>
    {
        const setFields = {};
        if (priceData.price !== undefined) setFields['variants.$.price'] = priceData.price;
        if (priceData.mrpPrice !== undefined) setFields['variants.$.mrpPrice'] = priceData.mrpPrice;
        if (priceData.discountPercent !== undefined) setFields['variants.$.discountPercent'] = priceData.discountPercent;

        if (Object.keys(setFields).length === 0) return null;

        return Product.findOneAndUpdate(
            { _id: productId, 'variants._id': { $in: variantIds } },
            {
                $set: Object.fromEntries(
                    Object.entries(setFields).map(([key, val]) => [key.replace('.$.', '.$[v].'), val])
                ),
            },
            {
                ...options,
                arrayFilters: [{ 'v._id': { $in: variantIds } }],
                new: true,
                runValidators: true,
            }
        ).lean();
    };

    /**
     * Bulk updates stock quantity for multiple variants.
     * Supports absolute set, increment, or decrement via the `operation` param.
     */
    const bulkUpdateVariantInventory = async (productId, variantIds, { quantity, operation = 'set' }, options = {}) =>
    {
        let update;
        if (operation === 'set')
        {
            update = { $set: { 'variants.$.quantity': quantity } };
        } else if (operation === 'increment')
        {
            update = { $inc: { 'variants.$.quantity': Math.abs(quantity) } };
        } else if (operation === 'decrement')
        {
            update = { $inc: { 'variants.$.quantity': -Math.abs(quantity) } };
        } else
        {
            return null;
        }

        return Product.findOneAndUpdate(
            { _id: productId, 'variants._id': { $in: variantIds } },
            {
                $set: operation === 'set'
                    ? { 'variants.$[v].quantity': quantity }
                    : undefined,
                $inc: operation !== 'set'
                    ? { 'variants.$.quantity': operation === 'increment' ? Math.abs(quantity) : -Math.abs(quantity) }
                    : undefined,
            },
            {
                ...options,
                arrayFilters: operation === 'set' ? [{ 'v._id': { $in: variantIds } }] : undefined,
                new: true,
                runValidators: true,
            }
        ).lean();
    };

    /**
     * Bulk updates active/inactive status for multiple variants.
     */
    const bulkUpdateVariantStatus = async (productId, variantIds, isActive, options = {}) =>
    {
        return Product.findOneAndUpdate(
            { _id: productId, 'variants._id': { $in: variantIds } },
            { $set: { 'variants.$[v].isActive': isActive } },
            {
                ...options,
                arrayFilters: [{ 'v._id': { $in: variantIds } }],
                new: true,
                runValidators: true,
            }
        ).lean();
    };

    return Object.freeze({
        create,
        findById,
        update,
        delete: deleteProduct,
        findBySellerId,
        searchProducts,
        getAllProducts,
        getFilterMetadata,
        addVariant,
        updateVariant,
        removeVariant,
        findVariant,
        updateVariantStock,
        findProductBySellerAndSku,
        findMaxSkuSequenceByPrefix,
        findProductBySellerAndAttributes,
        reserveProductStock,
        reserveVariantStock,
        releaseProductStock,
        releaseVariantStock,
        commitProductStock,
        commitVariantStock,
        restockProductStock,
        restockVariantStock,
        bulkUpdateVariantPricing,
        bulkUpdateVariantInventory,
        bulkUpdateVariantStatus,
    });
};