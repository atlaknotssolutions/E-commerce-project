import { PAYOUT_STATUS, COMMISSION_STATUS, GATEWAY_PAYOUT_STATUS } from '../../constants/enums.js';

export const createPayoutService = ({
    payoutRepository,
    commissionRepository,
    sellerReportRepository,
    paymentGatewayFactory,
    gatewayEventRepository,
    gatewayUtils,
    mockGatewaysConfig,
    createApiError,
    mapPayout,
    mapPayouts,
}) => {
    const VALID_TRANSITIONS = {
        [PAYOUT_STATUS.PENDING]: [PAYOUT_STATUS.APPROVED, PAYOUT_STATUS.REJECTED],
        [PAYOUT_STATUS.APPROVED]: [PAYOUT_STATUS.COMPLETED],
        [PAYOUT_STATUS.REJECTED]: [],
        [PAYOUT_STATUS.COMPLETED]: [],
    };

    const ACTIVE_COMMISSION_STATUSES = [COMMISSION_STATUS.CALCULATED, COMMISSION_STATUS.APPROVED];
    const LOCKED_PAYOUT_STATUSES = [PAYOUT_STATUS.PENDING, PAYOUT_STATUS.APPROVED];

    const validateTransition = (currentStatus, targetStatus) => {
        const allowed = VALID_TRANSITIONS[currentStatus] || [];
        if (!allowed.includes(targetStatus)) {
            throw createApiError({
                statusCode: 400,
                message: `Cannot transition payout from ${currentStatus} to ${targetStatus}`,
            });
        }
    };

    const getAvailableBalance = async (sellerId) => {
        const report = await sellerReportRepository.getOrCreateReport({ sellerId });
        const netEarnings = report.netEarnings || 0;

        const activeCommissions = await commissionRepository.getActiveCommissionTotal(
            sellerId,
            ACTIVE_COMMISSION_STATUSES
        );

        const lockedPayouts = await payoutRepository.getTotalPayoutBySeller(sellerId);

        const available = parseFloat((netEarnings - activeCommissions - lockedPayouts).toFixed(2));
        return {
            netEarnings,
            activeCommissions,
            lockedPayouts,
            availableBalance: Math.max(available, 0),
        };
    };

    const requestPayout = async ({ sellerId, amount }) => {
        if (!amount || amount <= 0) {
            throw createApiError({ statusCode: 400, message: 'Payout amount must be greater than zero' });
        }

        const pending = await payoutRepository.getPendingBySeller(sellerId);
        if (pending) {
            throw createApiError({ statusCode: 409, message: 'A pending payout request already exists' });
        }

        const balance = await getAvailableBalance(sellerId);
        if (balance.availableBalance < amount) {
            throw createApiError({
                statusCode: 400,
                message: `Insufficient available balance. Available: ₹${balance.availableBalance}`,
            });
        }

        const payout = await payoutRepository.create({
            seller: sellerId,
            amount,
            status: PAYOUT_STATUS.PENDING,
            requestedAt: new Date(),
        });
        return mapPayout(payout);
    };

    const approvePayout = async (id, adminId) => {
        const payout = await payoutRepository.findById(id);
        if (!payout) {
            throw createApiError({ statusCode: 404, message: 'Payout record not found' });
        }
        validateTransition(payout.status, PAYOUT_STATUS.APPROVED);
        const updated = await payoutRepository.updateStatus(id, PAYOUT_STATUS.APPROVED, {
            approvedBy: adminId,
            processedAt: new Date(),
        });
        return mapPayout(updated);
    };

    const executeGatewayPayout = async (payoutId) => {
        const payout = await payoutRepository.findById(payoutId);
        if (!payout) {
            throw createApiError({ statusCode: 404, message: 'Payout record not found' });
        }

        if (payout.status !== PAYOUT_STATUS.APPROVED) {
            throw createApiError({ statusCode: 400, message: 'Payout must be approved before gateway execution' });
        }

        if (payout.gatewayPayoutId) {
            throw createApiError({ statusCode: 409, message: 'Payout already sent to gateway' });
        }

        const provider = mockGatewaysConfig?.defaultPayoutProvider || 'mock_razorpayx';
        const gateway = paymentGatewayFactory.getPayoutGateway(provider);
        const idempotencyKey = gatewayUtils.generateIdempotencyKey('PAYOUT', payoutId.toString(), 1);
        const correlationId = gatewayUtils.generateCorrelationId();

        const gatewayResponse = await gateway.createPayout({
            entityId: payoutId.toString(),
            amount: payout.amount,
            currency: 'INR',
            mode: 'NEFT',
            purpose: 'payout',
            referenceId: `ref_${payoutId.toString()}`,
            fundAccountId: `fa_${payout.seller?._id || payout.seller}`,
            idempotencyKey,
            correlationId,
        });

        if (gatewayResponse.status === GATEWAY_PAYOUT_STATUS.FAILED) {
            await payoutRepository.updateGatewayStatus(payoutId, {
                gateway: provider,
                gatewayStatus: GATEWAY_PAYOUT_STATUS.FAILED,
            });
            return mapPayout(await payoutRepository.findById(payoutId));
        }

        const claimed = await payoutRepository.claimForDisbursement(payoutId, {
            gateway: provider,
            gatewayPayoutId: gatewayResponse.id,
            referenceId: `ref_${payoutId.toString()}`,
            gatewayStatus: gatewayResponse.status,
        });

        if (!claimed) {
            throw createApiError({ statusCode: 409, message: 'Payout was concurrently claimed by another request' });
        }

        return mapPayout(claimed);
    };

    const completeBusinessPayout = async (payoutId, options = {}) => {
        const payout = await payoutRepository.findById(payoutId);
        if (!payout) {
            throw createApiError({ statusCode: 404, message: 'Payout record not found' });
        }

        if (payout.status === PAYOUT_STATUS.COMPLETED) {
            return mapPayout(payout);
        }

        if (payout.status !== PAYOUT_STATUS.APPROVED) {
            throw createApiError({ statusCode: 400, message: `Cannot complete payout in status: ${payout.status}` });
        }

        const updated = await payoutRepository.updateStatus(payoutId, PAYOUT_STATUS.COMPLETED, {
            processedAt: new Date(),
        }, options);

        return mapPayout(updated);
    };

    const rejectPayout = async (id, reason) => {
        const payout = await payoutRepository.findById(id);
        if (!payout) {
            throw createApiError({ statusCode: 404, message: 'Payout record not found' });
        }
        validateTransition(payout.status, PAYOUT_STATUS.REJECTED);
        const updated = await payoutRepository.updateStatus(id, PAYOUT_STATUS.REJECTED, {
            rejectionReason: reason || 'Rejected by admin',
            processedAt: new Date(),
        });
        return mapPayout(updated);
    };

    const getPayout = async (id) => {
        const payout = await payoutRepository.findById(id);
        if (!payout) {
            throw createApiError({ statusCode: 404, message: 'Payout record not found' });
        }
        return mapPayout(payout);
    };

    const getSellerPayouts = async (sellerId, filters) => {
        const result = await payoutRepository.findBySeller(sellerId, filters);
        return {
            payouts: mapPayouts(result.payouts),
            pagination: result.pagination,
        };
    };

    const getAllPayouts = async (filters) => {
        const result = await payoutRepository.findAll(filters);
        return {
            payouts: mapPayouts(result.payouts),
            pagination: result.pagination,
        };
    };

    const getPayoutStats = async () => {
        return await payoutRepository.getAdminPayoutStats();
    };

    const getSellerPayoutStats = async (sellerId) => {
        return await payoutRepository.getSellerPayoutStats(sellerId);
    };

    return Object.freeze({
        requestPayout,
        approvePayout,
        rejectPayout,
        executeGatewayPayout,
        completeBusinessPayout,
        getPayout,
        getSellerPayouts,
        getAllPayouts,
        getPayoutStats,
        getSellerPayoutStats,
        getAvailableBalance,
    });
};
