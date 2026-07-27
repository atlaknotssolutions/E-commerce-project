import crypto from 'crypto';
import mongoose from 'mongoose';
import
    {
        ROLES,
        ORDER_STATUS,
        PAYMENT_STATUS,
        SHIPMENT_STATUS,
        CARRIERS,
    } from "../../constants/enums.js";
import { isValidTransition, canCustomerCancel, getSellerTransitions } from "../../constants/orderTransitions.js";
import { createInventoryHelper } from "./orderInventoryHelper.js";

const RESERVATION_TTL_MINUTES = 30;

/**
 * Pure function-based factory representing the Sales Order Business Service layer.
 * Coordinates multi-vendor split checkouts and manages chronological order lifecycle workflows.
 */
export const createOrderService = ({
    orderRepository,
    paymentOrderRepository,
    cartRepository,
    userRepository,
    sellerReportRepository,
    productRepository,
    notificationService,
    commissionService,
    createApiError,
    mapOrder,
    mapOrders,
    mapOrderItem,
}) =>
{
    const inventory = createInventoryHelper({ productRepository, createApiError });

    /**
     * Internal generator. Compiles unique, human-readable e-commerce order IDs.
     * Example: 'ORD_93FA2C10'
     */
    const generateBusinessOrderId = () =>
    {
        const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `ORD_${randomHex}`;
    };

    /**
     * Split Checkout Engine.
     * Groups cart items by merchant seller, snapshots pricing/shipping details,
     * and registers child split orders atomically inside a MongoDB transaction.
     * Also creates the payment record inside the same transaction to prevent orphaned state.
     */
    const createOrdersFromCart = async ({ userId, shippingAddress, paymentMethod }) =>
    {
        const session = await mongoose.startSession();
        let result = null;

        try
        {
            await session.withTransaction(async () =>
            {
                // 1. Retrieve and verify user shopping cart
                const cart = await cartRepository.findByUserId({ userId });
                if (!cart || cart.items.length === 0)
                {
                    throw createApiError({
                        statusCode: 400,
                        code: 'EMPTY_CART',
                        message: 'Checkout rejected: Your shopping cart is empty.'
                    });
                }

                // 2. Multi-Vendor Split Algorithm: Group cart items by their associated seller ID
                const groupedBySeller = {};
                cart.items.forEach((item) =>
                {
                    if (!item.product || !item.product.seller)
                    {
                        throw createApiError({
                            statusCode: 400,
                            code: 'PRODUCT_DATA_INCOMPLETE',
                            message: `Checkout failed: Incomplete metadata found on product catalog item '${item.product ? item.product.title : 'Unknown'}'.`
                        });
                    }

                    const sellerIdStr =
                        item.product.seller?._id
                            ? item.product.seller._id.toString()
                            : item.product.seller.toString();

                    if (!groupedBySeller[sellerIdStr])
                    {
                        groupedBySeller[sellerIdStr] = [];
                    }
                    groupedBySeller[sellerIdStr].push(item);
                });

                const splitOrdersList = [];

                // 3. Validate and reserve stock for all items before creating any orders
                const allCartItems = Object.values(groupedBySeller).flat();
                const itemsForInventory = allCartItems.map((item) => ({
                    product: item.product._id,
                    title: item.product.title,
                    variantId: item.variantId || null,
                    quantity: item.quantity,
                }));
                await inventory.reserveOrderInventory(itemsForInventory);

                // 4. Compute reservation window
                const now = new Date();
                const reservationExpiresAt = new Date(now.getTime() + RESERVATION_TTL_MINUTES * 60 * 1000);

                // 5. Process and persist individual split orders
                for (const sellerIdStr of Object.keys(groupedBySeller))
                {
                    const sellerItems = groupedBySeller[sellerIdStr];

                    let totalMrpPrice = 0;
                    let totalSellingPrice = 0;
                    let totalItem = 0;

                    const orderItemsSnapshots = sellerItems.map((item) =>
                    {
                        const lineMrp = item.product.mrpPrice * item.quantity;
                        const lineSelling = item.product.sellingPrice * item.quantity;

                        totalMrpPrice += lineMrp;
                        totalSellingPrice += lineSelling;
                        totalItem += item.quantity;

                        let resolvedMrp = lineMrp;
                        let resolvedSelling = lineSelling;
                        let variantAttributes = null;

                        if (item.variantId && item.product.variants)
                        {
                            const matchedVariant = item.product.variants.find(
                                (v) => v._id.toString() === item.variantId.toString()
                            );
                            if (matchedVariant)
                            {
                                resolvedMrp = matchedVariant.mrpPrice * item.quantity;
                                resolvedSelling = matchedVariant.price * item.quantity;
                                variantAttributes = matchedVariant.attributes;
                            }
                        }

                        totalMrpPrice = totalMrpPrice - lineMrp + resolvedMrp;
                        totalSellingPrice = totalSellingPrice - lineSelling + resolvedSelling;

                        return {
                            product: item.product._id,
                            title: item.product.title,
                            size: item.size,
                            variantId: item.variantId || undefined,
                            variantAttributes: variantAttributes || undefined,
                            quantity: item.quantity,
                            mrpPrice: resolvedMrp,
                            sellingPrice: resolvedSelling,
                        };
                    });

                    const orderPayload = {
                        orderId: generateBusinessOrderId(),
                        user: userId,
                        seller: new mongoose.Types.ObjectId(sellerIdStr),
                        orderItems: orderItemsSnapshots,
                        shippingAddress,
                        totalMrpPrice,
                        totalSellingPrice,
                        discount: totalMrpPrice - totalSellingPrice,
                        totalItem,
                        orderStatus: ORDER_STATUS.PENDING,
                        paymentStatus: PAYMENT_STATUS.PENDING,
                        reservedAt: now,
                        reservationExpiresAt,
                    };

                    const orderWithHistory = {
                        ...orderPayload,
                        statusHistory: [{
                            fromStatus: ORDER_STATUS.PENDING,
                            toStatus: ORDER_STATUS.PENDING,
                            changedBy: userId,
                            changedByModel: 'User',
                            changedByRole: ROLES.CUSTOMER,
                            changedAt: now,
                            note: 'Order placed',
                        }],
                    };

                    const savedOrder = await orderRepository.createOrder(orderWithHistory, { session });
                    splitOrdersList.push(savedOrder);
                }

                const totalPayableSellingPrice = splitOrdersList.reduce((sum, o) => sum + o.totalSellingPrice, 0);
                const finalAmountAfterCoupons = Math.max(0, totalPayableSellingPrice - cart.couponPrice);

                // 6. Create payment record inside the same transaction
                const ordersList = splitOrdersList.map((order) => order._id);
                const paymentOrder = await paymentOrderRepository.createPaymentOrder({
                    amount: finalAmountAfterCoupons,
                    status: PAYMENT_STATUS.PENDING,
                    paymentMethod,
                    user: userId,
                    orders: ordersList,
                }, { session });

                result = {
                    splitOrders: splitOrdersList,
                    paymentOrder,
                    finalPayableAmount: finalAmountAfterCoupons,
                };
            });
        }
        finally
        {
            await session.endSession();
        }

        if (!result)
        {
            throw createApiError({
                statusCode: 500,
                code: 'CHECKOUT_FAILED',
                message: 'Checkout could not be completed. Please try again.'
            });
        }

        return result;
    };

    /**
     * Compensation Engine.
     * Reverses a failed checkout: cancels all orders, releases reserved inventory,
     * and marks the payment record as FAILED.
     * Fully idempotent: safe to call multiple times (gateway retries, webhook retries).
     */
    const reverseCheckout = async ({ orderIds, paymentOrderId }) =>
    {
        // Idempotency guard: if payment is already FAILED, nothing to compensate
        if (paymentOrderId)
        {
            const existingPayment = await paymentOrderRepository.findById(paymentOrderId);
            if (existingPayment && existingPayment.status === PAYMENT_STATUS.FAILED)
            {
                return;
            }
        }

        const cancelledOrderItems = [];
        const session = await mongoose.startSession();

        try
        {
            await session.withTransaction(async () =>
            {
                const orders = await orderRepository.findOrdersByIds(orderIds, { session });

                for (const order of orders)
                {
                    const currentOrder = await orderRepository.findById(order._id);

                    if (currentOrder && currentOrder.orderStatus !== ORDER_STATUS.CANCELLED)
                    {
                        await orderRepository.updateStatusWithHistory({
                            orderId: order._id,
                            orderStatus: ORDER_STATUS.CANCELLED,
                            historyEntry: {
                                fromStatus: currentOrder.orderStatus,
                                toStatus: ORDER_STATUS.CANCELLED,
                                changedBy: currentOrder.user,
                                changedByModel: 'System',
                                changedByRole: ROLES.ADMIN,
                                changedAt: new Date(),
                                note: 'Automatic cancellation: checkout compensation after gateway failure',
                            },
                        }, { session });

                        // Track only orders we actually cancelled in this invocation
                        cancelledOrderItems.push(...currentOrder.orderItems);
                    }
                }

                if (paymentOrderId)
                {
                    await paymentOrderRepository.updateStatus({
                        paymentOrderId,
                        status: PAYMENT_STATUS.FAILED,
                    }, { session });
                }
            });
        }
        finally
        {
            await session.endSession();
        }

        // Release inventory OUTSIDE transaction — only for orders actually cancelled in this call.
        // Product-level $expr guards prevent negative reservedQuantity even on rare double-release.
        for (const item of cancelledOrderItems)
        {
            await inventory.releaseOrderInventory([item]);
        }
    };

    /**
     * Reservation Expiry Engine.
     * Finds PENDING/PLACED orders whose reservation window has lapsed
     * and automatically cancels them, releasing inventory.
     * Designed to be invoked by BullMQ / Redis / Cron — fully decoupled from any scheduler.
     */
    const expireStaleReservations = async ({ beforeDate } = {}) =>
    {
        const cutoffDate = beforeDate || new Date();
        const expiredOrders = await orderRepository.findExpiredReservations({ beforeDate: cutoffDate });

        const results = [];

        for (const order of expiredOrders)
        {
            try
            {
                await cancelOrder({
                    orderId: order._id,
                    userId: order.user._id || order.user,
                    reason: 'Reservation expired: order was not confirmed within the allowed window.',
                });
                results.push({ orderId: order._id, status: 'expired' });
            }
            catch (err)
            {
                results.push({ orderId: order._id, status: 'failed', error: err.message });
            }
        }

        return results;
    };

    /**
     * Maps order status to the corresponding shipment status.
     */
    const resolveShipmentStatusFromOrder = (orderStatus) =>
    {
        const mapping = {
            [ORDER_STATUS.CONFIRMED]: SHIPMENT_STATUS.UNFULFILLED,
            [ORDER_STATUS.PACKED]: SHIPMENT_STATUS.PACKING,
            [ORDER_STATUS.SHIPPED]: SHIPMENT_STATUS.SHIPPED,
            [ORDER_STATUS.OUT_FOR_DELIVERY]: SHIPMENT_STATUS.OUT_FOR_DELIVERY,
            [ORDER_STATUS.DELIVERED]: SHIPMENT_STATUS.DELIVERED,
        };
        return mapping[orderStatus] || null;
    };

    /**
     * Shipment-Relevant Notification Messages.
     */
    const SHIPMENT_NOTIFICATIONS = {
        [ORDER_STATUS.PACKED]: 'Your order has been packed and is ready for dispatch.',
        [ORDER_STATUS.SHIPPED]: 'Your order has been shipped! Track your delivery for real-time updates.',
        [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Your order is out for delivery. Please be available to receive it.',
        [ORDER_STATUS.DELIVERED]: 'Your order has been delivered successfully. Thank you for shopping with us!',
    };

    /**
     * Fire-and-forget notification sender.
     * Logs errors silently — notifications must never break order operations.
     */
    const sendShipmentNotification = async ({ customerId, orderStatus, orderId }) =>
    {
        const message = SHIPMENT_NOTIFICATIONS[orderStatus];
        if (!message || !notificationService || !customerId) return;

        try
        {
            await notificationService.createNotification({
                customerId,
                message: `[Order ${orderId}] ${message}`,
            });
        }
        catch (err)
        {
            console.error('Shipment notification failed:', err.message);
        }
    };

    /**
     * Seller Shipment Tracking Assignment.
     * Validates order is in PACKED state, then assigns tracking number + carrier.
     * Cannot add tracking before PACKED. Cannot assign tracking to DELIVERED or CANCELLED orders.
     */
    const assignShipmentTracking = async ({ orderId, trackingNumber, carrier, estimatedDelivery, sellerId }) =>
    {
        if (!trackingNumber || !trackingNumber.trim())
        {
            throw createApiError({
                statusCode: 400,
                code: 'TRACKING_REQUIRED',
                message: 'Tracking number is required and cannot be empty.'
            });
        }

        if (!carrier || !Object.values(CARRIERS).includes(carrier))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_CARRIER',
                message: `Invalid carrier '${carrier}'. Supported carriers: ${Object.values(CARRIERS).join(', ')}.`
            });
        }

        const order = await orderRepository.findOrderForSeller({ orderId, sellerId });
        if (!order)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'Tracking assignment failed. Targeted sales order does not exist or does not belong to your store.'
            });
        }

        if (order.orderStatus === ORDER_STATUS.DELIVERED || order.orderStatus === ORDER_STATUS.CANCELLED)
        {
            throw createApiError({
                statusCode: 400,
                code: 'ORDER_ALREADY_DELIVERED',
                message: `Cannot assign tracking: order is already ${order.orderStatus.toLowerCase()}.`
            });
        }

        if (order.orderStatus !== ORDER_STATUS.PACKED)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_SHIPMENT_STATE',
                message: 'Cannot assign tracking number before the order is packed. Please pack the order first.'
            });
        }

        if (order.trackingNumber && order.trackingNumber === trackingNumber.trim())
        {
            throw createApiError({
                statusCode: 400,
                code: 'TRACKING_ALREADY_EXISTS',
                message: 'This tracking number is already assigned to this order.'
            });
        }

        const existingOrder = await orderRepository.findOrderByTrackingNumber({ trackingNumber: trackingNumber.trim() });
        if (existingOrder && existingOrder._id.toString() !== orderId)
        {
            throw createApiError({
                statusCode: 409,
                code: 'TRACKING_ALREADY_EXISTS',
                message: 'This tracking number is already assigned to another order.'
            });
        }

        const updatedOrder = await orderRepository.updateShipmentTracking({
            orderId,
            trackingNumber: trackingNumber.trim(),
            carrier,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
            shipmentHistoryEntry: {
                fromStatus: order.shipmentStatus,
                toStatus: order.shipmentStatus,
                changedBy: sellerId,
                changedByModel: 'Seller',
                changedByRole: ROLES.SELLER,
                changedAt: new Date(),
                note: `Tracking number ${trackingNumber.trim()} assigned via ${carrier}`,
            },
        });

        return mapOrder(updatedOrder);
    };

    /**
     * Seller Shipment Status Updater.
     * Validates order ownership and transitions, updates shipment status + order status in sync.
     * Generates notification events on shipment-relevant transitions.
     */
    const updateShipmentStatus = async ({ orderId, orderStatus, sellerId }) =>
    {
        const order = await orderRepository.findOrderForSeller({ orderId, sellerId });
        if (!order)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'Status update failed. Targeted sales order does not exist or does not belong to your store.'
            });
        }

        const allowedTargets = getSellerTransitions(order.orderStatus);
        if (!allowedTargets.includes(orderStatus))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATUS_TRANSITION',
                message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}.`
            });
        }

        const shipmentStatus = resolveShipmentStatusFromOrder(orderStatus);
        const now = new Date();

        const updateFields = {};
        if (shipmentStatus)
        {
            updateFields.shipmentStatus = shipmentStatus;
            if (orderStatus === ORDER_STATUS.SHIPPED) updateFields.shippedAt = now;
            if (orderStatus === ORDER_STATUS.DELIVERED) updateFields.deliveredAt = now;
        }

        let updatedOrder;

        if (Object.keys(updateFields).length > 0)
        {
            updatedOrder = await orderRepository.updateShipmentStatus({
                orderId,
                shipmentStatus,
                shippedAt: updateFields.shippedAt,
                deliveredAt: updateFields.deliveredAt,
                shipmentHistoryEntry: {
                    fromStatus: order.shipmentStatus,
                    toStatus: shipmentStatus,
                    changedBy: sellerId,
                    changedByModel: 'Seller',
                    changedByRole: ROLES.SELLER,
                    changedAt: now,
                    note: `Order status changed to ${orderStatus}`,
                },
            });
        }

        updatedOrder = await orderRepository.updateStatusWithHistory({
            orderId,
            orderStatus,
            historyEntry: {
                fromStatus: order.orderStatus,
                toStatus: orderStatus,
                changedBy: sellerId,
                changedByModel: 'Seller',
                changedByRole: ROLES.SELLER,
                changedAt: now,
            },
        });

        if (orderStatus === ORDER_STATUS.CONFIRMED)
        {
            await inventory.commitOrderInventory(order.orderItems);
        }

        await sendShipmentNotification({
            customerId: order.user._id || order.user,
            orderStatus,
            orderId: order.orderId,
        });

        if (orderStatus === ORDER_STATUS.DELIVERED && commissionService)
        {
            try { await commissionService.calculateCommission({ orderId: updatedOrder._id || updatedOrder.id || orderId }); }
            catch (err) { /* commission calculation is non-blocking */ }
        }

        return mapOrder(updatedOrder);
    };

    /**
     * Customer Shipment Tracking Viewer.
     * Returns shipment tracking details for a specific order.
     * Enforces customer ownership or seller ownership or admin.
     */
    const getOrderTracking = async ({ orderId, actorId, actorRole }) =>
    {
        const order = await orderRepository.findById(orderId);
        if (!order)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'The requested sales order was not found.'
            });
        }

        const isCustomerOwner =
            actorRole === ROLES.CUSTOMER &&
            order.user._id.toString() === actorId.toString();

        const isSellerOwner =
            actorRole === ROLES.SELLER &&
            order.seller._id.toString() === actorId.toString();

        const isAdmin = actorRole === ROLES.ADMIN;

        if (!isCustomerOwner && !isSellerOwner && !isAdmin)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: 'Access Denied: You do not possess authorizations to view shipment tracking for this order.'
            });
        }

        return {
            orderId: order.orderId,
            orderStatus: order.orderStatus,
            trackingNumber: order.trackingNumber || null,
            carrier: order.carrier || null,
            shipmentStatus: order.shipmentStatus,
            shippedAt: order.shippedAt || null,
            estimatedDelivery: order.estimatedDelivery || null,
            deliveredAt: order.deliveredAt || null,
            shipmentHistory: order.shipmentHistory || [],
        };
    };

    /**
     * Retrieves purchase history of a customer.
     */
    const getUserOrders = async ({ userId }) =>
    {
        const orders = await orderRepository.findByUser({ userId });

        return mapOrders(orders);
    };

    /**
     * Retrieves store orders panel for a merchant seller.
     */
    const getSellerOrders = async ({ sellerId }) =>
    {
        const orders = await orderRepository.findBySeller({ sellerId });

        return mapOrders(orders);
    };

    /**
     * Retrieves single order details, enforcing access controls for actors.
     */
    const getOrderById = async ({ orderId, actorId, actorRole }) =>
    {
        const order = await orderRepository.findById(orderId);
        if (!order)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'The requested sales order was not found.'
            });
        }

        const isCustomerOwner =
            actorRole === ROLES.CUSTOMER &&
            order.user._id.toString() === actorId.toString();

        const isSellerOwner =
            actorRole === ROLES.SELLER &&
            order.seller._id.toString() === actorId.toString();

        const isAdmin =
            actorRole === ROLES.ADMIN;

        if (!isCustomerOwner && !isSellerOwner && !isAdmin)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: 'Access Denied: You do not possess authorizations to view this sales order.'
            });
        }

        const payment = await paymentOrderRepository.findByOrderId(order._id);

        const response = mapOrder(order);

        response.payment = payment
            ? {
                method: payment.paymentMethod,
                status: payment.status,
                amount: payment.amount,
                transactionId: payment.providerPaymentId,
                paymentLinkId: payment.paymentLinkId,
            }
            : null;

        return response;
    };

    /**
     * Executes order cancellations.
     * Customer-scoped query + customer-only cancellation rules + atomic update.
     * Accepts an optional reason for system-initiated cancellations (e.g., reservation expiry).
     */
    const cancelOrder = async ({ orderId, userId, reason }) =>
    {
        let cancelledOrder = null;

        const session = await mongoose.startSession();

        try
        {
            await session.withTransaction(async () =>
            {
                const order = await orderRepository.findOrderForCustomer({ orderId, customerId: userId }, { session });
                if (!order)
                {
                    throw createApiError({
                        statusCode: 404,
                        code: 'ORDER_NOT_FOUND',
                        message: 'Cancellation failed. Targeted order does not exist or does not belong to your account.'
                    });
                }

                if (!canCustomerCancel(order.orderStatus))
                {
                    throw createApiError({
                        statusCode: 400,
                        code: 'ORDER_NOT_CANCELLABLE',
                        message: 'This order can no longer be cancelled. You can only cancel orders before they are packed.'
                    });
                }

                cancelledOrder = await orderRepository.updateStatusWithHistory({
                    orderId,
                    orderStatus: ORDER_STATUS.CANCELLED,
                    historyEntry: {
                        fromStatus: order.orderStatus,
                        toStatus: ORDER_STATUS.CANCELLED,
                        changedBy: userId,
                        changedByModel: 'User',
                        changedByRole: ROLES.CUSTOMER,
                        changedAt: new Date(),
                        note: reason || 'Cancelled by customer',
                    },
                }, { session });

                await inventory.releaseOrderInventory(order.orderItems);

                await sellerReportRepository.applyCancellation({
                    sellerId: order.seller._id,
                    refund: order.totalSellingPrice,
                }, { session });
            });
        }
        finally
        {
            await session.endSession();
        }

        if (commissionService && cancelledOrder) {
            await commissionService.cancelCommissionForRefund(orderId);
        }

        return mapOrder(cancelledOrder);
    };

    /**
     * Merchant Order Status Updater.
     * Uses seller-scoped query and seller-only transition map.
     * Automatically syncs shipment status and generates notifications on shipment-relevant transitions.
     */
    const updateOrderStatus = async ({ orderId, orderStatus, sellerId }) =>
    {
        const order = await orderRepository.findOrderForSeller({ orderId, sellerId });
        if (!order)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'Status update failed. Targeted sales order does not exist or does not belong to your store.'
            });
        }

        const allowedTargets = getSellerTransitions(order.orderStatus);
        if (!allowedTargets.includes(orderStatus))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATUS_TRANSITION',
                message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}.`
            });
        }

        const shipmentStatus = resolveShipmentStatusFromOrder(orderStatus);
        const now = new Date();

        // Update order status + audit trail
        const updatedOrder = await orderRepository.updateStatusWithHistory({
            orderId,
            orderStatus,
            historyEntry: {
                fromStatus: order.orderStatus,
                toStatus: orderStatus,
                changedBy: sellerId,
                changedByModel: 'Seller',
                changedByRole: ROLES.SELLER,
                changedAt: now,
            },
        });

        // Sync shipment status when entering the fulfillment pipeline
        if (shipmentStatus)
        {
            await orderRepository.updateShipmentStatus({
                orderId,
                shipmentStatus,
                shippedAt: orderStatus === ORDER_STATUS.SHIPPED ? now : undefined,
                deliveredAt: orderStatus === ORDER_STATUS.DELIVERED ? now : undefined,
                shipmentHistoryEntry: {
                    fromStatus: order.shipmentStatus,
                    toStatus: shipmentStatus,
                    changedBy: sellerId,
                    changedByModel: 'Seller',
                    changedByRole: ROLES.SELLER,
                    changedAt: now,
                    note: `Order status changed to ${orderStatus}`,
                },
            });
        }

        if (orderStatus === ORDER_STATUS.CONFIRMED)
        {
            await inventory.commitOrderInventory(order.orderItems);
        }

        // Generate notification events on shipment-relevant transitions
        await sendShipmentNotification({
            customerId: order.user._id || order.user,
            orderStatus,
            orderId: order.orderId,
        });

        if (orderStatus === ORDER_STATUS.DELIVERED && commissionService)
        {
            try { await commissionService.calculateCommission({ orderId: updatedOrder._id || updatedOrder.id || orderId }); }
            catch (err) { /* commission calculation is non-blocking */ }
        }

        return mapOrder(updatedOrder);
    };

    /**
     * Merchant Order Deletion (Erase command).
     * Uses seller-scoped query and seller-only transition map.
     */
    const deleteOrder = async ({ orderId, sellerId }) =>
    {
        const order = await orderRepository.findOrderForSeller({ orderId, sellerId });
        if (!order)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'Deletion failed. Targeted order does not exist or does not belong to your store.'
            });
        }

        const allowedTargets = getSellerTransitions(order.orderStatus);
        if (!allowedTargets.includes(ORDER_STATUS.CANCELLED))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATUS_TRANSITION',
                message: `Cannot cancel order: transition from ${order.orderStatus} to CANCELLED is not allowed.`
            });
        }

        await orderRepository.updateStatusWithHistory({
            orderId,
            orderStatus: ORDER_STATUS.CANCELLED,
            historyEntry: {
                fromStatus: order.orderStatus,
                toStatus: ORDER_STATUS.CANCELLED,
                changedBy: sellerId,
                changedByModel: 'Seller',
                changedByRole: ROLES.SELLER,
                changedAt: new Date(),
                note: 'Cancelled by seller',
            },
        });

        return { success: true, message: 'Sales order successfully removed.' };
    };

    /**
     * Order Item Snapshot lookups.
     * Resolves specific single item details directly using repository positional operator query.
     */
    const getOrderItemById = async ({ orderItemId }) =>
    {
        const itemSnapshot = await orderRepository.findOrderItemById(orderItemId);
        if (!itemSnapshot)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_ITEM_NOT_FOUND',
                message: 'The requested ordered product snapshot was not found.'
            });
        }
        return mapOrderItem(itemSnapshot);
    };

    return Object.freeze({
        createOrdersFromCart,
        reverseCheckout,
        expireStaleReservations,
        assignShipmentTracking,
        getOrderTracking,
        getUserOrders,
        getSellerOrders,
        getOrderById,
        cancelOrder,
        updateOrderStatus,
        deleteOrder,
        getOrderItemById,
    });
};
