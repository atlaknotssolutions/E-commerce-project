export const mapPayout = (payout) => {
    if (!payout) return null;
    return {
        id: payout._id,
        seller: payout.seller ? {
            id: payout.seller._id || payout.seller,
            companyName: payout.seller.sellerName || payout.seller.businessDetails?.businessName || undefined,
            email: payout.seller.email || undefined,
        } : { id: payout.seller },
        amount: payout.amount,
        status: payout.status,
        requestedAt: payout.requestedAt,
        processedAt: payout.processedAt || null,
        approvedBy: payout.approvedBy ? {
            id: payout.approvedBy._id || payout.approvedBy,
            fullName: payout.approvedBy.fullName || undefined,
            email: payout.approvedBy.email || undefined,
        } : null,
        rejectionReason: payout.rejectionReason || null,
        transactions: payout.transactions || [],
        gateway: payout.gateway ? {
            provider: payout.gateway,
            status: payout.gatewayStatus || null,
            referenceId: payout.gatewayPayoutId || null,
            businessReferenceId: payout.referenceId || null,
        } : null,
        createdAt: payout.createdAt,
        updatedAt: payout.updatedAt,
    };
};

export const mapPayouts = (payouts) => {
    if (!payouts || !Array.isArray(payouts)) return [];
    return payouts.map(mapPayout);
};
