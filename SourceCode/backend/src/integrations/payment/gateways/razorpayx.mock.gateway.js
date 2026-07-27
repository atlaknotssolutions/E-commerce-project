import crypto from 'crypto';
import { GATEWAY, GATEWAY_PAYOUT_STATUS, GATEWAY_EVENT_TYPE } from '../../../constants/enums.js';
import { canTransition } from './gatewayStateMachine.js';
import { generateIdempotencyKey } from '../gatewayUtils.js';

/**
 * Mock RazorpayX Gateway — simulates RazorpayX Fund Account Payouts API.
 *
 * Implements the gateway interface contract for seller payouts.
 * All state is persisted via GatewayEvent repository (no in-memory Map).
 * createPayout always returns "processing" — completion requires webhook.
 *
 * When switching to production, replace this with a real RazorpayX client
 * that calls https://api.razorpay.com/v1/payouts.
 */
export const createRazorpayXMockGateway = ({
    gatewayEventRepository,
    mockGatewaysConfig,
}) => {

    /**
     * Generates a unique mock payout ID.
     * @returns {string} - e.g., "pout_a1b2c3d4e5f6g7h8"
     */
    const generatePayoutId = () => {
        return `pout_${crypto.randomBytes(8).toString('hex')}`;
    };

    /**
     * Creates a payout via the mock RazorpayX API.
     * Always returns status "processing" (or "failed" based on failure rate).
     * Completion only happens via webhook.
     *
     * @param {Object} request - GatewayPayoutRequest
     * @returns {Object} - GatewayPayoutResponse
     */
    const createPayout = async (request) => {
        const { amount, currency, mode, purpose, referenceId, fundAccountId, idempotencyKey, correlationId } = request;

        const payoutId = generatePayoutId();
        const startTime = Date.now();

        // Check for duplicate via idempotency key
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
                    createdAt: Math.floor(new Date(existing.createdAt).getTime() / 1000),
                };
            }
        }

        // Simulate failure based on configured rate
        const failureRate = mockGatewaysConfig?.payoutFailureRate || 0;
        const shouldFail = failureRate > 0 && Math.random() * 100 < failureRate;

        const gatewayStatus = shouldFail
            ? GATEWAY_PAYOUT_STATUS.FAILED
            : GATEWAY_PAYOUT_STATUS.PROCESSING;

        const failureReason = shouldFail ? 'insufficient_balance' : null;

        const latency = Date.now() - startTime;

        // Build response
        const response = {
            id: payoutId,
            entity: 'payout',
            amount: amount * 100,
            currency: currency || 'INR',
            status: gatewayStatus,
            mode: mode || 'NEFT',
            purpose: purpose || 'payout',
            reference_id: referenceId,
            fund_account_id: fundAccountId || 'fa_mock_default',
            account_number: '1234567890',
            failure_reason: failureReason,
            created_at: Math.floor(Date.now() / 1000),
        };

        // Append event — never update
        await gatewayEventRepository.log({
            gateway: GATEWAY.MOCK_RAZORPAYX,
            eventType: shouldFail ? GATEWAY_EVENT_TYPE.PAYOUT_FAILED : GATEWAY_EVENT_TYPE.PAYOUT_PROCESSING,
            entityType: 'payout',
            entityId: request.entityId || null,
            gatewayId: payoutId,
            gatewayStatus,
            idempotencyKey: idempotencyKey || null,
            correlationId: correlationId || null,
            request: { amount, currency, mode, purpose, referenceId, fundAccountId },
            response,
            latency,
            attemptCount: 1,
            lastAttemptAt: new Date(),
            processedAt: shouldFail ? new Date() : null,
            failureReason,
        });

        return {
            id: payoutId,
            status: gatewayStatus,
            amount: amount * 100,
            currency: currency || 'INR',
            mode: mode || 'NEFT',
            referenceId,
            failureReason,
            createdAt: Math.floor(Date.now() / 1000),
        };
    };

    /**
     * Fetches current payout status from the mock.
     * In production this calls razorpay.payouts.fetch(payoutId).
     *
     * @param {string} payoutId - Gateway payout ID (pout_xxxx)
     * @returns {Object} - GatewayPayoutResponse
     */
    const fetchPayout = async (payoutId) => {
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
    };

    /**
     * Cancels a payout.
     *
     * @param {string} payoutId - Gateway payout ID
     * @returns {Object} - GatewayPayoutResponse
     */
    const cancelPayout = async (payoutId) => {
        const latestEvent = await gatewayEventRepository.findByGatewayId(payoutId);
        if (!latestEvent) {
            return { id: payoutId, status: GATEWAY_PAYOUT_STATUS.FAILED, amount: 0, currency: 'INR' };
        }

        if (!canTransition('payout', latestEvent.gatewayStatus, GATEWAY_PAYOUT_STATUS.CANCELLED)) {
            return {
                id: payoutId,
                status: latestEvent.gatewayStatus,
                amount: latestEvent.request?.amount || 0,
                currency: latestEvent.request?.currency || 'INR',
                failureReason: `Cannot cancel from status: ${latestEvent.gatewayStatus}`,
            };
        }

        const response = {
            id: payoutId,
            entity: 'payout',
            status: GATEWAY_PAYOUT_STATUS.CANCELLED,
        };

        // Append cancellation event
        await gatewayEventRepository.log({
            gateway: GATEWAY.MOCK_RAZORPAYX,
            eventType: GATEWAY_EVENT_TYPE.PAYOUT_CANCELLED,
            entityType: 'payout',
            entityId: latestEvent.entityId,
            gatewayId: payoutId,
            gatewayStatus: GATEWAY_PAYOUT_STATUS.CANCELLED,
            correlationId: latestEvent.correlationId,
            request: latestEvent.request,
            response,
            attemptCount: latestEvent.attemptCount || 1,
            lastAttemptAt: new Date(),
        });

        return {
            id: payoutId,
            status: GATEWAY_PAYOUT_STATUS.CANCELLED,
            amount: latestEvent.request?.amount || 0,
            currency: latestEvent.request?.currency || 'INR',
        };
    };

    return Object.freeze({
        createPayout,
        fetchPayout,
        cancelPayout,
    });
};
