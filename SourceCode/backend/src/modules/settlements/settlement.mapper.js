export const mapSettlement = (settlement) =>
{
    if (!settlement) return null;
    return {
        _id: settlement._id,
        payout: settlement.payout || null,
        seller: settlement.seller || null,
        type: settlement.type,
        amount: settlement.amount,
        status: settlement.status,
        gatewaySettlementId: settlement.gatewaySettlementId,
        gatewayPayoutId: settlement.gatewayPayoutId,
        referenceId: settlement.referenceId,
        utr: settlement.utr,
        bankAccount: settlement.bankAccount ? {
            accountHolderName: settlement.bankAccount.accountHolderName,
            accountNumber: maskAccountNumber(settlement.bankAccount.accountNumber),
            ifsc: settlement.bankAccount.ifsc,
        } : null,
        settledAt: settlement.settledAt,
        metadata: settlement.metadata,
        createdAt: settlement.createdAt,
        updatedAt: settlement.updatedAt,
    };
};

export const mapSettlements = (settlements) =>
{
    if (!settlements) return [];
    return settlements.map(mapSettlement);
};

const maskAccountNumber = (accountNumber) =>
{
    if (!accountNumber) return null;
    if (accountNumber.length <= 4) return accountNumber;
    return `XXXX${accountNumber.slice(-4)}`;
};
