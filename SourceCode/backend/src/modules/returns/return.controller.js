/**
 * Pure function-based factory representing the Return Request HTTP API Controllers.
 * Strictly enforces thin controller design principles, avoiding classes and context leaks.
 */
export const createReturnController = ({ returnService }) =>
{

    /**
     * Customer creates a new return request for a delivered order item.
     * Maps exactly to: POST /api/returns (Customer authentication required)
     */
    const requestReturn = async (req, res) =>
    {
        const customerId = req.user.id;
        const { orderId, orderItemId, productId, reason, description, images } = req.body;

        const returnRequest = await returnService.requestReturn({
            customerId,
            orderId,
            orderItemId,
            productId,
            reason,
            description,
            images,
        });

        res.status(201).json(returnRequest);
    };

    /**
     * Customer retrieves their own return request history.
     * Maps exactly to: GET /api/returns (Customer authentication required)
     */
    const getMyReturns = async (req, res) =>
    {
        const customerId = req.user.id;

        const returns = await returnService.getCustomerReturns({ customerId });

        res.status(200).json(returns);
    };

    /**
     * Seller retrieves return requests assigned to their store.
     * Maps exactly to: GET /seller/returns (Seller authorization required)
     */
    const getSellerReturns = async (req, res) =>
    {
        const sellerId = req.user.id;

        const returns = await returnService.getSellerReturns({ sellerId });

        res.status(200).json(returns);
    };

    /**
     * Seller approves a pending return request.
     * Maps exactly to: PATCH /seller/returns/:returnId/approve (Seller authorization required)
     */
    const approveReturn = async (req, res) =>
    {
        const { returnId } = req.params;
        const sellerId = req.user.id;
        const { sellerNote } = req.body;

        const updated = await returnService.approveReturn({
            returnId,
            sellerId,
            sellerNote,
        });

        res.status(200).json(updated);
    };

    /**
     * Seller rejects a pending return request.
     * Maps exactly to: PATCH /seller/returns/:returnId/reject (Seller authorization required)
     */
    const rejectReturn = async (req, res) =>
    {
        const { returnId } = req.params;
        const sellerId = req.user.id;
        const { sellerNote } = req.body;

        const updated = await returnService.rejectReturn({
            returnId,
            sellerId,
            sellerNote,
        });

        res.status(200).json(updated);
    };

    /**
     * Seller confirms receipt of returned item and triggers inventory restock.
     * Maps exactly to: PATCH /seller/returns/:returnId/receive (Seller authorization required)
     */
    const markItemReceived = async (req, res) =>
    {
        const { returnId } = req.params;
        const sellerId = req.user.id;

        const updated = await returnService.markItemReceived({
            returnId,
            sellerId,
        });

        res.status(200).json(updated);
    };

    /**
     * Processes refund for a received return request.
     * Maps exactly to: PATCH /seller/returns/:returnId/refund (Seller/Admin authorization required)
     */
    const processRefund = async (req, res) =>
    {
        const { returnId } = req.params;

        const result = await returnService.processRefund({ returnId });

        res.status(200).json(result);
    };

    return Object.freeze({
        requestReturn,
        getMyReturns,
        getSellerReturns,
        approveReturn,
        rejectReturn,
        markItemReceived,
        processRefund,
    });
};
