/**
 * Pure function-based routing factory representing the Product Catalog API gateways.
 * Binds public browsing endpoints and secures merchant catalogs using dependency injection.
 */
export const createProductRoutes = ({
    router,
    productController,
    authenticate,
    authorizeRoles,
    asyncHandler
}) =>
{

    // ==========================================
    // PUBLIC CATALOG GATEWAYS (Unrestricted Paths)
    // ==========================================

    // Public Endpoint: Triggers dynamic query filters, ranges scans and page listings
    router.get('/products', asyncHandler(productController.getAllProducts));

    // Public Endpoint: Returns filter metadata (attribute values, price range, brands) for a category
    router.get('/products/filters', asyncHandler(productController.getFilterMetadata));

    // Public Endpoint: Runs full-text relevance keyword searching query maps
    router.get('/products/search', asyncHandler(productController.searchProducts));

    // Public Endpoint: Discover single product detail using unique ObjectId params
    router.get('/products/:productId', asyncHandler(productController.getProductById));


    // ========================================================
    // PRIVATE MERCHANT CATALOG GATEWAYS (Seller Guarded Paths)
    // ========================================================

    // Seller Endpoint: Retrieve own store items catalog lists (Seller verification required)
    router.get(
        '/sellers/product',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(productController.getSellerProducts)
    );

    // Seller Endpoint: Create and list a new catalog product (Onboarding category auto-resolve)
    router.post(
        '/sellers/product',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(productController.createProduct)
    );

    // ==========================================
    // VARIANT MANAGEMENT ENDPOINTS
    // (Must be registered before /:productId routes)
    // ==========================================

    // Seller Endpoint: Bulk update pricing for multiple variants
    router.patch(
        '/sellers/product/:id/variants/bulk-price',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(productController.bulkUpdateVariantPricing)
    );

    // Seller Endpoint: Bulk update stock for multiple variants
    router.patch(
        '/sellers/product/:id/variants/bulk-stock',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(productController.bulkUpdateVariantInventory)
    );

    // Seller Endpoint: Bulk update active/inactive status for multiple variants
    router.patch(
        '/sellers/product/:id/variants/bulk-status',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(productController.bulkUpdateVariantStatus)
    );

    // Seller Endpoint: Add a variant to a product
    router.post(
        '/sellers/product/:id/variants',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(productController.addVariant)
    );

    // Seller Endpoint: Update a specific variant
    router.patch(
        '/sellers/product/:id/variants/:variantId',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(productController.updateVariant)
    );

    // Seller Endpoint: Remove a specific variant
    router.delete(
        '/sellers/product/:id/variants/:variantId',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(productController.removeVariant)
    );

    // Seller Endpoint: Update variant stock
    router.patch(
        '/sellers/product/:id/variants/:variantId/stock',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(productController.updateVariantStock)
    );

    // ==========================================
    // PARAMETERIZED PRODUCT ENDPOINTS
    // (Must be registered AFTER variant routes)
    // ==========================================

    // Seller Endpoint: Safe modify properties updates on owned catalog listing (Enforces seller-ownership validation)
    router.put(
        '/sellers/product/:productId',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(productController.updateProduct)
    );

    // Seller Endpoint: Erase catalog listing owned by active merchant (Enforces seller-ownership validation)
    router.delete(
        '/sellers/product/:productId',
        authenticate,
        authorizeRoles('ROLE_SELLER'),
        asyncHandler(productController.deleteProduct)
    );

    return router;
};