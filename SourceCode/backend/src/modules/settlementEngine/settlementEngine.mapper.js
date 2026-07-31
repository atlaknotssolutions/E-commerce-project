export const mapLedgerEntry = (entry) => {
    if (!entry) return null;
    return {
        _id: entry._id,
        order: entry.order || null,
        seller: entry.seller || null,
        type: entry.type,
        direction: entry.direction,
        amount: entry.amount,
        runningBalance: entry.runningBalance,
        referenceId: entry.referenceId,
        description: entry.description,
        metadata: entry.metadata,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
    };
};

export const mapLedgerEntries = (entries) => {
    if (!entries) return [];
    return entries.map(mapLedgerEntry);
};
