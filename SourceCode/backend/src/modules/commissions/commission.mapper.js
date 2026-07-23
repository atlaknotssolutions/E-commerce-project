export const mapCommission = (commission) => {
    if (!commission) return null;
    return {
        id: commission._id,
        order: commission.order ? {
            id: commission.order._id || commission.order,
            orderId: commission.order.orderId || commission.orderId,
        } : { id: commission.order, orderId: commission.orderId },
        seller: commission.seller ? {
            id: commission.seller._id || commission.seller,
            companyName: commission.seller.companyName || undefined,
            email: commission.seller.email || undefined,
        } : { id: commission.seller },
        customer: commission.customer ? {
            id: commission.customer._id || commission.customer,
            fullName: commission.customer.fullName || undefined,
            email: commission.customer.email || undefined,
        } : { id: commission.customer },
        orderId: commission.orderId,
        orderAmount: commission.orderAmount,
        commissionPercentage: commission.commissionPercentage,
        commissionAmount: commission.commissionAmount,
        gstPercentage: commission.gstPercentage,
        gstAmount: commission.gstAmount,
        sellerAmount: commission.sellerAmount,
        currency: commission.currency,
        status: commission.status,
        calculatedAt: commission.calculatedAt,
        createdAt: commission.createdAt,
        updatedAt: commission.updatedAt,
    };
};

export const mapCommissions = (commissions) => {
    if (!commissions || !Array.isArray(commissions)) return [];
    return commissions.map(mapCommission);
};
