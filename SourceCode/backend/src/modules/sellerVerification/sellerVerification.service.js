import { mapAdminUser } from '../adminUser/adminUser.mapper.js';

/**
 * Pure function-based factory representing the Seller Verification Business Service layer.
 * Coordinates verification workflow, business rule enforcement, audit trails, and notifications.
 */
export const createSellerVerificationService = ({
    sellerVerificationRepository,
    notificationService,
    createApiError,
}) =>
{
    /**
     * Fires a fire-and-forget notification to the seller.
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
     * Creates an audit trail entry for a verification action.
     */
    const createAuditEntry = (action, adminId, reason = null) =>
    ({
        action,
        adminId,
        reason,
        timestamp: new Date(),
    });

    /**
     * Retrieves sellers by verification status with pagination.
     */
    const getPendingSellers = async (opts) =>
    {
        const result = await sellerVerificationRepository.findPendingSellers(opts);
        return { ...result, sellers: result.sellers.map(mapAdminUser).filter(Boolean) };
    };

    const getApprovedSellers = async (opts) =>
    {
        const result = await sellerVerificationRepository.findApprovedSellers(opts);
        return { ...result, sellers: result.sellers.map(mapAdminUser).filter(Boolean) };
    };

    const getRejectedSellers = async (opts) =>
    {
        const result = await sellerVerificationRepository.findRejectedSellers(opts);
        return { ...result, sellers: result.sellers.map(mapAdminUser).filter(Boolean) };
    };

    const getSuspendedSellers = async (opts) =>
    {
        const result = await sellerVerificationRepository.findSuspendedSellers(opts);
        return { ...result, sellers: result.sellers.map(mapAdminUser).filter(Boolean) };
    };

    /**
     * Retrieves full seller details by ID.
     */
    const getSellerDetails = async (sellerId) =>
    {
        const seller = await sellerVerificationRepository.findSellerById(sellerId);

        if (!seller)
        {
            throw createApiError({
                statusCode: 404,
                code: 'SELLER_NOT_FOUND',
                message: 'The requested seller account does not exist.',
            });
        }

        return mapAdminUser(seller);
    };

    /**
     * Approves a seller. Only PENDING sellers can be approved.
     * Sets verificationStatus → APPROVED, accountStatus → ACTIVE.
     */
    const approveSeller = async ({ sellerId, adminId, note }) =>
    {
        const seller = await sellerVerificationRepository.findSellerById(sellerId);

        if (!seller)
        {
            throw createApiError({
                statusCode: 404,
                code: 'SELLER_NOT_FOUND',
                message: 'The requested seller account does not exist.',
            });
        }

        if (seller.verificationStatus !== 'PENDING')
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATE_TRANSITION',
                message: `Cannot approve seller: current verification status is '${seller.verificationStatus}'. Only PENDING sellers can be approved.`,
            });
        }

        const auditEntry = createAuditEntry('APPROVED', adminId, note || null);

        const updated = await sellerVerificationRepository.updateVerificationStatus({
            sellerId,
            verificationStatus: 'APPROVED',
            accountStatus: 'ACTIVE',
            auditEntry,
        });

        notifySeller(
            seller._id,
            'Congratulations! Your seller account has been approved. You can now start selling on the platform.'
        );

        return mapAdminUser(updated);
    };

    /**
     * Rejects a seller. Only PENDING sellers can be rejected.
     * Sets verificationStatus → REJECTED. Reason is required.
     */
    const rejectSeller = async ({ sellerId, adminId, reason }) =>
    {
        if (!reason || !reason.trim())
        {
            throw createApiError({
                statusCode: 400,
                code: 'REASON_REQUIRED',
                message: 'A reason is required to reject a seller.',
            });
        }

        const seller = await sellerVerificationRepository.findSellerById(sellerId);

        if (!seller)
        {
            throw createApiError({
                statusCode: 404,
                code: 'SELLER_NOT_FOUND',
                message: 'The requested seller account does not exist.',
            });
        }

        if (seller.verificationStatus !== 'PENDING')
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATE_TRANSITION',
                message: `Cannot reject seller: current verification status is '${seller.verificationStatus}'. Only PENDING sellers can be rejected.`,
            });
        }

        const auditEntry = createAuditEntry('REJECTED', adminId, reason);

        const updated = await sellerVerificationRepository.updateVerificationStatus({
            sellerId,
            verificationStatus: 'REJECTED',
            auditEntry,
        });

        notifySeller(
            seller._id,
            `Your seller account application has been rejected. Reason: ${reason}`
        );

        return mapAdminUser(updated);
    };

    /**
     * Suspends an active/approved seller.
     * Sets accountStatus → SUSPENDED. Reason is required.
     */
    const suspendSeller = async ({ sellerId, adminId, reason }) =>
    {
        if (!reason || !reason.trim())
        {
            throw createApiError({
                statusCode: 400,
                code: 'REASON_REQUIRED',
                message: 'A reason is required to suspend a seller.',
            });
        }

        const seller = await sellerVerificationRepository.findSellerById(sellerId);

        if (!seller)
        {
            throw createApiError({
                statusCode: 404,
                code: 'SELLER_NOT_FOUND',
                message: 'The requested seller account does not exist.',
            });
        }

        if (seller.accountStatus !== 'ACTIVE')
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATE_TRANSITION',
                message: `Cannot suspend seller: current account status is '${seller.accountStatus}'. Only ACTIVE sellers can be suspended.`,
            });
        }

        const auditEntry = createAuditEntry('SUSPENDED', adminId, reason);

        const updated = await sellerVerificationRepository.updateVerificationStatus({
            sellerId,
            verificationStatus: seller.verificationStatus,
            accountStatus: 'SUSPENDED',
            auditEntry,
        });

        notifySeller(
            seller._id,
            `Your seller account has been suspended. Reason: ${reason}. Please contact support for assistance.`
        );

        return mapAdminUser(updated);
    };

    /**
     * Restores a suspended seller.
     * Sets accountStatus → ACTIVE.
     */
    const restoreSeller = async ({ sellerId, adminId }) =>
    {
        const seller = await sellerVerificationRepository.findSellerById(sellerId);

        if (!seller)
        {
            throw createApiError({
                statusCode: 404,
                code: 'SELLER_NOT_FOUND',
                message: 'The requested seller account does not exist.',
            });
        }

        if (seller.accountStatus !== 'SUSPENDED')
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATE_TRANSITION',
                message: `Cannot restore seller: current account status is '${seller.accountStatus}'. Only SUSPENDED sellers can be restored.`,
            });
        }

        const auditEntry = createAuditEntry('RESTORED', adminId, null);

        const updated = await sellerVerificationRepository.updateVerificationStatus({
            sellerId,
            verificationStatus: seller.verificationStatus,
            accountStatus: 'ACTIVE',
            auditEntry,
        });

        notifySeller(
            seller._id,
            'Your seller account has been restored and is now active. You can resume selling on the platform.'
        );

        return mapAdminUser(updated);
    };

    /**
     * Returns aggregated seller verification statistics.
     */
    const getSellerVerificationStats = async () =>
    {
        return sellerVerificationRepository.countByVerificationStatus();
    };

    return Object.freeze({
        getPendingSellers,
        getApprovedSellers,
        getRejectedSellers,
        getSuspendedSellers,
        getSellerDetails,
        approveSeller,
        rejectSeller,
        suspendSeller,
        restoreSeller,
        getSellerVerificationStats,
    });
};
