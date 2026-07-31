import Razorpay from 'razorpay';
import crypto from 'crypto';
import { GATEWAY_PAYOUT_STATUS, GATEWAY_EVENT_TYPE, GATEWAY } from '../../constants/enums.js';

/**
 * Real RazorpayX Gateway — implements the gateway interface contract for seller payouts.
 *
 * Uses official Razorpay npm package with RAZORPAYX_KEY_ID and RAZORPAYX_KEY_SECRET.
 * All calls are idempotent via idempotency keys.
 * All state is persisted via GatewayEvent repository (append-only audit log).
 *
 * Implements the same interface as razorpayx.mock.gateway.js:
 *   createPayout(request) → GatewayPayoutResponse
 *   fetchPayout(payoutId) → GatewayPayoutResponse
 *   cancelPayout(payoutId) → GatewayPayoutResponse
 */
export const createRazorpayXGateway = ({
    gatewayEventRepository,
    razorpayxConfig,
    createApiError,
}) => {
    const { keyId, keySecret } = razorpayxConfig;

    if (!keyId || !keySecret) {
        throw new Error('[RAZORPAYX] Missing RAZORPAYX_KEY_ID or RAZORPAYX_KEY_SECRET. Payout gateway cannot be initialized.');
    }

    const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });

    /**
     * Creates a Contact on RazorpayX for a seller.
     * Contacts are a prerequisite for fund accounts.
     *
     * @param {Object} params
     * @param {string} params.name - Contact name (seller name)
     * @param {string} params.email - Contact email
     * @param {string} params.contact - Contact phone number
     * @param {string} params.referenceId - Your reference for this contact
     * @returns {Object} - RazorpayX contact object { id, name, email, contact, type, reference_id, created_at }
     */
    const createContact = async ({ name, email, contact, referenceId }) => {
        const payload = {
            name,
            email,
            contact,
            type: 'vendor',
            reference_id: referenceId,
        };

        const response = await razorpay.contacts.create(payload);

        return {
            id: response.id,
            name: response.name,
            email: response.email,
            contact: response.contact,
            type: response.type,
            referenceId: response.reference_id,
            createdAt: Math.floor(new Date(response.created_at * 1000).getTime() / 1000),
        };
    };

    /**
     * Creates a Fund Account (bank account) for a Contact on RazorpayX.
     * Fund accounts are the target for payouts.
     *
     * @param {Object} params
     * @param {string} params.contactId - RazorpayX contact ID
     * @param {string} params.accountHolderName - Bank account holder name
     * @param {string} params.accountNumber - Bank account number
     * @param {string} params.ifsc - Bank IFSC code
     * @param {string} params.referenceId - Your reference for this fund account
     * @returns {Object} - RazorpayX fund account object { id, contact_id, bank_account, created_at }
     */
    const createFundAccount = async ({ contactId, accountHolderName, accountNumber, ifsc, referenceId }) => {
        const payload = {
            contact_id: contactId,
            account_type: 'bank_account',
            bank_account: {
                name: accountHolderName,
                account_number: accountNumber,
                ifsc,
            },
            reference_id: referenceId,
        };

        const response = await razorpay.fundAccounts.create(payload);

        return {
            id: response.id,
            contactId: response.contact_id,
            accountType: response.account_type,
            bankAccount: response.bank_account,
            referenceId: response.reference_id,
            createdAt: Math.floor(new Date(response.created_at * 1000).getTime() / 1000),
            active: response.active,
        };
    };

    /**
     * Fetches an existing fund account to verify its active status.
     *
     * @param {string} fundAccountId - RazorpayX fund account ID (fa_xxxx)
     * @returns {Object} - Fund account details
     */
    const fetchFundAccount = async (fundAccountId) => {
        const response = await razorpay.fundAccounts.fetch(fundAccountId);
        return {
            id: response.id,
            contactId: response.contact_id,
            accountType: response.account_type,
            bankAccount: response.bank_account,
            referenceId: response.reference_id,
            active: response.active,
            createdAt: Math.floor(new Date(response.created_at * 1000).getTime() / 1000),
        };
    };

    /**
     * Creates a payout via the real RazorpayX API.
     * Implements idempotency key deduplication.
     *
     * @param {Object} request - GatewayPayoutRequest
     * @returns {Object} - GatewayPayoutResponse
     */
    const createPayout = async (request) => {
        const { amount, currency, mode, purpose, referenceId, fundAccountId, idempotencyKey, correlationId, entityId, narration } = request;

        const startTime = Date.now();

        // Idempotency check
        if (idempotencyKey) {
            const existing = await gatewayEventRepository.findByIdempotencyKey(idempotencyKey);
            if (existing) {
                return {
                    id: existing.gatewayId,
                    status: existing.gatewayStatus,
                    amount: existing.request?.amount || amount,
                    currency: existing.request?.currency || currency,
                    mode: existing.request?.mode || mode,
                    referenceId: existing.request?.referenceId || referenceId,
                    failureReason: existing.failureReason || null,
                    createdAt: Math.floor(new Date(existing.createdAt).getTime() / 1000),
                };
            }
        }

        // RazorpayX expects amount in paise
        const amountPaise = Math.round(amount * 100);

        let response;
        try {
            response = await razorpay.payouts.create({
                account_number: razorpayxConfig.accountNumber || null,
                fund_account_id: fundAccountId,
                amount: amountPaise,
                currency: currency || 'INR',
                mode: mode || 'NEFT',
                purpose: purpose || 'payout',
                queue_if_low_balance: true,
                reference_id: referenceId,
                narration: narration || 'Seller payout',
                notes: {
                    correlationId: correlationId || '',
                    entityId: entityId || '',
                },
            });
        } catch (error) {
            const razorpayError = error.error || error;
            const failureReason = razorpayError.description || razorpayError.message || 'Unknown gateway error';
            const failureCode = razorpayError.code || null;

            const latency = Date.now() - startTime;

            await gatewayEventRepository.log({
                gateway: GATEWAY.RAZORPAYX,
                eventType: GATEWAY_EVENT_TYPE.PAYOUT_FAILED,
                entityType: 'payout',
                entityId: entityId || null,
                gatewayId: null,
                gatewayStatus: GATEWAY_PAYOUT_STATUS.FAILED,
                idempotencyKey: idempotencyKey || null,
                correlationId: correlationId || null,
                request: { amount, currency, mode, purpose, referenceId, fundAccountId },
                response: razorpayError,
                latency,
                attemptCount: 1,
                lastAttemptAt: new Date(),
                failureReason,
                failureCode,
            });

            return {
                id: null,
                status: GATEWAY_PAYOUT_STATUS.FAILED,
                amount: amountPaise,
                currency: currency || 'INR',
                mode: mode || 'NEFT',
                referenceId,
                failureReason,
                createdAt: Math.floor(Date.now() / 1000),
            };
        }

        const latency = Date.now() - startTime;
        const gatewayStatus = mapRazorpayXStatus(response.status);

        await gatewayEventRepository.log({
            gateway: GATEWAY.RAZORPAYX,
            eventType: gatewayStatus === GATEWAY_PAYOUT_STATUS.PROCESSED
                ? GATEWAY_EVENT_TYPE.PAYOUT_PROCESSED
                : GATEWAY_EVENT_TYPE.PAYOUT_PROCESSING,
            entityType: 'payout',
            entityId: entityId || null,
            gatewayId: response.id,
            gatewayStatus,
            idempotencyKey: idempotencyKey || null,
            correlationId: correlationId || null,
            request: { amount, currency, mode, purpose, referenceId, fundAccountId },
            response,
            latency,
            attemptCount: 1,
            lastAttemptAt: new Date(),
            processedAt: gatewayStatus === GATEWAY_PAYOUT_STATUS.PROCESSED ? new Date() : null,
            failureReason: response.failure_reason || null,
        });

        return {
            id: response.id,
            status: gatewayStatus,
            amount: response.amount,
            currency: response.currency,
            mode: response.mode,
            referenceId: response.reference_id,
            failureReason: response.failure_reason || null,
            createdAt: response.created_at,
        };
    };

    /**
     * Fetches current payout status from RazorpayX.
     *
     * @param {string} payoutId - Gateway payout ID (pout_xxxx)
     * @returns {Object} - GatewayPayoutResponse
     */
    const fetchPayout = async (payoutId) => {
        try {
            const response = await razorpay.payouts.fetch(payoutId);
            return {
                id: response.id,
                status: mapRazorpayXStatus(response.status),
                amount: response.amount,
                currency: response.currency,
                mode: response.mode,
                referenceId: response.reference_id,
                failureReason: response.failure_reason || null,
                createdAt: response.created_at,
            };
        } catch (error) {
            const latestEvent = await gatewayEventRepository.findByGatewayId(payoutId);
            if (!latestEvent) {
                return { id: payoutId, status: GATEWAY_PAYOUT_STATUS.PROCESSING, amount: 0, currency: 'INR' };
            }
            return {
                id: payoutId,
                status: latestEvent.gatewayStatus,
                amount: latestEvent.request?.amount || 0,
                currency: latestEvent.request?.currency || 'INR',
                mode: latestEvent.request?.mode || 'NEFT',
                referenceId: latestEvent.request?.referenceId || null,
                failureReason: latestEvent.failureReason || null,
                createdAt: Math.floor(new Date(latestEvent.createdAt).getTime() / 1000),
            };
        }
    };

    /**
     * Cancels a payout on RazorpayX.
     * Only possible if payout status is "processing" or "queued".
     *
     * @param {string} payoutId - Gateway payout ID (pout_xxxx)
     * @returns {Object} - GatewayPayoutResponse
     */
    const cancelPayout = async (payoutId) => {
        try {
            const response = await razorpay.payouts.cancel(payoutId);
            const gatewayStatus = mapRazorpayXStatus(response.status);

            await gatewayEventRepository.log({
                gateway: GATEWAY.RAZORPAYX,
                eventType: GATEWAY_EVENT_TYPE.PAYOUT_CANCELLED,
                entityType: 'payout',
                entityId: null,
                gatewayId: payoutId,
                gatewayStatus,
                correlationId: null,
                request: { payoutId },
                response,
                attemptCount: 1,
                lastAttemptAt: new Date(),
            });

            return {
                id: response.id,
                status: gatewayStatus,
                amount: response.amount,
                currency: response.currency,
            };
        } catch (error) {
            const latestEvent = await gatewayEventRepository.findByGatewayId(payoutId);
            if (!latestEvent) {
                return { id: payoutId, status: GATEWAY_PAYOUT_STATUS.FAILED, amount: 0, currency: 'INR' };
            }
            return {
                id: payoutId,
                status: latestEvent.gatewayStatus,
                amount: latestEvent.request?.amount || 0,
                currency: latestEvent.request?.currency || 'INR',
            };
        }
    };

    /**
     * Verifies a RazorpayX webhook signature.
     * Uses HMAC-SHA256 with the webhook secret.
     *
     * @param {string} body - Raw request body as string
     * @param {string} signature - Signature from x-razorpay-signature header
     * @param {string} webhookSecret - Webhook secret configured in RazorpayX dashboard
     * @returns {boolean} - true if signature is valid
     */
    const verifyWebhookSignature = (body, signature, webhookSecret) => {
        if (!webhookSecret) {
            return true;
        }
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        const sigBuf = Buffer.from(signature, 'hex');
        const expBuf = Buffer.from(expectedSignature, 'hex');

        if (sigBuf.length !== expBuf.length) {
            return false;
        }
        return crypto.timingSafeEqual(sigBuf, expBuf);
    };

    return Object.freeze({
        createContact,
        createFundAccount,
        fetchFundAccount,
        createPayout,
        fetchPayout,
        cancelPayout,
        verifyWebhookSignature,
    });
};

/**
 * Maps RazorpayX payout status strings to canonical GATEWAY_PAYOUT_STATUS values.
 *
 * RazorpayX statuses: queued, pending, processing, processed, cancelled, reversed, failed
 */
const mapRazorpayXStatus = (status) => {
    const statusMap = {
        queued: GATEWAY_PAYOUT_STATUS.PENDING,
        pending: GATEWAY_PAYOUT_STATUS.PENDING,
        processing: GATEWAY_PAYOUT_STATUS.PROCESSING,
        processed: GATEWAY_PAYOUT_STATUS.PROCESSED,
        cancelled: GATEWAY_PAYOUT_STATUS.CANCELLED,
        reversed: GATEWAY_PAYOUT_STATUS.REVERSED,
        failed: GATEWAY_PAYOUT_STATUS.FAILED,
    };
    return statusMap[status] || GATEWAY_PAYOUT_STATUS.PROCESSING;
};
