/**
 * Maps an Order reference into a frontend-friendly DTO.
 * Handles both populated (object) and non-populated (ObjectId string) values.
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
        };
    }

    return { id: order.toString() };
};

/**
 * Maps a Customer/User reference into a frontend-friendly DTO.
 * Handles both populated (object) and non-populated (ObjectId string) values.
 */
const mapCustomerRef = (customer) =>
{
    if (!customer) return null;

    if (typeof customer === "object" && customer._id)
    {
        return {
            id: customer._id.toString(),
            fullName: customer.fullName,
            email: customer.email,
            mobile: customer.mobile,
        };
    }

    return { id: customer.toString() };
};

/**
 * Maps a Seller reference into a frontend-friendly DTO.
 * Handles both populated (object) and non-populated (ObjectId string) values.
 */
const mapSellerRef = (seller) =>
{
    if (!seller) return null;

    if (typeof seller === "object" && seller._id)
    {
        return {
            id: seller._id.toString(),
            sellerName: seller.sellerName,
            email: seller.email,
            mobile: seller.mobile,
        };
    }

    return { id: seller.toString() };
};

/**
 * Maps a Product reference into a frontend-friendly DTO.
 * Handles both populated (object) and non-populated (ObjectId string) values.
 */
const mapProductRef = (product) =>
{
    if (!product) return null;

    if (typeof product === "object" && product._id)
    {
        return {
            id: product._id.toString(),
            title: product.title,
            images: product.images || [],
            sellingPrice: product.sellingPrice,
        };
    }

    return { id: product.toString() };
};

/**
 * Maps a ReturnRequest document into a frontend-friendly DTO.
 * Normalizes all populated references and strips MongoDB internals.
 */
export const mapReturn = (returnRequest) =>
{
    if (!returnRequest) return null;

    return {
        id: returnRequest._id?.toString(),
        returnId: returnRequest.returnId,
        order: mapOrderRef(returnRequest.order),
        customer: mapCustomerRef(returnRequest.customer),
        seller: mapSellerRef(returnRequest.seller),
        product: mapProductRef(returnRequest.productId),
        orderItemId: returnRequest.orderItemId?.toString(),
        reason: returnRequest.reason,
        description: returnRequest.description,
        images: returnRequest.images || [],
        refundAmount: returnRequest.refundAmount,
        returnStatus: returnRequest.returnStatus,
        sellerNote: returnRequest.sellerNote,
        requestedAt: returnRequest.requestedAt,
        resolvedAt: returnRequest.resolvedAt,
        returnHistory: returnRequest.returnHistory || [],
        createdAt: returnRequest.createdAt,
        updatedAt: returnRequest.updatedAt,
    };
};

/**
 * Maps an array of ReturnRequest documents into frontend-friendly DTOs.
 */
export const mapReturns = (returns = []) => returns.map(mapReturn);
