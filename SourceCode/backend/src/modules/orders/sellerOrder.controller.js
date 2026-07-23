/**
 * Pure function-based factory representing the Merchant Seller Order HTTP API Controllers.
 * Strictly enforces thin controller design principles, avoiding classes and context leaks.
 */
export const createSellerOrderController = ({ orderService }) =>
{

    /**
     * Retrieves merchant store orders list chronologically newest first.
     * Maps exactly to: GET /seller/orders (Seller authorization required)
     */
    const getSellerOrders = async (req, res) =>
    {
        const sellerId = req.user.id;

        const ordersList = await orderService.getSellerOrders({ sellerId });

        res.status(202).json(ordersList);
    };

    /**
     * Merchant Order Status Transitions Modifier.
     * Maps exactly to: PATCH /seller/orders/:orderId/status/:orderStatus (Seller authorization required)
     */
    const updateStatus = async (req, res) =>
    {
        const { orderId, orderStatus } = req.params;
        const sellerId = req.user.id;

        const updatedOrder = await orderService.updateOrderStatus({
            orderId,
            orderStatus,
            sellerId,
        });

        res.status(202).json(updatedOrder);
    };

    /**
     * Merchant Shipment Tracking Assignment.
     * Maps exactly to: PUT /seller/orders/:orderId/tracking (Seller authorization required)
     */
    const assignTracking = async (req, res) =>
    {
        const { orderId } = req.params;
        const sellerId = req.user.id;
        const { trackingNumber, carrier, estimatedDelivery } = req.body;

        const updatedOrder = await orderService.assignShipmentTracking({
            orderId,
            trackingNumber,
            carrier,
            estimatedDelivery,
            sellerId,
        });

        res.status(200).json(updatedOrder);
    };

    /**
     * Merchant Order Deletions (Soft-cancel allocations).
     * Maps exactly to: DELETE /seller/orders/:orderId/delete (Seller ownership required)
     */
    const deleteOrder = async (req, res) =>
    {
        const { orderId } = req.params;
        const sellerId = req.user.id;

        const outcome = await orderService.deleteOrder({
            orderId,
            sellerId,
        });

        res.status(202).json(outcome);
    };

    return Object.freeze({
        getSellerOrders,
        updateStatus,
        assignTracking,
        deleteOrder,
    });
};