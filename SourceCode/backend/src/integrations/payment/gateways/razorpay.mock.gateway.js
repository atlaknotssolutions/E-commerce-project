import crypto from 'crypto';
import { GATEWAY, GATEWAY_REFUND_STATUS, GATEWAY_EVENT_TYPE } from '../../../constants/enums.js';
import { canTransition } from './gatewayStateMachine.js';
import { generateIdempotencyKey } from '../gatewayUtils.js';

/**
 * Mock Razorpay Gateway — simulates Razorpay Refunds API for customer refunds.
 *
 * Implements the gateway interface contract for refunds.
 * All state is persisted via GatewayEvent repository (no in-memory Map).
 * createRefund always returns "processing" (or "failed" based on failure rate).
 * Completion only happens via webhook.
 *
 * When switching to production, replace this with a real Razorpay client
 * that calls https://api.razorpay.com/v1/refunds.
 */
export const createRazorpayMockGateway = ({
    gatewayEventRepository,
    mockGatewaysConfig,
}) => {

    /**
     * Generates a unique mock refund ID.
     * @returns {string} - e.g., "rfnd_x9y8z7w6v5u4t3s2"
     */
    const generateRefundId = () => {
        return `rfnd_${crypto.randomBytes(8).toString('hex')}`;
    };

    /**
     * Creates a refund via the mock Razorpay API.
     * Always returns status "processing" (or "failed" based on failure rate).
     * Completion only happens via webhook.
     *
     * @param {Object} request - GatewayRefundRequest
     * @returns {Object} - GatewayRefundResponse
     */
    const createRefund = async (request) => {
        const { paymentId, amount, speed, notes, idempotencyKey, correlationId } = request;

        const refundId = generateRefundId();
        const startTime = Date.now();

        // Check for duplicate via idempotency key
        if (idempotencyKey) {
            const existing = await gatewayEventRepository.findByIdempotencyKey(idempotencyKey);
            if (existing) {
                return {
                    id: existing.gatewayId,
                    status: existing.gatewayStatus,
                    amount: existing.request?.amount || amount,
                    paymentId: existing.request?.paymentId || paymentId,
                    createdAt: Math.floor(new Date(existing.createdAt).getTime() / 1000),
                };
            }
        }

        // Simulate failure based on configured rate
        const failureRate = mockGatewaysConfig?.refundFailureRate || 0;
        const shouldFail = failureRate > 0 && Math.random() * 100 < failureRate;

        const gatewayStatus = shouldFail
            ? GATEWAY_REFUND_STATUS.FAILED
            : GATEWAY_REFUND_STATUS.PROCESSING;

        const failureReason = shouldFail ? 'bank_account_inactive' : null;

        const latency = Date.now() - startTime;

        // Build response
        const response = {
            id: refundId,
            entity: 'refund',
            amount: amount * 100,
            currency: 'INR',
            status: gatewayStatus,
            speed: speed || 'normal',
            payment_id: paymentId,
            notes: notes || {},
            failure_reason: failureReason,
            created_at: Math.floor(Date.now() / 1000),
        };

        // Append event — never update
        await gatewayEventRepository.log({
            gateway: GATEWAY.MOCK_RAZORPAY,
            eventType: shouldFail ? GATEWAY_EVENT_TYPE.REFUND_FAILED : GATEWAY_EVENT_TYPE.REFUND_PROCESSING,
            entityType: 'refund',
            entityId: request.entityId || null,
            gatewayId: refundId,
            gatewayStatus,
            idempotencyKey: idempotencyKey || null,
            correlationId: correlationId || null,
            request: { paymentId, amount: amount * 100, speed, notes },
            response,
            latency,
            attemptCount: 1,
            lastAttemptAt: new Date(),
            processedAt: shouldFail ? new Date() : null,
            failureReason,
        });

        return {
            id: refundId,
            status: gatewayStatus,
            amount: amount * 100,
            paymentId,
            failureReason,
            createdAt: Math.floor(Date.now() / 1000),
        };
    };

    /**
     * Fetches current refund status from the mock.
     * In production this calls razorpay.refunds.fetch(refundId).
     *
     * @param {string} refundId - Gateway refund ID (rfnd_xxxx)
     * @returns {Object} - GatewayRefundResponse
     */
    const fetchRefund = async (refundId) => {
        const latestEvent = await gatewayEventRepository.findByGatewayId(refundId);
        if (!latestEvent) {
            return { id: refundId, status: GATEWAY_REFUND_STATUS.PROCESSING, amount: 0, paymentId: null };
        }

        return {
            id: refundId,
            status: latestEvent.gatewayStatus,
            amount: latestEvent.request?.amount || 0,
            paymentId: latestEvent.request?.paymentId || null,
            failureReason: latestEvent.failureReason || null,
            createdAt: Math.floor(new Date(latestEvent.createdAt).getTime() / 1000),
        };
    };

    return Object.freeze({
        createRefund,
        fetchRefund,
    });
};
