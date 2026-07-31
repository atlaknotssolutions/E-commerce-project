import { emitToSeller, emitToAdmin } from '../../services/socket.service.js';

/**
 * Pure function-based factory representing the Seller Verification HTTP API Controllers.
 * Thin controllers — delegates all business logic to the service layer.
 */
export const createSellerVerificationController = ({ sellerVerificationService }) =>
{
    /**
     * Lists sellers filtered by verification status.
     * GET /admin/sellers/pending | /approved | /rejected | /suspended
     */
    const listByStatus = (statusKey) => async (req, res) =>
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
                result = await sellerVerificationService.getPendingSellers(opts);
                break;
            case 'approved':
                result = await sellerVerificationService.getApprovedSellers(opts);
                break;
            case 'rejected':
                result = await sellerVerificationService.getRejectedSellers(opts);
                break;
            case 'suspended':
                result = await sellerVerificationService.getSuspendedSellers(opts);
                break;
            default:
                result = await sellerVerificationService.getPendingSellers(opts);
        }

        res.status(200).json({
            success: true,
            data: result.sellers,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    };

    /**
     * Returns full details for a single seller.
     * GET /admin/sellers/:sellerId
     */
    const getSellerDetails = async (req, res) =>
    {
        const { sellerId } = req.params;

        const seller = await sellerVerificationService.getSellerDetails(sellerId);

        res.status(200).json({ success: true, data: seller });
    };

    /**
     * Approves a pending seller.
     * PATCH /admin/sellers/:sellerId/approve
     */
    const approveSeller = async (req, res) =>
    {
        const { sellerId } = req.params;
        const { note } = req.body;
        const adminId = req.user.id;

        const result = await sellerVerificationService.approveSeller({
            sellerId,
            adminId,
            note,
        });

        emitToSeller(sellerId, 'seller:statusChanged', { status: 'APPROVED', sellerId });
        emitToAdmin('admin:sellerApproved', { sellerId, adminId });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Rejects a pending seller. Reason is required.
     * PATCH /admin/sellers/:sellerId/reject
     */
    const rejectSeller = async (req, res) =>
    {
        const { sellerId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const result = await sellerVerificationService.rejectSeller({
            sellerId,
            adminId,
            reason,
        });

        emitToSeller(sellerId, 'seller:statusChanged', { status: 'REJECTED', sellerId, reason });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Suspends an active seller. Reason is required.
     * PATCH /admin/sellers/:sellerId/suspend
     */
    const suspendSeller = async (req, res) =>
    {
        const { sellerId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const result = await sellerVerificationService.suspendSeller({
            sellerId,
            adminId,
            reason,
        });

        emitToSeller(sellerId, 'seller:statusChanged', { status: 'SUSPENDED', sellerId, reason });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Restores a suspended seller.
     * PATCH /admin/sellers/:sellerId/restore
     */
    const restoreSeller = async (req, res) =>
    {
        const { sellerId } = req.params;
        const adminId = req.user.id;

        const result = await sellerVerificationService.restoreSeller({
            sellerId,
            adminId,
        });

        emitToSeller(sellerId, 'seller:statusChanged', { status: 'ACTIVE', sellerId });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Returns seller verification statistics.
     * GET /admin/sellers/stats
     */
    const getStats = async (req, res) =>
    {
        const stats = await sellerVerificationService.getSellerVerificationStats();

        res.status(200).json({ success: true, data: stats });
    };

    return Object.freeze({
        listPending: listByStatus('pending'),
        listApproved: listByStatus('approved'),
        listRejected: listByStatus('rejected'),
        listSuspended: listByStatus('suspended'),
        getSellerDetails,
        approveSeller,
        rejectSeller,
        suspendSeller,
        restoreSeller,
        getStats,
    });
};
