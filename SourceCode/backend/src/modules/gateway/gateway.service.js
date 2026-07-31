import { GATEWAY, GATEWAY_PAYOUT_STATUS, GATEWAY_REFUND_STATUS, GATEWAY_EVENT_TYPE, PAYOUT_STATUS, REFUND_STATUS } from '../../constants/enums.js';
import mongoose from 'mongoose';

export const createGatewayService = ({
    gatewayEventRepository,
    payoutRepository,
    refundRepository,
    payoutService,
    commissionService,
    sellerReportRepository,
    notificationService,
    paymentGatewayFactory,
    createApiError,
}) => {

    // ============================================================
    // TASK 1 + 2 + 3: Payout Webhook — session propagation, failed state, enum strings
    // ============================================================
    const handlePayoutWebhook = async (payload) => {
        const { payout_id, status, amount, currency, failure_reason } = payload;

        if (!payout_id) {
            throw createApiError({ statusCode: 400, message: 'payout_id is required' });
        }

        const gatewayEvent = await gatewayEventRepository.findByGatewayId(payout_id);
        if (!gatewayEvent) {
            throw createApiError({ statusCode: 404, message: `No gateway event found for payout_id: ${payout_id}` });
        }

        if (!gatewayEvent.entityId) {
            throw createApiError({ statusCode: 400, message: `No entity linked to payout_id: ${payout_id}` });
        }

        const payout = await payoutRepository.findById(gatewayEvent.entityId);
        if (!payout) {
            throw createApiError({ statusCode: 404, message: `Payout record not found for entityId: ${gatewayEvent.entityId}` });
        }

        if (payout.status === PAYOUT_STATUS.COMPLETED || payout.status === PAYOUT_STATUS.REJECTED) {
            return { processed: true, payout_id, status, idempotent: true };
        }

        let session = null;
        let committed = false;
        try {
            session = await mongoose.startSession();
            session.startTransaction();

            await gatewayEventRepository.log({
                gateway: gatewayEvent.gateway,
                eventType: GATEWAY_EVENT_TYPE.PAYOUT_WEBHOOK,
                entityType: 'payout',
                entityId: gatewayEvent.entityId,
                gatewayId: payout_id,
                gatewayStatus: status,
                idempotencyKey: null,
                correlationId: gatewayEvent.correlationId,
                request: payload,
                response: payload,
                webhookPayload: payload,
                latency: null,
                attemptCount: (gatewayEvent.attemptCount || 0) + 1,
                lastAttemptAt: new Date(),
                processedAt: status === GATEWAY_PAYOUT_STATUS.PROCESSED ? new Date() : null,
                failureReason: failure_reason || null,
            }, { session });

            if (status === GATEWAY_PAYOUT_STATUS.PROCESSED) {
                await payoutService.completeBusinessPayout(gatewayEvent.entityId, { session });
            }

            if (status === GATEWAY_PAYOUT_STATUS.FAILED ||
                status === GATEWAY_PAYOUT_STATUS.CANCELLED ||
                status === GATEWAY_PAYOUT_STATUS.REVERSED) {
                await payoutRepository.updateGatewayStatus(gatewayEvent.entityId, {
                    gatewayStatus: status,
                }, { session });
            }

            await session.commitTransaction();
            committed = true;
        } catch (error) {
            if (session) {
                try { await session.abortTransaction(); } catch (_) {}
            }
            throw error;
        } finally {
            if (session) {
                try { await session.endSession(); } catch (_) {}
            }
        }

        if (committed && status === GATEWAY_PAYOUT_STATUS.PROCESSED && payout.seller) {
            const sellerId = payout.seller?._id || payout.seller;
            notificationService.createNotification({
                customerId: sellerId,
                message: `Your payout of ₹${payout.amount} has been processed and will be credited to your account shortly.`,
            }).catch(() => {});
        }

        return { processed: true, payout_id, status };
    };

    // ============================================================
    // TASK 1 + 3: Refund Webhook — session propagation for ALL writes, enum strings
    // ============================================================
    const handleRefundWebhook = async (payload) => {
        const { refund_id, status, amount, payment_id, failure_reason } = payload;

        if (!refund_id) {
            throw createApiError({ statusCode: 400, message: 'refund_id is required' });
        }

        const gatewayEvent = await gatewayEventRepository.findByGatewayId(refund_id);
        if (!gatewayEvent) {
            throw createApiError({ statusCode: 404, message: `No gateway event found for refund_id: ${refund_id}` });
        }

        if (!gatewayEvent.entityId) {
            throw createApiError({ statusCode: 400, message: `No entity linked to refund_id: ${refund_id}` });
        }

        const refund = await refundRepository.findById(gatewayEvent.entityId);
        if (!refund) {
            throw createApiError({ statusCode: 404, message: `Refund record not found for entityId: ${gatewayEvent.entityId}` });
        }

        if (refund.status === REFUND_STATUS.COMPLETED) {
            return { processed: true, refund_id, status, idempotent: true };
        }

        const isTerminalSuccess = [GATEWAY_REFUND_STATUS.PROCESSED, GATEWAY_REFUND_STATUS.REVERSED].includes(status);

        let session = null;
        let committed = false;
        try {
            session = await mongoose.startSession();
            session.startTransaction();

            await gatewayEventRepository.log({
                gateway: gatewayEvent.gateway,
                eventType: GATEWAY_EVENT_TYPE.REFUND_WEBHOOK,
                entityType: 'refund',
                entityId: gatewayEvent.entityId,
                gatewayId: refund_id,
                gatewayStatus: status,
                idempotencyKey: null,
                correlationId: gatewayEvent.correlationId,
                request: payload,
                response: payload,
                webhookPayload: payload,
                latency: null,
                attemptCount: (gatewayEvent.attemptCount || 0) + 1,
                lastAttemptAt: new Date(),
                processedAt: isTerminalSuccess ? new Date() : null,
                failureReason: failure_reason || null,
            }, { session });

            if (isTerminalSuccess) {
                await refundRepository.updateGatewayStatus(gatewayEvent.entityId, {
                    gatewayStatus: status,
                    providerRefundId: refund_id,
                    processedAt: new Date(),
                    status: REFUND_STATUS.COMPLETED,
                }, { session });

                if (commissionService) {
                    const orderId = refund.orderId?._id || refund.orderId;
                    await commissionService.cancelCommissionForRefund(orderId, { session });
                }

                if (sellerReportRepository) {
                    const sellerId = refund.returnRequestId?.seller?._id || refund.returnRequestId?.seller || refund.returnRequestId;
                    await sellerReportRepository.applyCancellation({
                        sellerId,
                        refund: refund.amount,
                    }, { session });
                }
            }

            await session.commitTransaction();
            committed = true;
        } catch (error) {
            if (session) {
                try { await session.abortTransaction(); } catch (_) {}
            }
            throw error;
        } finally {
            if (session) {
                try { await session.endSession(); } catch (_) {}
            }
        }

        if (committed && isTerminalSuccess) {
            const customerId = refund.returnRequestId?.customer?._id || refund.returnRequestId?.customer;
            if (customerId) {
                notificationService.createNotification({
                    customerId,
                    message: `Refund of ₹${refund.amount} for return ${refund.returnRequestId?.returnId || ''} has been completed and will be credited shortly.`,
                }).catch(() => {});
            }
        }

        return { processed: true, refund_id, status };
    };

    // ============================================================
    // TASK 5: Retry Endpoint — resubmit FAILED payout to gateway
    // ============================================================
    const retryPayout = async (payoutId) => {
        const payout = await payoutRepository.findById(payoutId);
        if (!payout) {
            throw createApiError({ statusCode: 404, message: 'Payout record not found' });
        }

        if (payout.status !== PAYOUT_STATUS.APPROVED) {
            throw createApiError({ statusCode: 400, message: 'Only APPROVED payouts with FAILED gateway status can be retried' });
        }

        if (payout.gatewayStatus !== GATEWAY_PAYOUT_STATUS.FAILED) {
            throw createApiError({ statusCode: 400, message: `Cannot retry payout with gateway status: ${payout.gatewayStatus}` });
        }

        if (!payout.gatewayPayoutId) {
            throw createApiError({ statusCode: 400, message: 'No gateway payout ID found. Use disburse instead.' });
        }

        const previousAttemptCount = await gatewayEventRepository.countByEntity({
            entityType: 'payout',
            entityId: payoutId,
        });

        const provider = payout.gateway || 'mock_razorpayx';
        const gateway = paymentGatewayFactory.getPayoutGateway(provider);
        const idempotencyKey = `PAYOUT-${payoutId.toString()}-attempt-${previousAttemptCount + 1}`;
        const correlationId = await gatewayEventRepository.findCorrelationIdByEntity({
            entityType: 'payout',
            entityId: payoutId,
        }) || `CORR_${Date.now().toString(36)}`;

        let session = null;
        let committed = false;
        let gatewayResponse;

        try {
            gatewayResponse = await gateway.createPayout({
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
        } catch (error) {
            throw createApiError({ statusCode: 502, message: `Gateway payout retry failed: ${error.message}` });
        }

        if (gatewayResponse.status === GATEWAY_PAYOUT_STATUS.FAILED) {
            await payoutRepository.updateGatewayStatus(payoutId, {
                gatewayStatus: GATEWAY_PAYOUT_STATUS.FAILED,
            });
            return {
                success: false,
                payout: await payoutRepository.findById(payoutId),
                gatewayStatus: GATEWAY_PAYOUT_STATUS.FAILED,
            };
        }

        try {
            session = await mongoose.startSession();
            session.startTransaction();

            const claimed = await payoutRepository.claimForDisbursement(payoutId, {
                gateway: provider,
                gatewayPayoutId: gatewayResponse.id,
                referenceId: `ref_${payoutId.toString()}`,
                gatewayStatus: gatewayResponse.status,
            });

            if (!claimed) {
                await session.abortTransaction();
                return {
                    success: false,
                    payout: await payoutRepository.findById(payoutId),
                    gatewayStatus: payout.gatewayStatus,
                    message: 'Payout was concurrently claimed by another request',
                };
            }

            await session.commitTransaction();
            committed = true;
        } catch (error) {
            if (session) {
                try { await session.abortTransaction(); } catch (_) {}
            }
            throw error;
        } finally {
            if (session) {
                try { await session.endSession(); } catch (_) {}
            }
        }

        return {
            success: true,
            payout: await payoutRepository.findById(payoutId),
            gatewayStatus: gatewayResponse.status,
        };
    };

    // ============================================================
    // TASK 7: Gateway Health Endpoint
    // ============================================================
    const getHealth = async () => {
        const registeredProviders = paymentGatewayFactory.getRegisteredProviders();

        const [
            pendingPayouts,
            failedPayouts,
            processingRefunds,
            gatewayEventCount,
            lastEvent,
        ] = await Promise.all([
            payoutRepository.countByStatus(PAYOUT_STATUS.APPROVED)
                .catch(() => 0),
            payoutRepository.countByGatewayStatus(GATEWAY_PAYOUT_STATUS.FAILED)
                .catch(() => 0),
            refundRepository.countByGatewayStatus(GATEWAY_REFUND_STATUS.PROCESSING)
                .catch(() => 0),
            gatewayEventRepository.countAll()
                .catch(() => 0),
            gatewayEventRepository.findLatest()
                .catch(() => null),
        ]);

        const healthy = failedPayouts === 0 && processingRefunds < 100;

        return {
            healthy,
            payoutGateway: registeredProviders.includes('mock_razorpayx'),
            refundGateway: registeredProviders.includes('mock_razorpay'),
            webhookVerification: true,
            pendingPayouts,
            failedPayouts,
            processingRefunds,
            gatewayEventCount,
            lastWebhookReceivedAt: lastEvent?.createdAt || null,
            uptime: process.uptime(),
        };
    };

    // ============================================================
    // TASK 8: Extended Dashboard Metrics
    // ============================================================
    const getDashboard = async (filters = {}) => {
        const [aggregateStats, todayStats, healthMetrics] = await Promise.all([
            gatewayEventRepository.getAggregateStats(filters),
            gatewayEventRepository.getTodayStats(),
            gatewayEventRepository.getHealthMetrics(filters),
        ]);

        const totalEvents = aggregateStats.reduce((sum, s) => sum + s.count, 0);
        const processedEvents = aggregateStats
            .filter(s => [GATEWAY_PAYOUT_STATUS.PROCESSED, GATEWAY_REFUND_STATUS.PROCESSED, GATEWAY_REFUND_STATUS.REVERSED].includes(s._id.gatewayStatus))
            .reduce((sum, s) => sum + s.count, 0);
        const failedEvents = aggregateStats
            .filter(s => [GATEWAY_PAYOUT_STATUS.FAILED, GATEWAY_REFUND_STATUS.FAILED].includes(s._id.gatewayStatus))
            .reduce((sum, s) => sum + s.count, 0);
        const pendingEvents = aggregateStats
            .filter(s => [GATEWAY_PAYOUT_STATUS.PROCESSING, GATEWAY_REFUND_STATUS.PROCESSING].includes(s._id.gatewayStatus))
            .reduce((sum, s) => sum + s.count, 0);

        const successRate = totalEvents > 0 ? ((processedEvents / totalEvents) * 100).toFixed(1) : 0;
        const failureRate = totalEvents > 0 ? ((failedEvents / totalEvents) * 100).toFixed(1) : 0;

        const totalLatencyWeight = healthMetrics.reduce((sum, m) => sum + (m.count || 0), 0);
        const weightedLatencySum = healthMetrics.reduce((sum, m) => sum + (m.avgLatency || 0) * (m.count || 0), 0);
        const avgLatency = totalLatencyWeight > 0
            ? (weightedLatencySum / totalLatencyWeight).toFixed(0)
            : 0;

        const todayTotal = todayStats.reduce((sum, s) => sum + s.count, 0);

        const payoutStats = aggregateStats
            .filter(s => s._id.entityType === 'payout');
        const refundStats = aggregateStats
            .filter(s => s._id.entityType === 'refund');

        const totalPayoutEvents = payoutStats.reduce((sum, s) => sum + s.count, 0);
        const processedPayouts = payoutStats
            .filter(s => s._id.gatewayStatus === GATEWAY_PAYOUT_STATUS.PROCESSED)
            .reduce((sum, s) => sum + s.count, 0);
        const failedPayoutEvents = payoutStats
            .filter(s => s._id.gatewayStatus === GATEWAY_PAYOUT_STATUS.FAILED)
            .reduce((sum, s) => sum + s.count, 0);

        const totalRefundEvents = refundStats.reduce((sum, s) => sum + s.count, 0);
        const processedRefunds = refundStats
            .filter(s => [GATEWAY_REFUND_STATUS.PROCESSED, GATEWAY_REFUND_STATUS.REVERSED].includes(s._id.gatewayStatus))
            .reduce((sum, s) => sum + s.count, 0);
        const failedRefundEvents = refundStats
            .filter(s => s._id.gatewayStatus === GATEWAY_REFUND_STATUS.FAILED)
            .reduce((sum, s) => sum + s.count, 0);

        const payoutSuccessRate = totalPayoutEvents > 0
            ? parseFloat(((processedPayouts / totalPayoutEvents) * 100).toFixed(1))
            : 0;
        const payoutFailureRate = totalPayoutEvents > 0
            ? parseFloat(((failedPayoutEvents / totalPayoutEvents) * 100).toFixed(1))
            : 0;
        const refundSuccessRate = totalRefundEvents > 0
            ? parseFloat(((processedRefunds / totalRefundEvents) * 100).toFixed(1))
            : 0;
        const refundFailureRate = totalRefundEvents > 0
            ? parseFloat(((failedRefundEvents / totalRefundEvents) * 100).toFixed(1))
            : 0;

        const payoutHealth = healthMetrics.filter(m =>
            [GATEWAY_PAYOUT_STATUS.PROCESSED, GATEWAY_PAYOUT_STATUS.FAILED, GATEWAY_PAYOUT_STATUS.PROCESSING].includes(m._id));
        const refundHealth = healthMetrics.filter(m =>
            [GATEWAY_REFUND_STATUS.PROCESSED, GATEWAY_REFUND_STATUS.FAILED, GATEWAY_REFUND_STATUS.PROCESSING].includes(m._id));

        const payoutLatencyWeight = payoutHealth.reduce((sum, m) => sum + (m.count || 0), 0);
        const payoutLatencySum = payoutHealth.reduce((sum, m) => sum + (m.avgLatency || 0) * (m.count || 0), 0);
        const avgPayoutLatency = payoutLatencyWeight > 0
            ? parseFloat((payoutLatencySum / payoutLatencyWeight).toFixed(0))
            : 0;

        const refundLatencyWeight = refundHealth.reduce((sum, m) => sum + (m.count || 0), 0);
        const refundLatencySum = refundHealth.reduce((sum, m) => sum + (m.avgLatency || 0) * (m.count || 0), 0);
        const avgRefundLatency = refundLatencyWeight > 0
            ? parseFloat((refundLatencySum / refundLatencyWeight).toFixed(0))
            : 0;

        return {
            overview: {
                totalEvents,
                processedEvents,
                failedEvents,
                pendingEvents,
                successRate: parseFloat(successRate),
                failureRate: parseFloat(failureRate),
                avgLatency: parseInt(avgLatency, 10),
            },
            payoutMetrics: {
                totalEvents: totalPayoutEvents,
                successRate: payoutSuccessRate,
                failureRate: payoutFailureRate,
                avgLatency: avgPayoutLatency,
            },
            refundMetrics: {
                totalEvents: totalRefundEvents,
                successRate: refundSuccessRate,
                failureRate: refundFailureRate,
                avgLatency: avgRefundLatency,
            },
            today: {
                total: todayTotal,
                breakdown: todayStats,
            },
            aggregateStats,
            healthMetrics,
        };
    };

    const getEvents = async (filters) => {
        return await gatewayEventRepository.findAll(filters);
    };

    const getTimeline = async (entityType, entityId) => {
        return await gatewayEventRepository.findTimelineByEntity({ entityType, entityId });
    };

    // ============================================================
    // RazorpayX Real Webhook — translate real payload to canonical
    // ============================================================
    const handleRazorpayXWebhook = async (payload) => {
        const event = payload.event;
        const entity = payload.payload?.payout?.entity || payload.payload?.settlement?.entity;

        if (!entity || !entity.id) {
            throw createApiError({ statusCode: 400, message: 'Invalid RazorpayX webhook payload: missing entity id' });
        }

        if (!event) {
            throw createApiError({ statusCode: 400, message: 'Invalid RazorpayX webhook payload: missing event' });
        }

        // Translate RazorpayX event names to canonical status
        const eventToStatus = {
            'payout.processed': GATEWAY_PAYOUT_STATUS.PROCESSED,
            'payout.failed': GATEWAY_PAYOUT_STATUS.FAILED,
            'payout.reversed': GATEWAY_PAYOUT_STATUS.REVERSED,
            'payout.cancelled': GATEWAY_PAYOUT_STATUS.CANCELLED,
        };

        const canonicalStatus = eventToStatus[event];
        if (!canonicalStatus) {
            return { processed: true, event, idempotent: true, message: `Unhandled event type: ${event}` };
        }

        const normalizedPayload = {
            payout_id: entity.id,
            status: canonicalStatus,
            amount: entity.amount,
            currency: entity.currency || 'INR',
            failure_reason: entity.failure_reason || entity.error_reason || null,
        };

        return await handlePayoutWebhook(normalizedPayload);
    };

    return Object.freeze({
        handlePayoutWebhook,
        handleRefundWebhook,
        handleRazorpayXWebhook,
        retryPayout,
        getHealth,
        getDashboard,
        getEvents,
        getTimeline,
    });
};
