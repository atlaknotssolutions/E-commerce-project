export const mapBrandRequest = (request) =>
{
    if (!request) return null;
    const sellerRef = request.requestedBy || request.seller;
    return {
        id: request._id,
        seller: sellerRef ? {
            id: sellerRef._id || sellerRef,
            name: sellerRef.sellerName || sellerRef.name || undefined,
            email: sellerRef.email || undefined,
            businessName: sellerRef.businessDetails?.businessName || undefined,
        } : null,
        name: request.name,
        description: request.description || '',
        logo: request.logo || '',
        website: request.website || '',
        categoryId: request.categoryId || null,
        status: request.status,
        rejectionReason: request.rejectionReason || null,
        approvedBy: request.approvedBy || null,
        approvedAt: request.approvedAt || null,
        rejectedBy: request.rejectedBy || null,
        rejectedAt: request.rejectedAt || null,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
    };
};

export const mapBrandRequests = (requests) =>
{
    if (!requests || !Array.isArray(requests)) return [];
    return requests.map(mapBrandRequest);
};
