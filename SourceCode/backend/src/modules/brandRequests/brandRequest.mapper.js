export const mapBrandRequest = (request) =>
{
    if (!request) return null;
    return {
        id: request._id,
        seller: request.seller ? {
            id: request.seller._id || request.seller,
            name: request.seller.name || undefined,
            email: request.seller.email || undefined,
        } : { id: request.seller },
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
