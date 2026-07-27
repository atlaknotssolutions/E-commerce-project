/**
 * Maps a ReturnRequest reference inside a Refund into a frontend-friendly DTO.
 * Handles both populated (object) and non-populated (ObjectId string) values.
 */
const mapReturnRequestRef = (returnRequest) =>
{
    if (!returnRequest) return null;

    if (typeof returnRequest === "object" && returnRequest._id)
    {
        return {
            id: returnRequest._id.toString(),
            returnId: returnRequest.returnId,
            returnStatus: returnRequest.returnStatus,
            refundAmount: returnRequest.refundAmount,
            reason: returnRequest.reason,
            customer: returnRequest.customer
                ? {
                    id: returnRequest.customer._id?.toString() || returnRequest.customer.toString(),
                    fullName: returnRequest.customer.fullName,
                    email: returnRequest.customer.email,
                    mobile: returnRequest.customer.mobile,
                }
                : null,
            seller: returnRequest.seller
                ? {
                    id: returnRequest.seller._id?.toString() || returnRequest.seller.toString(),
                    sellerName: returnRequest.seller.sellerName,
                    email: returnRequest.seller.email,
                }
                : null,
            order: returnRequest.order
                ? {
                    id: returnRequest.order._id?.toString() || returnRequest.order.toString(),
                    orderId: returnRequest.order.orderId,
                    orderStatus: returnRequest.order.orderStatus,
                }
                : null,
            product: returnRequest.productId
                ? {
                    id: returnRequest.productId._id?.toString() || returnRequest.productId.toString(),
                    title: returnRequest.productId.title,
                    images: returnRequest.productId.images || [],
                    sellingPrice: returnRequest.productId.sellingPrice,
                }
                : null,
        };
    }

    return { id: returnRequest.toString() };
};

/**
 * Maps an Order reference into a frontend-friendly DTO.
 */
const mapOrderRef = (order) =>
{
    if (!order) return null;

    if (typeof order === "object" && order._id)
    {
        return {
            id: order._id.toString(),
            orderId: order.orderId,
            orderStatus: order.orderStatus,
            totalSellingPrice: order.totalSellingPrice,
        };
    }

    return { id: order.toString() };
};

/**
 * Maps a PaymentOrder reference into a frontend-friendly DTO.
 */
const mapPaymentOrderRef = (paymentOrder) =>
{
    if (!paymentOrder) return null;

    if (typeof paymentOrder === "object" && paymentOrder._id)
    {
        return {
            id: paymentOrder._id.toString(),
            amount: paymentOrder.amount,
            status: paymentOrder.status,
            paymentMethod: paymentOrder.paymentMethod,
            providerPaymentId: paymentOrder.providerPaymentId,
        };
    }

    return { id: paymentOrder.toString() };
};

/**
 * Maps a Refund document into a frontend-friendly DTO.
 * Normalizes all populated references and strips MongoDB internals.
 */
export const mapRefund = (refund) =>
{
    if (!refund) return null;

    return {
        id: refund._id?.toString(),
        returnRequest: mapReturnRequestRef(refund.returnRequestId),
        order: mapOrderRef(refund.orderId),
        paymentOrder: mapPaymentOrderRef(refund.paymentOrderId),
        amount: refund.amount,
        status: refund.status,
        method: refund.method,
        providerRefundId: refund.providerRefundId,
        gateway: refund.gateway ? {
            provider: refund.gateway,
            status: refund.gatewayStatus || null,
            providerRefundId: refund.providerRefundId || null,
        } : null,
        processedAt: refund.processedAt || null,
        createdAt: refund.createdAt,
        updatedAt: refund.updatedAt,
    };
};

/**
 * Maps an array of Refund documents into frontend-friendly DTOs.
 */
export const mapRefunds = (refunds = []) => refunds.map(mapRefund);
