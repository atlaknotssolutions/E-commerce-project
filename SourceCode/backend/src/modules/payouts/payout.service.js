import { PAYOUT_STATUS, COMMISSION_STATUS, GATEWAY_PAYOUT_STATUS } from '../../constants/enums.js';
import mongoose from 'mongoose';

export const createPayoutService = ({
    payoutRepository,
    commissionRepository,
    sellerReportRepository,
    settlementService,
    sellerRepository,
    razorpayXGateway,
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

    const ensureRazorpayXFundAccount = async (sellerId) => {
        if (!razorpayXGateway) return null;

        const seller = await sellerRepository.findById(sellerId);
        if (!seller) {
            throw createApiError({ statusCode: 404, message: 'Seller not found' });
        }

        if (seller.razorpayxFundAccountId && seller.razorpayxFundAccountStatus === 'ACTIVE') {
            return seller.razorpayxFundAccountId;
        }

        const bankDetails = seller.bankDetails;
        if (!bankDetails || !bankDetails.accountNumber || !bankDetails.IFSC) {
            throw createApiError({
                statusCode: 400,
                message: 'Seller bank details are required for RazorpayX payout. Please update bank details first.',
            });
        }

        // Create or re-use contact
        let contactId = seller.razorpayxContactId;
        if (!contactId) {
            try {
                const contact = await razorpayXGateway.createContact({
                    name: seller.businessDetails?.businessName || seller.sellerName,
                    email: seller.email,
                    contact: seller.mobile,
                    referenceId: seller._id.toString(),
                });
                contactId = contact.id;
                await sellerRepository.updateRazorpayXFields({
                    id: sellerId,
                    contactId,
                });
            } catch (error) {
                throw createApiError({
                    statusCode: 502,
                    message: `Failed to create RazorpayX contact: ${error.message || error}`,
                });
            }
        }

        // Create fund account
        try {
            const fundAccount = await razorpayXGateway.createFundAccount({
                contactId,
                accountHolderName: bankDetails.accountHolderName,
                accountNumber: bankDetails.accountNumber.replace(/\s/g, ''),
                ifsc: bankDetails.IFSC,
                referenceId: `${seller._id.toString()}-${Date.now()}`,
            });

            await sellerRepository.updateRazorpayXFields({
                id: sellerId,
                fundAccountId: fundAccount.id,
                fundAccountStatus: fundAccount.active ? 'ACTIVE' : 'PENDING',
            });

            return fundAccount.id;
        } catch (error) {
            throw createApiError({
                statusCode: 502,
                message: `Failed to create RazorpayX fund account: ${error.message || error}`,
            });
        }
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
                message: `Insufficient available balance. Available: \u20B9${balance.availableBalance}`,
            });
        }

        // Ensure RazorpayX fund account exists before allowing payout request
        if (razorpayXGateway) {
            await ensureRazorpayXFundAccount(sellerId);
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

        // Resolve the fund account ID for the seller
        const sellerId = payout.seller?._id || payout.seller;
        let fundAccountId;

        if (razorpayXGateway) {
            const seller = await sellerRepository.findById(sellerId);
            if (seller?.razorpayxFundAccountId && seller?.razorpayxFundAccountStatus === 'ACTIVE') {
                fundAccountId = seller.razorpayxFundAccountId;
            } else {
                fundAccountId = await ensureRazorpayXFundAccount(sellerId);
            }
        } else {
            fundAccountId = `fa_${sellerId}`;
        }

        const provider = razorpayXGateway ? 'RAZORPAYX' : (mockGatewaysConfig?.defaultPayoutProvider || 'mock_razorpayx');
        const gateway = razorpayXGateway || paymentGatewayFactory.getPayoutGateway(provider);
        const idempotencyKey = gatewayUtils.generateIdempotencyKey('PAYOUT', payoutId.toString(), 1);
        const correlationId = gatewayUtils.generateCorrelationId();

        const gatewayResponse = await gateway.createPayout({
            entityId: payoutId.toString(),
            amount: payout.amount,
            currency: 'INR',
            mode: 'NEFT',
            purpose: 'payout',
            referenceId: `ref_${payoutId.toString()}`,
            fundAccountId,
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

        // Create settlement record
        if (settlementService) {
            try {
                await settlementService.createSettlementRecord({
                    payoutId,
                    sellerId,
                    type: 'PAYOUT',
                    amount: payout.amount,
                    gatewayPayoutId: gatewayResponse.id,
                    referenceId: `ref_${payoutId.toString()}`,
                    bankAccount: payout.seller?.bankDetails || null,
                });
            } catch (err) {
                // Non-blocking — payout succeeded, settlement logging is secondary
            }
        }

        return mapPayout(claimed);
    };

    const processBatchPayouts = async ({ payoutIds, adminId } = {}) => {
        let ids = payoutIds;
        if (!ids || ids.length === 0) {
            const pending = await payoutRepository.findAll({ status: PAYOUT_STATUS.APPROVED, limit: 50 });
            ids = pending.payouts
                .filter((p) => !p.gatewayPayoutId)
                .map((p) => p._id.toString());
        }

        const results = [];
        for (const id of ids) {
            try {
                const result = await executeGatewayPayout(id);
                results.push({ payoutId: id, success: true, payout: result });
            } catch (error) {
                results.push({ payoutId: id, success: false, error: error.message });
            }
        }
        return results;
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

        // Complete the settlement record
        if (settlementService) {
            try {
                const settlement = await settlementService.findByPayout(payoutId);
                if (settlement) {
                    await settlementService.completeSettlement(settlement._id, {
                        settledAt: new Date(),
                    });
                }
            } catch (err) { /* non-blocking */ }
        }

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

    const updateBankDetails = async ({ sellerId, bankDetails }) => {
        const seller = await sellerRepository.findById(sellerId);
        if (!seller) {
            throw createApiError({ statusCode: 404, message: 'Seller not found' });
        }

        // Clear existing RazorpayX fund account so it gets recreated on next payout
        await sellerRepository.updateRazorpayXFields({
            id: sellerId,
            fundAccountId: null,
            fundAccountStatus: null,
        });

        const SellerModel = mongoose.model('Seller');
        await SellerModel.findByIdAndUpdate(sellerId, {
            $set: {
                'bankDetails.accountNumber': bankDetails.accountNumber,
                'bankDetails.accountHolderName': bankDetails.accountHolderName,
                'bankDetails.IFSC': bankDetails.IFSC,
            },
        });

        // Re-create fund account if RazorpayX gateway is active
        if (razorpayXGateway) {
            try {
                await ensureRazorpayXFundAccount(sellerId);
            } catch (err) {
                // Fund account creation failure should not block bank detail update
            }
        }

        return { success: true, message: 'Bank details updated successfully' };
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

    const getFundAccountStatus = async (sellerId) => {
        const seller = await sellerRepository.findById(sellerId);
        return {
            contactId: seller?.razorpayxContactId || null,
            fundAccountId: seller?.razorpayxFundAccountId || null,
            fundAccountStatus: seller?.razorpayxFundAccountStatus || null,
        };
    };

    return Object.freeze({
        requestPayout,
        approvePayout,
        rejectPayout,
        executeGatewayPayout,
        processBatchPayouts,
        completeBusinessPayout,
        getPayout,
        getSellerPayouts,
        getAllPayouts,
        getPayoutStats,
        getSellerPayoutStats,
        getAvailableBalance,
        ensureRazorpayXFundAccount,
        updateBankDetails,
        getFundAccountStatus,
    });
};
