/**
 * Pure function-based factory representing the Product Moderation HTTP API Controllers.
 * Thin controllers — delegates all business logic to the service layer.
 */
export const createProductModerationController = ({ productModerationService }) =>
{
    /**
     * Lists products filtered by approval status.
     * GET /admin/products/pending | /approved | /rejected
     */
    const listByApprovalStatus = (statusKey) => async (req, res) =>
    {
        const { page, limit, search, sortBy, sortOrder } = req.query;

        const opts = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
            search: search || null,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc',
        };

        let result;

        switch (statusKey)
        {
            case 'pending':
                result = await productModerationService.getPendingProducts(opts);
                break;
            case 'approved':
                result = await productModerationService.getApprovedProducts(opts);
                break;
            case 'rejected':
                result = await productModerationService.getRejectedProducts(opts);
                break;
            default:
                result = await productModerationService.getPendingProducts(opts);
        }

        res.status(200).json({
            success: true,
            data: result.products,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    };

    /**
     * Lists products filtered by publish status.
     * GET /admin/products/published | /unpublished
     */
    const listByPublishStatus = (statusKey) => async (req, res) =>
    {
        const { page, limit, search, sortBy, sortOrder } = req.query;

        const opts = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
            search: search || null,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc',
        };

        let result;

        switch (statusKey)
        {
            case 'published':
                result = await productModerationService.getPublishedProducts(opts);
                break;
            case 'unpublished':
                result = await productModerationService.getUnpublishedProducts(opts);
                break;
            default:
                result = await productModerationService.getPublishedProducts(opts);
        }

        res.status(200).json({
            success: true,
            data: result.products,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    };

    /**
     * Lists featured products.
     * GET /admin/products/featured
     */
    const listFeatured = async (req, res) =>
    {
        const { page, limit, search, sortBy, sortOrder } = req.query;

        const opts = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
            search: search || null,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc',
        };

        const result = await productModerationService.getFeaturedProducts(opts);

        res.status(200).json({
            success: true,
            data: result.products,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    };

    /**
     * Lists all products with optional filters.
     * GET /admin/products/all
     */
    const listAll = async (req, res) =>
    {
        const { page, limit, search, sortBy, sortOrder, approvalStatus, publishStatus } = req.query;

        const opts = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
            search: search || null,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc',
            approvalStatus: approvalStatus || null,
            publishStatus: publishStatus || null,
        };

        const result = await productModerationService.getAllProducts(opts);

        res.status(200).json({
            success: true,
            data: result.products,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    };

    /**
     * Returns full details for a single product.
     * GET /admin/products/:productId
     */
    const getProductDetails = async (req, res) =>
    {
        const { productId } = req.params;

        const product = await productModerationService.getProductDetails(productId);

        res.status(200).json({ success: true, data: product });
    };

    /**
     * Approves a pending product.
     * PATCH /admin/products/:productId/approve
     */
    const approveProduct = async (req, res) =>
    {
        const { productId } = req.params;
        const { note } = req.body;
        const adminId = req.user.id;

        const result = await productModerationService.approveProduct({
            productId,
            adminId,
            note,
        });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Rejects a pending product. Reason is required.
     * PATCH /admin/products/:productId/reject
     */
    const rejectProduct = async (req, res) =>
    {
        const { productId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const result = await productModerationService.rejectProduct({
            productId,
            adminId,
            reason,
        });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Publishes an approved product.
     * PATCH /admin/products/:productId/publish
     */
    const publishProduct = async (req, res) =>
    {
        const { productId } = req.params;
        const adminId = req.user.id;

        const result = await productModerationService.publishProduct({
            productId,
            adminId,
        });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Unpublishes a published product.
     * PATCH /admin/products/:productId/unpublish
     */
    const unpublishProduct = async (req, res) =>
    {
        const { productId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const result = await productModerationService.unpublishProduct({
            productId,
            adminId,
            reason,
        });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Features a published product.
     * PATCH /admin/products/:productId/feature
     */
    const featureProduct = async (req, res) =>
    {
        const { productId } = req.params;
        const adminId = req.user.id;

        const result = await productModerationService.featureProduct({
            productId,
            adminId,
        });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Unfeatures a featured product.
     * PATCH /admin/products/:productId/unfeature
     */
    const unfeatureProduct = async (req, res) =>
    {
        const { productId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const result = await productModerationService.unfeatureProduct({
            productId,
            adminId,
            reason,
        });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Soft-deletes a product. Reason is required.
     * DELETE /admin/products/:productId
     */
    const deleteProduct = async (req, res) =>
    {
        const { productId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const result = await productModerationService.deleteProduct({
            productId,
            adminId,
            reason,
        });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Returns product moderation statistics.
     * GET /admin/products/stats
     */
    const getStats = async (req, res) =>
    {
        const stats = await productModerationService.getModerationStats();

        res.status(200).json({ success: true, data: stats });
    };

    return Object.freeze({
        listPending: listByApprovalStatus('pending'),
        listApproved: listByApprovalStatus('approved'),
        listRejected: listByApprovalStatus('rejected'),
        listPublished: listByPublishStatus('published'),
        listUnpublished: listByPublishStatus('unpublished'),
        listFeatured,
        listAll,
        getProductDetails,
        approveProduct,
        rejectProduct,
        publishProduct,
        unpublishProduct,
        featureProduct,
        unfeatureProduct,
        deleteProduct,
        getStats,
    });
};
