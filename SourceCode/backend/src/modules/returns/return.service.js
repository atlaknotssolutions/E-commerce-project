import
    {
        RETURN_STATUS,
        ORDER_STATUS,
        PAYMENT_STATUS,
        PAYMENT_METHODS,
        REFUND_STATUS,
        REFUND_METHOD,
        GATEWAY_REFUND_STATUS,
        STATUS_HISTORY_ACTOR,
    } from '../../constants/enums.js';
import { createCouponFacade } from '../../utils/couponEngine/CouponFacade.js';

/**
 * Maximum number of days after delivery within which a return can be requested.
 */
const RETURN_WINDOW_DAYS = 7;

/**
 * Pure function-based factory representing the Return business logic layer.
 * Orchestrates return requests, approvals, restocking, and refund initiation.
 */
export const createReturnService = ({
    returnRequestRepository,
    orderRepository,
    paymentOrderRepository,
    refundRepository,
    inventoryHelper,
    notificationService,
    commissionService,
    sellerReportRepository,
    paymentGatewayFactory,
    gatewayEventRepository,
    gatewayUtils,
    mockGatewaysConfig,
    createApiError,
    mapReturn,
    mapReturns,
}) =>
{

    /**
     * Builds a standardised audit trail entry for return history.
     */
    const buildHistoryEntry = ({ fromStatus, toStatus, changedBy, changedByModel, changedByRole, note }) => ({
        fromStatus,
        toStatus,
        changedBy,
        changedByModel,
        changedByRole,
        changedAt: new Date(),
        note,
    });

    /**
     * Generates a unique human-readable return business ID.
     */
    const generateReturnId = () =>
    {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `RET-${timestamp}-${random}`;
    };

    // ==========================================
    // 1. CUSTOMER: REQUEST RETURN
    // ==========================================

    const requestReturn = async ({ customerId, orderId, orderItemId, productId, reason, description, images }) =>
    {
        const order = await orderRepository.findOrderForCustomer({ orderId, customerId });
        if (!order)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'Order not found or does not belong to this customer.',
            });
        }

        if (order.orderStatus !== ORDER_STATUS.DELIVERED)
        {
            throw createApiError({
                statusCode: 400,
                code: 'ORDER_NOT_DELIVERED',
                message: 'Returns can only be requested for delivered orders.',
            });
        }

        if (order.paymentStatus !== PAYMENT_STATUS.COMPLETED)
        {
            throw createApiError({
                statusCode: 400,
                code: 'ORDER_NOT_PAID',
                message: 'Returns can only be requested for fully paid orders.',
            });
        }

        const deliveredDate = new Date(order.deliveredAt);
        const windowExpiry = new Date(deliveredDate);
        windowExpiry.setDate(windowExpiry.getDate() + RETURN_WINDOW_DAYS);

        if (new Date() > windowExpiry)
        {
            throw createApiError({
                statusCode: 400,
                code: 'RETURN_WINDOW_EXPIRED',
                message: `Return window of ${RETURN_WINDOW_DAYS} days has expired.`,
            });
        }

        const orderItem = order.orderItems.find(
            (item) => item._id.toString() === orderItemId
        );

        if (!orderItem)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_ITEM_NOT_FOUND',
                message: 'Order item not found in this order.',
            });
        }

        const productObjectId = orderItem.product?._id
            ? orderItem.product._id.toString()
            : orderItem.product.toString();

        if (productObjectId !== productId)
        {
            throw createApiError({
                statusCode: 400,
                code: 'PRODUCT_MISMATCH',
                message: 'Product does not match the order item.',
            });
        }

        const existingReturn = await returnRequestRepository.findByOrderAndItem({ orderId, orderItemId });
        if (existingReturn)
        {
            throw createApiError({
                statusCode: 400,
                code: 'RETURN_ALREADY_REQUESTED',
                message: 'A return request already exists for this order item.',
            });
        }

        // sellingPrice already represents the line total (unitPrice * quantity)
        const refundAmount = orderItem.sellingPrice;

        const returnRequest = await returnRequestRepository.create({
            returnId: generateReturnId(),
            order: orderId,
            customer: customerId,
            seller: order.seller._id || order.seller,
            orderItemId,
            productId,
            reason,
            description: description || '',
            images: images || [],
            refundAmount,
            returnStatus: RETURN_STATUS.REQUESTED,
            requestedAt: new Date(),
            returnHistory: [
                buildHistoryEntry({
                    fromStatus: null,
                    toStatus: RETURN_STATUS.REQUESTED,
                    changedBy: customerId,
                    changedByModel: STATUS_HISTORY_ACTOR.USER,
                    changedByRole: 'ROLE_CUSTOMER',
                    note: `Return requested for reason: ${reason}`,
                }),
            ],
        });

        // Fire-and-forget notification to customer
        notificationService.createNotification({
            customerId,
            message: `Your return request ${returnRequest.returnId} for order ${order.orderId} has been submitted successfully.`,
        }).catch(() => { });

        return mapReturn(returnRequest);
    };

    // ==========================================
    // 2. CUSTOMER: GET MY RETURNS
    // ==========================================

    const getCustomerReturns = async ({ customerId }) =>
    {
        const returns = await returnRequestRepository.findByCustomer({ customerId });
        return mapReturns(returns);
    };

    // ==========================================
    // 3. SELLER: GET MY RETURNS
    // ==========================================

    const getSellerReturns = async ({ sellerId }) =>
    {
        const returns = await returnRequestRepository.findBySeller({ sellerId });
        return mapReturns(returns);
    };

    // ==========================================
    // 4. SELLER: APPROVE RETURN
    // ==========================================

    const approveReturn = async ({ returnId, sellerId, sellerNote }) =>
    {
        const returnRequest = await returnRequestRepository.findById(returnId);
        if (!returnRequest)
        {
            throw createApiError({
                statusCode: 404,
                code: 'RETURN_NOT_FOUND',
                message: 'Return request not found.',
            });
        }

        const sellerObjectId = returnRequest.seller?._id
            ? returnRequest.seller._id.toString()
            : returnRequest.seller.toString();

        if (sellerObjectId !== sellerId)
        {
            throw createApiError({
                statusCode: 404,
                code: 'RETURN_NOT_FOUND',
                message: 'Return request not found.',
            });
        }

        if (returnRequest.returnStatus !== RETURN_STATUS.REQUESTED)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATUS_TRANSITION',
                message: `Cannot approve a return request in "${returnRequest.returnStatus}" status.`,
            });
        }

        const updated = await returnRequestRepository.updateStatus({
            returnId,
            returnStatus: RETURN_STATUS.APPROVED,
            sellerNote,
            historyEntry: buildHistoryEntry({
                fromStatus: RETURN_STATUS.REQUESTED,
                toStatus: RETURN_STATUS.APPROVED,
                changedBy: sellerId,
                changedByModel: STATUS_HISTORY_ACTOR.SELLER,
                changedByRole: 'ROLE_SELLER',
                note: sellerNote || 'Return request approved.',
            }),
        });

        // Fire-and-forget notification to customer
        notificationService.createNotification({
            customerId: returnRequest.customer?._id || returnRequest.customer,
            message: `Your return request ${returnRequest.returnId} has been approved. Please ship the item back.`,
        }).catch(() => { });

        return mapReturn(updated);
    };

    // ==========================================
    // 5. SELLER: REJECT RETURN
    // ==========================================

    const rejectReturn = async ({ returnId, sellerId, sellerNote }) =>
    {
        const returnRequest = await returnRequestRepository.findById(returnId);
        if (!returnRequest)
        {
            throw createApiError({
                statusCode: 404,
                code: 'RETURN_NOT_FOUND',
                message: 'Return request not found.',
            });
        }

        const sellerObjectId = returnRequest.seller?._id
            ? returnRequest.seller._id.toString()
            : returnRequest.seller.toString();

        if (sellerObjectId !== sellerId)
        {
            throw createApiError({
                statusCode: 404,
                code: 'RETURN_NOT_FOUND',
                message: 'Return request not found.',
            });
        }

        if (returnRequest.returnStatus !== RETURN_STATUS.REQUESTED)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATUS_TRANSITION',
                message: `Cannot reject a return request in "${returnRequest.returnStatus}" status.`,
            });
        }

        const updated = await returnRequestRepository.updateStatus({
            returnId,
            returnStatus: RETURN_STATUS.REJECTED,
            sellerNote,
            resolvedAt: new Date(),
            historyEntry: buildHistoryEntry({
                fromStatus: RETURN_STATUS.REQUESTED,
                toStatus: RETURN_STATUS.REJECTED,
                changedBy: sellerId,
                changedByModel: STATUS_HISTORY_ACTOR.SELLER,
                changedByRole: 'ROLE_SELLER',
                note: sellerNote || 'Return request rejected.',
            }),
        });

        // Fire-and-forget notification to customer
        notificationService.createNotification({
            customerId: returnRequest.customer?._id || returnRequest.customer,
            message: `Your return request ${returnRequest.returnId} has been rejected. Reason: ${sellerNote || 'No reason provided.'}`,
        }).catch(() => { });

        return mapReturn(updated);
    };

    // ==========================================
    // 6. SELLER: MARK ITEM RECEIVED
    // ==========================================

    const markItemReceived = async ({ returnId, sellerId }) =>
    {
        const returnRequest = await returnRequestRepository.findById(returnId);
        if (!returnRequest)
        {
            throw createApiError({
                statusCode: 404,
                code: 'RETURN_NOT_FOUND',
                message: 'Return request not found.',
            });
        }

        const sellerObjectId = returnRequest.seller?._id
            ? returnRequest.seller._id.toString()
            : returnRequest.seller.toString();

        if (sellerObjectId !== sellerId)
        {
            throw createApiError({
                statusCode: 404,
                code: 'RETURN_NOT_FOUND',
                message: 'Return request not found.',
            });
        }

        if (returnRequest.returnStatus !== RETURN_STATUS.APPROVED)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATUS_TRANSITION',
                message: `Cannot mark as received a return request in "${returnRequest.returnStatus}" status.`,
            });
        }

        // Restock inventory
        const order = await orderRepository.findById(returnRequest.order._id || returnRequest.order);
        const orderItem = order.orderItems.find(
            (item) => item._id.toString() === returnRequest.orderItemId.toString()
        );

        if (orderItem)
        {
            const productRef = orderItem.product?._id
                ? orderItem.product._id
                : orderItem.product;

            await inventoryHelper.restockOrderInventory([{
                product: productRef,
                variantId: orderItem.variantId || null,
                quantity: orderItem.quantity,
            }]);
        }

        const updated = await returnRequestRepository.updateStatus({
            returnId,
            returnStatus: RETURN_STATUS.ITEM_RECEIVED,
            historyEntry: buildHistoryEntry({
                fromStatus: RETURN_STATUS.APPROVED,
                toStatus: RETURN_STATUS.ITEM_RECEIVED,
                changedBy: sellerId,
                changedByModel: STATUS_HISTORY_ACTOR.SELLER,
                changedByRole: 'ROLE_SELLER',
                note: 'Returned item received and inventory restocked.',
            }),
        });

        // Fire-and-forget notification to customer
        notificationService.createNotification({
            customerId: returnRequest.customer?._id || returnRequest.customer,
            message: `Your returned item for ${returnRequest.returnId} has been received. Refund will be processed shortly.`,
        }).catch(() => { });

        return mapReturn(updated);
    };

    // ==========================================
    // 7. PROCESS REFUND
    // ==========================================

    const processRefund = async ({ returnId }) =>
    {
        const returnRequest = await returnRequestRepository.findById(returnId);
        if (!returnRequest)
        {
            throw createApiError({
                statusCode: 404,
                code: 'RETURN_NOT_FOUND',
                message: 'Return request not found.',
            });
        }

        if (returnRequest.returnStatus !== RETURN_STATUS.ITEM_RECEIVED)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATUS_TRANSITION',
                message: `Cannot process refund for a return request in "${returnRequest.returnStatus}" status.`,
            });
        }

        const order = await orderRepository.findById(returnRequest.order._id || returnRequest.order);
        if (!order)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'Order not found for this return.',
            });
        }

        // Compute proportional post-coupon earnings to reverse
        const orderItem = order.orderItems.find(
            (item) => item._id.toString() === returnRequest.orderItemId.toString()
        );
        const itemSellingPrice = orderItem ? Number(orderItem.sellingPrice) : 0;
        const itemMrpPrice = orderItem ? Number(orderItem.mrpPrice) : 0;
        const orderTotalSelling = Number(order.totalSellingPrice) || 1;
        const couponFacade = createCouponFacade();
        const itemEarningsShare = orderTotalSelling > 0
            ? (itemSellingPrice / orderTotalSelling) * couponFacade.computeSellerEarnings(order.totalSellingPrice, order.couponPrice)
            : 0;

        // Reverse seller earnings for this refund
        try
        {
            await sellerReportRepository.applyRefund({
                sellerId: returnRequest.seller._id || returnRequest.seller,
                earnings: itemEarningsShare,
                sales: itemMrpPrice,
            });
        }
        catch (err)
        {
            // Refund reconciliation is non-blocking for the refund flow
        }

        // Cancel commission for this order if it exists
        try
        {
            await commissionService.cancelCommissionForRefund(
                returnRequest.order._id || returnRequest.order
            );
        }
        catch (err)
        {
            // Commission cancellation is non-blocking
        }

        const paymentOrder = await paymentOrderRepository.findByOrderId({
            orderId: returnRequest.order._id || returnRequest.order,
        });

        if (!paymentOrder)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PAYMENT_ORDER_NOT_FOUND',
                message: 'Payment order not found for this return.',
            });
        }

        const isOnlinePayment = [PAYMENT_METHODS.RAZORPAY, PAYMENT_METHODS.STRIPE]
            .includes(paymentOrder.paymentMethod);

        const refundMethod = isOnlinePayment
            ? REFUND_METHOD.ORIGINAL_PAYMENT
            : REFUND_METHOD.STORE_CREDIT;

        const refund = await refundRepository.create({
            returnRequestId: returnId,
            orderId: returnRequest.order._id || returnRequest.order,
            paymentOrderId: paymentOrder._id,
            amount: returnRequest.refundAmount,
            status: REFUND_STATUS.PENDING,
            method: refundMethod,
        });

        if (paymentGatewayFactory && isOnlinePayment)
        {
            try
            {
                await executeGatewayRefund({
                    refundId: refund._id.toString(),
                    paymentOrderId: paymentOrder._id.toString(),
                    amount: returnRequest.refundAmount,
                    returnId,
                });
            }
            catch (err)
            {
                // Gateway failure is non-blocking for the return flow
                // The refund stays PENDING and can be retried
            }
        }

        const updated = await returnRequestRepository.updateStatus({
            returnId,
            returnStatus: RETURN_STATUS.ITEM_RECEIVED,
            historyEntry: buildHistoryEntry({
                fromStatus: RETURN_STATUS.ITEM_RECEIVED,
                toStatus: RETURN_STATUS.ITEM_RECEIVED,
                changedBy: null,
                changedByModel: STATUS_HISTORY_ACTOR.SYSTEM,
                changedByRole: 'ROLE_SYSTEM',
                note: `Refund of amount ${returnRequest.refundAmount} initiated via ${refundMethod}. Awaiting gateway confirmation.`,
            }),
        });

        notificationService.createNotification({
            customerId: returnRequest.customer?._id || returnRequest.customer,
            message: `Refund of amount ${returnRequest.refundAmount} for return ${returnRequest.returnId} has been initiated. It will be credited shortly.`,
        }).catch(() => { });

        return { returnRequest: mapReturn(updated), refund };
    };

    // ==========================================
    // 8. GATEWAY REFUND ORCHESTRATION
    // ==========================================

    const executeGatewayRefund = async ({ refundId, paymentOrderId, amount, returnId }) =>
    {
        const provider = mockGatewaysConfig?.defaultRefundProvider || 'mock_razorpay';
        const gateway = paymentGatewayFactory.getRefundGateway(provider);
        const idempotencyKey = gatewayUtils.generateIdempotencyKey('REFUND', refundId, 1);
        const correlationId = gatewayUtils.generateCorrelationId();

        const gatewayResponse = await gateway.createRefund({
            entityId: refundId,
            paymentId: paymentOrderId,
            amount,
            speed: 'normal',
            notes: { returnId },
            idempotencyKey,
            correlationId,
        });

        if (gatewayResponse.status === GATEWAY_REFUND_STATUS.FAILED)
        {
            await refundRepository.updateGatewayStatus(refundId, {
                gateway: provider,
                gatewayStatus: GATEWAY_REFUND_STATUS.FAILED,
                status: REFUND_STATUS.FAILED,
            });
            return;
        }

        await refundRepository.updateGatewayStatus(refundId, {
            gateway: provider,
            providerRefundId: gatewayResponse.id,
            gatewayStatus: gatewayResponse.status,
        });
    };

    return Object.freeze({
        requestReturn,
        getCustomerReturns,
        getSellerReturns,
        approveReturn,
        rejectReturn,
        markItemReceived,
        processRefund,
        executeGatewayRefund,
    });
};
