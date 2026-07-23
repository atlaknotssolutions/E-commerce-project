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
     * Checks if a product already has a variant with matching attribute combination.
     */
    const findProductBySellerAndAttributes = async (sellerId, attributes, excludeProductId = null, options = {}) =>
    {
        const variantQuery = {};
        if (attributes.color) variantQuery['variants.attributes.color'] = attributes.color;
        if (attributes.size) variantQuery['variants.attributes.size'] = attributes.size;
        if (attributes.storage) variantQuery['variants.attributes.storage'] = attributes.storage;
        if (attributes.ram) variantQuery['variants.attributes.ram'] = attributes.ram;

        const query = {
            seller: sellerId,
            ...variantQuery,
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
            .lean();
    };

    /**
     * Advanced Dynamic Catalog Queries Filter & Spring-Boot Compatible Pagination Builder.
     * Compiles custom filters ranges on top of single database cursors scans.
     * Securely populates both category and seller details matching frontend expectations [1, 2].
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
        sizeLimit = 10
    }) =>
    {

        // 1. Instantiate Mongoose querying filter criteria object
        const filterQuery = {};

        // A. Categories constraints resolution (Directly assigns pre-resolved Mongoose ObjectId passed from Service) [1]
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
                filterQuery.quantity = { $gt: 0 }; // Quantity greater than 0
            } else if (targetStock === 'out_of_stock')
            {
                filterQuery.quantity = 0; // Out of stock (exactly 0)
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
                .populate('category') // Dynamically populates Level 3 category properties [2]
                .populate({
                    path: 'seller',
                    select: 'sellerName email mobile businessDetails' // Secure Projection: Populates seller identity & business details, masking banking info [2]
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

    return Object.freeze({
        create,
        findById,
        update,
        delete: deleteProduct,
        findBySellerId,
        searchProducts,
        getAllProducts,
        addVariant,
        updateVariant,
        removeVariant,
        findVariant,
        updateVariantStock,
        findProductBySellerAndSku,
        findProductBySellerAndAttributes,
        reserveProductStock,
        reserveVariantStock,
        releaseProductStock,
        releaseVariantStock,
        commitProductStock,
        commitVariantStock,
        restockProductStock,
        restockVariantStock,
    });
};