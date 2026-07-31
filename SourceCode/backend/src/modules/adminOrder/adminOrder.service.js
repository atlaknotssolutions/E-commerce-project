import { STATUS_HISTORY_ACTOR } from '../../constants/enums.js';
import { getValidTransitions } from '../../constants/orderTransitions.js';

/**
 * Pure function-based factory representing the Admin Order Business Service layer.
 * Coordinates admin-only order management: view, search, filter, status updates.
 * Reuses existing orderRepository and order mapper — no duplication.
 */
export const createAdminOrderService = ({
    Order,
    orderRepository,
    paymentOrderRepository,
    notificationService,
    commissionService,
    createApiError,
    mapOrder,
    mapOrders,
}) =>
{
    /**
     * Maps order status to the corresponding shipment status.
     */
    const resolveShipmentStatusFromOrder = (orderStatus) =>
    {
        const mapping = {
            CONFIRMED: 'UNFULFILLED',
            PACKED: 'PACKING',
            SHIPPED: 'SHIPPED',
            OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
            DELIVERED: 'DELIVERED',
        };
        return mapping[orderStatus] || null;
    };

    /**
     * Fire-and-forget notification sender.
     */
    const notifyCustomer = (customerId, message) =>
    {
        notificationService.createNotification({
            customerId,
            message,
        }).catch(() => {});
    };

    /**
     * Retrieves all orders with search, filters, and pagination.
     */
    const getAllOrders = async (opts) =>
    {
        const result = await orderRepository.findAllOrders(opts);
        return {
            ...result,
            orders: mapOrders(result.orders),
        };
    };

    /**
     * Retrieves full order details by ID.
     * Admin has unrestricted access to any order.
     */
    const getOrderDetails = async (orderId) =>
    {
        const order = await orderRepository.findById(orderId);

        if (!order)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'The requested order does not exist.',
            });
        }

        const response = mapOrder(order);

        const payment = await paymentOrderRepository.findByOrderId(order._id);

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
     * Updates order status as admin.
     * Uses the full transition map — admin can perform any valid forward transition.
     */
    const updateOrderStatus = async ({ orderId, orderStatus, adminId, adminNote }) =>
    {
        const order = await orderRepository.findById(orderId);

        if (!order)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'The requested order does not exist.',
            });
        }

        if (order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED')
        {
            throw createApiError({
                statusCode: 400,
                code: 'ORDER_IN_TERMINAL_STATE',
                message: `Cannot update status: order is already ${order.orderStatus.toLowerCase()}.`,
            });
        }

        if (order.orderStatus === orderStatus)
        {
            throw createApiError({
                statusCode: 400,
                code: 'STATUS_UNCHANGED',
                message: `Order is already in status '${orderStatus}'.`,
            });
        }

        const allowedTargets = getValidTransitions(order.orderStatus);
        if (!allowedTargets.includes(orderStatus))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_STATUS_TRANSITION',
                message: `Cannot change order status from '${order.orderStatus}' to '${orderStatus}'. Allowed transitions: ${allowedTargets.join(', ') || 'none'}.`,
            });
        }

        const shipmentStatus = resolveShipmentStatusFromOrder(orderStatus);
        const now = new Date();

        const updatedOrder = await orderRepository.updateStatusWithHistory({
            orderId,
            orderStatus,
            historyEntry: {
                fromStatus: order.orderStatus,
                toStatus: orderStatus,
                changedBy: adminId,
                changedByModel: STATUS_HISTORY_ACTOR.ADMIN,
                changedByRole: 'ROLE_ADMIN',
                changedAt: now,
                note: adminNote || `Status updated by admin to ${orderStatus}`,
            },
        });

        if (shipmentStatus)
        {
            const updateFields = {};
            if (orderStatus === 'SHIPPED') updateFields.shippedAt = now;
            if (orderStatus === 'DELIVERED') updateFields.deliveredAt = now;

            await orderRepository.updateShipmentStatus({
                orderId,
                shipmentStatus,
                shippedAt: updateFields.shippedAt,
                deliveredAt: updateFields.deliveredAt,
                shipmentHistoryEntry: {
                    fromStatus: order.shipmentStatus,
                    toStatus: shipmentStatus,
                    changedBy: adminId,
                    changedByModel: STATUS_HISTORY_ACTOR.ADMIN,
                    changedByRole: 'ROLE_ADMIN',
                    changedAt: now,
                    note: adminNote || `Order status changed to ${orderStatus} by admin`,
                },
            });
        }

        const SHIPMENT_NOTIFICATIONS = {
            CONFIRMED: 'Your order has been confirmed.',
            PACKED: 'Your order has been packed and is ready for dispatch.',
            SHIPPED: 'Your order has been shipped! Track your delivery for real-time updates.',
            OUT_FOR_DELIVERY: 'Your order is out for delivery. Please be available to receive it.',
            DELIVERED: 'Your order has been delivered successfully. Thank you for shopping with us!',
            CANCELLED: 'Your order has been cancelled. Please contact support for any queries.',
        };

        const message = SHIPMENT_NOTIFICATIONS[orderStatus];
        if (message && order.user)
        {
            const customerId = order.user._id ? order.user._id.toString() : order.user.toString();
            notifyCustomer(customerId, `[Order ${order.orderId}] ${message}`);
        }

        if (orderStatus === 'DELIVERED' && commissionService)
        {
            try { await commissionService.calculateCommission({ orderId }); }
            catch (err) { /* commission calculation is non-blocking */ }
        }

        const payment = await paymentOrderRepository.findByOrderId(updatedOrder._id || updatedOrder.id || orderId);
        if (payment)
        {
            updatedOrder.payment = {
                method: payment.paymentMethod,
                status: payment.status,
                amount: payment.amount,
                transactionId: payment.providerPaymentId,
                paymentLinkId: payment.paymentLinkId,
            };
        }
        return mapOrder(updatedOrder);
    };

    /**
     * Returns order statistics for the admin dashboard.
     */
    const getOrderStats = async () =>
    {
        const statusCounts = await Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        ]);

        const result = {
            PENDING: 0,
            PLACED: 0,
            CONFIRMED: 0,
            PACKED: 0,
            SHIPPED: 0,
            OUT_FOR_DELIVERY: 0,
            DELIVERED: 0,
            CANCELLED: 0,
            totalOrders: 0,
        };

        for (const item of statusCounts)
        {
            if (result[item._id] !== undefined)
            {
                result[item._id] = item.count;
            }
            result.totalOrders += item.count;
        }

        return result;
    };

    return Object.freeze({
        getAllOrders,
        getOrderDetails,
        updateOrderStatus,
        getOrderStats,
    });
};
