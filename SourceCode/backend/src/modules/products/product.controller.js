// /**
//  * Pure function-based factory representing the Product Catalog HTTP Controllers.
//  * Strictly enforces clean isolation patterns, avoiding ES6 classes and context leaks.
//  */
// export const createProductController = ({ productService }) =>
// {

//     /**
//      * Public Catalogue Listings Processor.
//      * Parses dynamic query filters, pricing scales, and pagination offsets safely.
//      * Maps exactly to: GET /products
//      */
//     const getAllProducts = async (req, res) =>
//     {
//         const {
//             category,
//             brand,
//             color,
//             size,
//             minPrice,
//             maxPrice,
//             minDiscount,
//             sort,
//             pageNumber,
//             sizeLimit
//         } = req.query;

//         // Standardizes data offsets applying robust defaults (YAGNI standard)
//         const paginatedOutcome = await productService.getAllProducts({
//             category: category || null,
//             brand: brand || null,
//             color: color || null,
//             size: size || null,
//             minPrice: minPrice ? parseFloat(minPrice) : 0,
//             maxPrice: maxPrice ? parseFloat(maxPrice) : Number.MAX_SAFE_INTEGER,
//             minDiscount: minDiscount ? parseInt(minDiscount, 10) : 0,
//             sort: sort || 'newest',
//             pageNumber: pageNumber ? parseInt(pageNumber, 10) : 0,
//             sizeLimit: sizeLimit ? parseInt(sizeLimit, 10) : 10,
//         });

//         // 200 OK: Delivers Spring-Boot structured packaging back to public client UI
//         res.status(200).json(paginatedOutcome);
//     };

//     /**
//      * Keyword Search Controller. Matches text scoring metrics relevance patterns.
//      * Maps exactly to: GET /products/search?query=...
//      */
//     const searchProducts = async (req, res) =>
//     {
//         const { query } = req.query;

//         const matchedProducts = await productService.searchProducts({ query });

//         res.status(200).json(matchedProducts);
//     };

//     /**
//      * Catalog Details lookup processor.
//      * Maps exactly to: GET /products/:productId
//      */
//     const getProductById = async (req, res) =>
//     {
//         const { productId } = req.params;

//         const productDetail = await productService.getProductById({ productId });

//         res.status(200).json(productDetail);
//     };

//     /**
//      * Private Merchant Seller Stores inventory lookup.
//      * Maps exactly to: GET /sellers/product (Authentication required)
//      */
//     const getSellerProducts = async (req, res) =>
//     {
//         // Reads authenticated vendor ID directly from decoded JWT claims (req.user)
//         const sellerId = req.user.id;

//         // Directly queries dynamic lists from database
//         const sellerListings = await productService.getAllProducts({
//             category: null, // No category restrictions for store listing view
//             brand: null,
//             color: null,
//             size: null,
//             minPrice: 0,
//             maxPrice: Number.MAX_SAFE_INTEGER,
//             minDiscount: 0,
//             sort: 'newest',
//             pageNumber: 0,
//             sizeLimit: 100, // Fetches bulk catalog store rows for vendor tables view
//         });

//         // Filters matching strictly current authenticated merchant IDs
//         const filteredContent = sellerListings.content.filter(
//             (product) => product.seller && product.seller.toString() === sellerId.toString()
//         );

//         res.status(200).json(filteredContent);
//     };

//     /**
//      * Private Merchant Product Onboarding. Creates catalog entries with automatic categories resolution.
//      * Maps exactly to: POST /sellers/product (Seller verification and authorization required)
//      */
//     const createProduct = async (req, res) =>
//     {
//         // Destructures category fields from main request body payload stream
//         const { category, category2, category3, ...productDetails } = req.body;
//         const sellerId = req.user.id; // Mounted securely by route authenticate middleware

//         const newProduct = await productService.createProduct({
//             productData: productDetails,
//             categoryParams: { category, category2, category3 },
//             sellerId,
//         });

//         // 201 Created: New catalog resource successfully registered
//         res.status(201).json(newProduct);
//     };

//     /**
//      * Private Merchant Catalog Item modifier.
//      * Maps exactly to: PUT /sellers/product/:productId (Ownership required)
//      */
//     const updateProduct = async (req, res) =>
//     {
//         const { productId } = req.params;
//         const sellerId = req.user.id;
//         const updatePayload = req.body;

//         const updatedProduct = await productService.updateProduct({
//             productId,
//             updateData: updatePayload,
//             sellerId,
//         });

//         res.status(200).json(updatedProduct);
//     };

