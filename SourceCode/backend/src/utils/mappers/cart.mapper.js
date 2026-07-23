export const toCartItemDto = (item) => ({
    id: item._id?.toString(),
    product: item.product,
    variantId: item.variantId ? item.variantId.toString() : null,
    size: item.size,
    quantity: item.quantity,
    mrpPrice: item.mrpPrice,
    sellingPrice: item.sellingPrice,
    userId: item.userId,
});

export const toCartDto = (cart) => ({
    id: cart._id?.toString(),
    user: cart.user,

    cartItems: (cart.items || []).map(toCartItemDto),

    totalSellingPrice: cart.totalSellingPrice,
    totalItem: cart.totalItem,
    totalMrpPrice: cart.totalMrpPrice,
    discount: cart.discount,
    couponCode: cart.couponCode ?? null,
    couponPrice: cart.couponPrice ?? 0,
});