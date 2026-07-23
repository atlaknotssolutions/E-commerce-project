export const mapOrderItem = (item) =>
{
    if (!item) return null;

    return {
        ...item,

        id: item._id?.toString(),

        product: item.product
            ? {
                ...item.product,
                id: item.product._id?.toString(),
            }
            : null,
    };
};

export const mapOrder = (order) =>
{
    if (!order) return null;

    return {
        ...order,

        id: order._id?.toString(),

        shippingAddress: {
            ...order.shippingAddress,
            address: order.shippingAddress?.streetAddress,
        },

        orderItems: (order.orderItems || []).map(mapOrderItem),
    };
};

export const mapOrders = (orders = []) => orders.map(mapOrder);