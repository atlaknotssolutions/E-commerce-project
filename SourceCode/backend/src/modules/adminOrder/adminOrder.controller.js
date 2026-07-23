/**
 * Pure function-based factory representing the Admin Order HTTP API Controllers.
 * Thin controllers — delegates all business logic to the service layer.
 */
export const createAdminOrderController = ({ adminOrderService }) =>
{
    /**
     * Lists all orders with search, filters, and pagination.
     * GET /admin/orders
     */
    const listOrders = async (req, res) =>
    {
        const {
            page,
            limit,
            search,
            orderStatus,
            paymentStatus,
            sellerId,
            customerId,
            sortBy,
            sortOrder,
        } = req.query;

        const opts = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
            search: search || null,
            orderStatus: orderStatus || null,
            paymentStatus: paymentStatus || null,
            sellerId: sellerId || null,
            customerId: customerId || null,
            sortBy: sortBy || 'orderDate',
            sortOrder: sortOrder || 'desc',
        };

        const result = await adminOrderService.getAllOrders(opts);

        res.status(200).json({
            success: true,
            data: result.orders,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    };

    /**
     * Returns full details for a single order.
     * GET /admin/orders/:orderId
     */
    const getOrderDetails = async (req, res) =>
    {
        const { orderId } = req.params;

        const order = await adminOrderService.getOrderDetails(orderId);

        res.status(200).json({ success: true, data: order });
    };

    /**
     * Updates order status. Admin can perform any valid forward transition.
     * PATCH /admin/orders/:orderId/status
     */
    const updateOrderStatus = async (req, res) =>
    {
        const { orderId } = req.params;
        const { orderStatus, adminNote } = req.body;
        const adminId = req.user.id;

        const result = await adminOrderService.updateOrderStatus({
            orderId,
            orderStatus,
            adminId,
            adminNote,
        });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Returns order statistics.
     * GET /admin/orders/stats
     */
    const getStats = async (req, res) =>
    {
        const stats = await adminOrderService.getOrderStats();

        res.status(200).json({ success: true, data: stats });
    };

    return Object.freeze({
        listOrders,
        getOrderDetails,
        updateOrderStatus,
        getStats,
    });
};
