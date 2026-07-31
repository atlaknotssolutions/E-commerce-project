export const ensureNonNegative = (value, label = 'Value') =>
{
    if (Number(value) < 0)
    {
        return {
            valid: false,
            message: `${label} must not be negative. Got ${value}.`,
        };
    }
    return { valid: true };
};

export const validateSettlementResult = (settlement) =>
{
    if (!settlement) return { valid: false, errors: [{ code: 'NULL_SETTLEMENT', message: 'Settlement result is null.' }] };

    const errors = [];

    const checks = [
        { value: settlement.commissionAmount, label: 'Commission amount' },
        { value: settlement.gstAmount, label: 'GST amount' },
        { value: settlement.settlementAmount, label: 'Settlement amount' },
        { value: settlement.netSellerEarnings, label: 'Net seller earnings' },
        { value: settlement.sellerContribution, label: 'Seller contribution' },
        { value: settlement.platformContribution, label: 'Platform contribution' },
    ];

    for (const check of checks)
    {
        const result = ensureNonNegative(check.value, check.label);
        if (!result.valid) errors.push({ code: 'NEGATIVE_VALUE', ...result });
    }

    if (settlement.commissionPercentage < 0 || settlement.commissionPercentage > 100)
    {
        errors.push({ code: 'INVALID_COMMISSION_PERCENTAGE', message: `Commission percentage ${settlement.commissionPercentage} is out of range.` });
    }

    if (settlement.gstPercentage < 0 || settlement.gstPercentage > 100)
    {
        errors.push({ code: 'INVALID_GST_PERCENTAGE', message: `GST percentage ${settlement.gstPercentage} is out of range.` });
    }

    if (settlement.settlementAmount > settlement.sellerEarningsBase)
    {
        errors.push({ code: 'SETTLEMENT_EXCEEDS_EARNINGS', message: `Settlement ${settlement.settlementAmount} exceeds earnings base ${settlement.sellerEarningsBase}.` });
    }

    if (settlement.commissionAmount > settlement.commissionBase)
    {
        errors.push({ code: 'COMMISSION_EXCEEDS_BASE', message: `Commission ${settlement.commissionAmount} exceeds base ${settlement.commissionBase}.` });
    }

    return { valid: errors.length === 0, errors };
};

export const validateRefundEligibility = (refundAmount, orderItem) =>
{
    if (!orderItem) return { valid: false, code: 'ORDER_ITEM_NOT_FOUND', message: 'Order item not found.' };

    const errors = [];

    const itemPrice = Number(orderItem.sellingPrice) || 0;
    if (refundAmount < 0)
    {
        errors.push({ code: 'NEGATIVE_REFUND', message: 'Refund amount cannot be negative.' });
    }

    if (refundAmount > itemPrice)
    {
        errors.push({ code: 'REFUND_EXCEEDS_ITEM_PRICE', message: `Refund ₹${refundAmount} exceeds item price ₹${itemPrice}.` });
    }

    if (refundAmount === 0)
    {
        errors.push({ code: 'ZERO_REFUND', message: 'Refund amount is zero.' });
    }

    return { valid: errors.length === 0, errors };
};
