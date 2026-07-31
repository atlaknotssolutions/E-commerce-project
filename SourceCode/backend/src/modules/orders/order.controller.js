import { emitToUser } from '../../services/socket.service.js';

/**
 * Pure function-based factory representing the Sales Order HTTP API Controllers.
 * Strictly enforces thin controller design principles, avoiding classes and context leaks.
 */
export const createOrderController = ({ orderService, paymentService, createApiError }) =>
{

    /**
     * Master Split Checkout Controller.
     * Generates multiple seller-split orders and handshakes with gateway to return payment link URL.
     * On gateway failure, triggers compensation to reverse the transactional checkout.
     * Maps exactly to: POST /api/orders?paymentMethod=RAZORPAY|STRIPE
     */
    const createOrders = async (req, res) =>
    {
        const userId = req.user.id;
        const shippingAddress = {
            name: req.body.name,
            mobile: req.body.mobile,
            streetAddress: req.body.address,
            locality: req.body.locality,
            city: req.body.city,
            state: req.body.state,
            pinCode: req.body.pinCode,
        };
        const { paymentMethod } = req.query;

        const { splitOrders, paymentOrder, finalPayableAmount } = await orderService.createOrdersFromCart({
            userId,
            shippingAddress,
            paymentMethod,
        });

        try
        {
            const { payment_link_url } = await paymentService.initiateGatewayPayment({
                paymentOrderId: paymentOrder._id,
                amount: finalPayableAmount,
                paymentMethod,
            });

            res.status(200).json({ payment_link_url });
        }
        catch (gatewayError)
        {
            console.error('[CHECKOUT ERROR] Gateway payment failed:', gatewayError);

            // Reverse the checkout (best-effort — must not mask the original error)
            try
            {
                await orderService.reverseCheckout({
                    orderIds: splitOrders.map((o) => o._id),
                    paymentOrderId: paymentOrder._id,
                });
            }
            catch (revertError)
            {
                console.error('[CHECKOUT REVERT FAILED]', revertError);
            }

            // Only actual gateway SDK errors (Razorpay/Stripe) become PAYMENT_GATEWAY_FAILED.
            // Gateway errors have an `error` property with `code`/`description` from the provider.
            // Our own createApiError has `isOperational: true` — these propagate with real codes.
            // Native errors (TypeError, ReferenceError, etc.) also propagate as-is.
            if (gatewayError.error && typeof gatewayError.error === 'object')
            {
                throw createApiError({
                    statusCode: 502,
                    code: 'PAYMENT_GATEWAY_FAILED',
                    message: 'Payment gateway is currently unavailable. Your order has been cancelled and stock has been released.'
                });
            }

            throw gatewayError;
        }
    };

    /**
     * Retrieves purchase history of a customer.
     * Maps exactly to: GET /api/orders/user
     */
    const getUserOrders = async (req, res) =>
    {
        const userId = req.user.id;

        const ordersList = await orderService.getUserOrders({ userId });

        res.status(202).json(ordersList);
    };

    /**
     * Retrieves merchant store orders panel.
     * Maps exactly to: GET /seller/orders
     */
    const getSellerOrders = async (req, res) =>
    {
        const sellerId = req.user.id;

        const ordersList = await orderService.getSellerOrders({ sellerId });

        res.status(202).json(ordersList);
    };

    /**
     * Retrieves single order details, enforcing access controls for actors.
     * Maps exactly to: GET /api/orders/:orderId
     */
    const getOrderById = async (req, res) =>
    {
        const { orderId } = req.params;
        const actorId = req.user.id;
        const actorRole = req.user.role;

        const orderDetail = await orderService.getOrderById({
            orderId,
            actorId,
            actorRole,
        });

        res.status(202).json(orderDetail);
    };

    /**
     * Executes order cancellations.
     * Maps exactly to: PUT /api/orders/:orderId/cancel
     */
    const cancelOrder = async (req, res) =>
    {
        const { orderId } = req.params;
        const userId = req.user.id;

        const cancelledOrder = await orderService.cancelOrder({
            orderId,
            userId,
        });

        emitToUser(userId, 'order:cancelled', { orderId, order: cancelledOrder });

        res.status(200).json(cancelledOrder);
    };

    /**
     * Retrieves single order item snapshot details.
     * Maps exactly to: GET /api/orders/item/:orderItemId (Authentication required)
     */
    const getOrderItemById = async (req, res) =>
    {
        const { orderItemId } = req.params;

        const itemSnapshot = await orderService.getOrderItemById({ orderItemId });

        res.status(202).json(itemSnapshot);
    };

    /**
     * Retrieves shipment tracking details for an order.
     * Maps exactly to: GET /api/orders/:orderId/tracking (Authentication required)
     */
    const getOrderTracking = async (req, res) =>
    {
        const { orderId } = req.params;
        const actorId = req.user.id;
        const actorRole = req.user.role;

        const trackingInfo = await orderService.getOrderTracking({
            orderId,
            actorId,
            actorRole,
        });

        res.status(200).json(trackingInfo);
    };

    return Object.freeze({
        createOrders,
        getUserOrders,
        getSellerOrders,
        getOrderById,
        cancelOrder,
        getOrderItemById,
        getOrderTracking,
    });
};
