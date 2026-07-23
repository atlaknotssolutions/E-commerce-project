/**
 * Pure function-based factory representing the Product Moderation Business Service layer.
 * Coordinates approval workflow, publish management, featuring, soft-delete, audit trails, and notifications.
 */
export const createProductModerationService = ({
    productModerationRepository,
    notificationService,
    createApiError,
}) =>
{
    /**
     * Fires a fire-and-forget notification to the seller's linked user account.
     * Catches errors silently — notification failure must never block the core action.
     */
    const notifySeller = (userId, message) =>
    {
        notificationService.createNotification({
            customerId: userId,
            message,
        }).catch(() => {});
    };

    /**
     * Creates an audit trail entry for a moderation action.
     */
    const createAuditEntry = (action, adminId, reason = null, previousStatus = null, newStatus = null) =>
    ({
        action,
        adminId,
        reason,
        previousStatus,
        newStatus,
        timestamp: new Date(),
    });

    /**
     * Retrieves products by approval status with pagination.
     */
    const getPendingProducts = async (opts) =>
    {
        return productModerationRepository.findPendingProducts(opts);
    };

    const getApprovedProducts = async (opts) =>
    {
        return productModerationRepository.findApprovedProducts(opts);
    };

    const getRejectedProducts = async (opts) =>
    {
        return productModerationRepository.findRejectedProducts(opts);
    };

    const getPublishedProducts = async (opts) =>
    {
        return productModerationRepository.findPublishedProducts(opts);
    };

    const getUnpublishedProducts = async (opts) =>
    {
        return productModerationRepository.findUnpublishedProducts(opts);
    };

    const getFeaturedProducts = async (opts) =>
    {
        return productModerationRepository.findFeaturedProducts(opts);
    };

    /**
     * Retrieves all products with optional filters.
     */
    const getAllProducts = async (opts) =>
    {
        return productModerationRepository.findAllProducts(opts);
    };

    /**
     * Retrieves full product details by ID.
     */
    const getProductDetails = async (productId) =>
    {
        const product = await productModerationRepository.findProductById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'The requested product does not exist.',
            });
        }

        return product;
    };

    /**
     * Approves a product. Only PENDING products can be approved.
     * Sets approvalStatus → APPROVED.
     */
    const approveProduct = async ({ productId, adminId, note }) =>
    {
        const product = await productModerationRepository.findProductById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'The requested product does not exist.',
            });
        }

        if (product.approvalStatus !== 'PENDING')
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATE_TRANSITION',
                message: `Cannot approve product: current approval status is '${product.approvalStatus}'. Only PENDING products can be approved.`,
            });
        }

        const auditEntry = createAuditEntry('APPROVED', adminId, note || null, 'PENDING', 'APPROVED');

        const updated = await productModerationRepository.updateModerationStatus({
            productId,
            approvalStatus: 'APPROVED',
            auditEntry,
        });

        if (product.seller && product.seller._id)
        {
            const seller = await productModerationRepository.findSellerById(product.seller._id);
            if (seller && seller.user)
            {
                notifySeller(
                    seller.user,
                    `Your product "${product.title}" has been approved.`
                );
            }
        }

        return updated;
    };

    /**
     * Rejects a product. Only PENDING products can be rejected.
     * Sets approvalStatus → REJECTED. Reason is required.
     */
    const rejectProduct = async ({ productId, adminId, reason }) =>
    {
        if (!reason || !reason.trim())
        {
            throw createApiError({
                statusCode: 400,
                code: 'REASON_REQUIRED',
                message: 'A reason is required to reject a product.',
            });
        }

        const product = await productModerationRepository.findProductById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'The requested product does not exist.',
            });
        }

        if (product.approvalStatus !== 'PENDING')
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATE_TRANSITION',
                message: `Cannot reject product: current approval status is '${product.approvalStatus}'. Only PENDING products can be rejected.`,
            });
        }

        const auditEntry = createAuditEntry('REJECTED', adminId, reason, 'PENDING', 'REJECTED');

        const updated = await productModerationRepository.updateModerationStatus({
            productId,
            approvalStatus: 'REJECTED',
            auditEntry,
        });

        if (product.seller && product.seller._id)
        {
            const seller = await productModerationRepository.findSellerById(product.seller._id);
            if (seller && seller.user)
            {
                notifySeller(
                    seller.user,
                    `Your product "${product.title}" has been rejected. Reason: ${reason}`
                );
            }
        }

        return updated;
    };

    /**
     * Publishes a product. Only APPROVED products can be published.
     * Sets publishStatus → PUBLISHED.
     */
    const publishProduct = async ({ productId, adminId }) =>
    {
        const product = await productModerationRepository.findProductById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'The requested product does not exist.',
            });
        }

        if (product.approvalStatus !== 'APPROVED')
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATE_TRANSITION',
                message: `Cannot publish product: approval status is '${product.approvalStatus}'. Only APPROVED products can be published.`,
            });
        }

        if (product.publishStatus === 'PUBLISHED')
        {
            throw createApiError({
                statusCode: 400,
                code: 'ALREADY_PUBLISHED',
                message: 'This product is already published.',
            });
        }

        const auditEntry = createAuditEntry('PUBLISHED', adminId, null, product.publishStatus, 'PUBLISHED');

        const updated = await productModerationRepository.updateModerationStatus({
            productId,
            publishStatus: 'PUBLISHED',
            auditEntry,
        });

        return updated;
    };

    /**
     * Unpublishes a product. Only PUBLISHED products can be unpublished.
     * Sets publishStatus → UNPUBLISHED.
     */
    const unpublishProduct = async ({ productId, adminId, reason }) =>
    {
        const product = await productModerationRepository.findProductById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'The requested product does not exist.',
            });
        }

        if (product.publishStatus !== 'PUBLISHED')
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATE_TRANSITION',
                message: `Cannot unpublish product: current publish status is '${product.publishStatus}'. Only PUBLISHED products can be unpublished.`,
            });
        }

        const auditEntry = createAuditEntry('UNPUBLISHED', adminId, reason || null, 'PUBLISHED', 'UNPUBLISHED');

        const updated = await productModerationRepository.updateModerationStatus({
            productId,
            publishStatus: 'UNPUBLISHED',
            isFeatured: false,
            featuredAt: null,
            auditEntry,
        });

        return updated;
    };

    /**
     * Features a product. Only PUBLISHED products can be featured.
     * Sets isFeatured → true, featuredAt → now.
     */
    const featureProduct = async ({ productId, adminId }) =>
    {
        const product = await productModerationRepository.findProductById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'The requested product does not exist.',
            });
        }

        if (product.publishStatus !== 'PUBLISHED')
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATE_TRANSITION',
                message: `Cannot feature product: publish status is '${product.publishStatus}'. Only PUBLISHED products can be featured.`,
            });
        }

        if (product.isFeatured)
        {
            throw createApiError({
                statusCode: 400,
                code: 'ALREADY_FEATURED',
                message: 'This product is already featured.',
            });
        }

        const auditEntry = createAuditEntry('FEATURED', adminId, null, 'NOT_FEATURED', 'FEATURED');

        const updated = await productModerationRepository.updateModerationStatus({
            productId,
            isFeatured: true,
            featuredAt: new Date(),
            auditEntry,
        });

        return updated;
    };

    /**
     * Unfeatures a product. Only FEATURED products can be unfeatured.
     * Sets isFeatured → false, featuredAt → null.
     */
    const unfeatureProduct = async ({ productId, adminId, reason }) =>
    {
        const product = await productModerationRepository.findProductById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'The requested product does not exist.',
            });
        }

        if (!product.isFeatured)
        {
            throw createApiError({
                statusCode: 400,
                code: 'NOT_FEATURED',
                message: 'This product is not currently featured.',
            });
        }

        const auditEntry = createAuditEntry('UNFEATURED', adminId, reason || null, 'FEATURED', 'NOT_FEATURED');

        const updated = await productModerationRepository.updateModerationStatus({
            productId,
            isFeatured: false,
            featuredAt: null,
            auditEntry,
        });

        return updated;
    };

    /**
     * Soft-deletes a product. Sets isDeleted → true.
     */
    const deleteProduct = async ({ productId, adminId, reason }) =>
    {
        if (!reason || !reason.trim())
        {
            throw createApiError({
                statusCode: 400,
                code: 'REASON_REQUIRED',
                message: 'A reason is required to delete a product.',
            });
        }

        const product = await productModerationRepository.findProductById(productId);

        if (!product)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: 'The requested product does not exist.',
            });
        }

        if (product.isDeleted)
        {
            throw createApiError({
                statusCode: 400,
                code: 'ALREADY_DELETED',
                message: 'This product is already deleted.',
            });
        }

        const auditEntry = createAuditEntry('DELETED', adminId, reason, null, 'DELETED');

        const updated = await productModerationRepository.softDeleteProduct({
            productId,
            adminId,
            reason,
            auditEntry,
        });

        return updated;
    };

    /**
     * Returns aggregated product moderation statistics.
     */
    const getModerationStats = async () =>
    {
        return productModerationRepository.countByModerationStatus();
    };

    return Object.freeze({
        getPendingProducts,
        getApprovedProducts,
        getRejectedProducts,
        getPublishedProducts,
        getUnpublishedProducts,
        getFeaturedProducts,
        getAllProducts,
        getProductDetails,
        approveProduct,
        rejectProduct,
        publishProduct,
        unpublishProduct,
        featureProduct,
        unfeatureProduct,
        deleteProduct,
        getModerationStats,
    });
};