//     /**
//      * Private Merchant Catalog Item removal.
//      * Maps exactly to: DELETE /sellers/product/:productId (Ownership required)
//      */
//     const deleteProduct = async (req, res) =>
//     {
//         const { productId } = req.params;
//         const sellerId = req.user.id;

//         const result = await productService.deleteProduct({
//             productId,
//             sellerId,
//         });

//         res.status(200).json(result);
//     };

//     return Object.freeze({
//         getAllProducts,
//         searchProducts,
//         getProductById,
//         getSellerProducts,
//         createProduct,
//         updateProduct,
//         deleteProduct,
//     });
// };



/**
 * Pure function-based factory representing the Product Catalog HTTP Controllers.
 * Strictly enforces thin controller design principles, avoiding classes and context leaks.
 */
export const createProductController = ({ productService }) =>
{

    /**
     * Public Catalogue Listings Processor.
     * Extracts standard filters plus dynamic attribute filters (attr_* prefix).
     */
    const getAllProducts = async (req, res) =>
    {
        const {
            category,
            brand,
            color,
            size,
            minPrice,
            maxPrice,
            minDiscount,
            sort,
            stock,
            pageNumber,
            sizeLimit,
            sellerId
        } = req.query;

        // Extract dynamic attribute filters (attr_color, attr_size, etc.)
        const dynamicFilters = {};
        for (const [key, value] of Object.entries(req.query))
        {
            if (key.startsWith('attr_') && value)
            {
                dynamicFilters[key.substring(5)] = value;
            }
        }

        const paginatedOutcome = await productService.getAllProducts({
            category: category || null,
            brand: brand || null,
            color: color || null,
            size: size || null,
            minPrice: minPrice ? parseFloat(minPrice) : 0,
            maxPrice: maxPrice ? parseFloat(maxPrice) : Number.MAX_SAFE_INTEGER,
            minDiscount: minDiscount ? parseInt(minDiscount, 10) : 0,
            sort: sort || 'newest',
            stock: stock || null,
            pageNumber: pageNumber ? parseInt(pageNumber, 10) : 0,
            sizeLimit: sizeLimit ? parseInt(sizeLimit, 10) : 10,
            sellerId: sellerId || null,
            dynamicFilters,
        });

        res.status(200).json(paginatedOutcome);
    };

    /**
     * Filter Metadata Controller.
     * Returns available attribute values, price range, and brands for a given category.
     * Maps exactly to: GET /products/filters?category=...
     */
    const getFilterMetadata = async (req, res) =>
    {
        const { category } = req.query;

        if (!category)
        {
            return res.status(200).json({ attributes: [], priceRange: { min: 0, max: 0 }, brands: [] });
        }

        const metadata = await productService.getFilterMetadata(category);

        res.status(200).json(metadata);
    };

    /**
     * Keyword Search Controller.
     */
    const searchProducts = async (req, res) =>
    {
        const { query } = req.query;

        const matchedProducts = await productService.searchProducts({ query });

        res.status(200).json(matchedProducts);
    };

    /**
     * Catalog Details lookup processor.
     */
    const getProductById = async (req, res) =>
    {
        const { productId } = req.params;

        const productDetail = await productService.getProductById({ productId });

        res.status(200).json(productDetail);
    };

    /**
     * Private Merchant Seller Stores inventory lookup.
     * Employs robust defensive checks to safely compare populated/unpopulated seller IDs [INDEX].
     * Maps exactly to: GET /sellers/product (Authentication required)
     */
    const getSellerProducts = async (req, res) =>
    {
        // Reads authenticated vendor ID directly from decoded JWT claims (req.user)
        const sellerId = req.user.id;

        // Directly queries dynamic lists from database
        const sellerListings = await productService.getAllProducts({
            category: null,
            brand: null,
            color: null,
            size: null,
            minPrice: 0,
            maxPrice: Number.MAX_SAFE_INTEGER,
            minDiscount: 0,
            sort: 'newest',
            pageNumber: 0,
            sizeLimit: 100, // Fetches bulk catalog store rows for vendor tables view
        });

        // Filters matching strictly current authenticated merchant IDs [INDEX]
        const filteredContent = sellerListings.content.filter((product) =>
        {
            if (!product.seller) return false;

            // Defensive checking: Extracts exact ID string whether populated or plain ObjectId [INDEX]
            const sellerIdFromProduct = product.seller._id
                ? product.seller._id.toString()
                : product.seller.toString();

            // Strict equality comparison to prevent dynamic array filtration losses [INDEX]
            return sellerIdFromProduct === sellerId.toString();
        });

        res.status(200).json(filteredContent);
    };

    /**
     * Private Merchant Product Onboarding.
     */
    const createProduct = async (req, res) =>
    {
        const { category, category2, category3, ...productDetails } = req.body;
        const sellerId = req.user.id;

        const newProduct = await productService.createProduct({
            productData: productDetails,
            categoryParams: { category, category2, category3 },
            sellerId,
        });

        res.status(201).json(newProduct);
    };

    /**
     * Private Merchant Catalog Item modifier.
     */
    const updateProduct = async (req, res) =>
    {
        const { productId } = req.params;
        const sellerId = req.user.id;

        const {
            category,
            category2,
            category3,
            ...updateData
        } = req.body;

        const updatedProduct = await productService.updateProduct({
            productId,
            updateData,
            categoryParams: {
                category,
                category2,
                category3,
            },
            sellerId,
        });

        res.status(200).json(updatedProduct);
    };

    /**
     * Private Merchant Catalog Item removal.
     */
    const deleteProduct = async (req, res) =>
    {
        const { productId } = req.params;
        const sellerId = req.user.id;

        const result = await productService.deleteProduct({
            productId,
            sellerId,
        });

        res.status(200).json(result);
    };

    // ==========================================
    // VARIANT MANAGEMENT ENDPOINTS
    // ==========================================

    /**
     * Add a new variant to a product.
     */
    const addVariant = async (req, res) =>
    {
        const { id: productId } = req.params;
        const sellerId = req.user.id;
        const variantData = req.body;

        const updatedProduct = await productService.addVariant({
            productId,
            variantData,
            sellerId,
        });

        res.status(201).json(updatedProduct);
    };

    /**
     * Update an existing variant.
     */
    const updateVariant = async (req, res) =>
    {
        const { id: productId, variantId } = req.params;
        const sellerId = req.user.id;
        const updateData = req.body;

        const updatedProduct = await productService.updateVariant({
            productId,
            variantId,
            updateData,
            sellerId,
        });

        res.status(200).json(updatedProduct);
    };

    /**
     * Remove a variant from a product.
     */
    const removeVariant = async (req, res) =>
    {
        const { id: productId, variantId } = req.params;
        const sellerId = req.user.id;

        const updatedProduct = await productService.removeVariant({
            productId,
            variantId,
            sellerId,
        });

        res.status(200).json(updatedProduct);
    };

    /**
     * Update stock quantity for a specific variant.
     */
    const updateVariantStock = async (req, res) =>
    {
        const { id: productId, variantId } = req.params;
        const sellerId = req.user.id;
        const { quantity } = req.body;

        const updatedProduct = await productService.updateVariantStock({
            productId,
            variantId,
            quantity,
            sellerId,
        });

        res.status(200).json(updatedProduct);
    };

    // ==========================================
    // BULK VARIANT OPERATIONS
    // ==========================================

    /**
     * Bulk update pricing for multiple variants.
     */
    const bulkUpdateVariantPricing = async (req, res) =>
    {
        const { id: productId } = req.params;
        const sellerId = req.user.id;
        const { variantIds, priceData } = req.body;

        const updatedProduct = await productService.bulkUpdateVariantPricing({
            productId,
            variantIds,
            priceData,
            sellerId,
        });

        res.status(200).json(updatedProduct);
    };

    /**
     * Bulk update stock for multiple variants.
     */
    const bulkUpdateVariantInventory = async (req, res) =>
    {
        const { id: productId } = req.params;
        const sellerId = req.user.id;
        const { variantIds, quantity, operation } = req.body;

        const updatedProduct = await productService.bulkUpdateVariantInventory({
            productId,
            variantIds,
            quantity,
            operation,
            sellerId,
        });

        res.status(200).json(updatedProduct);
    };

    /**
     * Bulk update active/inactive status for multiple variants.
     */
    const bulkUpdateVariantStatus = async (req, res) =>
    {
        const { id: productId } = req.params;
        const sellerId = req.user.id;
        const { variantIds, isActive } = req.body;

        const updatedProduct = await productService.bulkUpdateVariantStatus({
            productId,
            variantIds,
            isActive,
            sellerId,
        });

        res.status(200).json(updatedProduct);
    };

    return Object.freeze({
        getAllProducts,
        getFilterMetadata,
        searchProducts,
        getProductById,
        getSellerProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        addVariant,
        updateVariant,
        removeVariant,
        updateVariantStock,
        bulkUpdateVariantPricing,
        bulkUpdateVariantInventory,
        bulkUpdateVariantStatus,
    });
};