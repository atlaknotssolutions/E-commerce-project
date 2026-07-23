export interface CategoryRequest {
    _id: string;
    seller: {
        _id: string;
        sellerName: string;
        email: string;
    };
    requestedName: string;
    parentCategory?: {
        _id: string;
        name: string;
        level: number;
    } | null;
    requestedLevel: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string | null;
    approvedBy?: {
        _id: string;
        name: string;
        email: string;
    } | null;
    approvedAt?: string | null;
    rejectedBy?: {
        _id: string;
        name: string;
        email: string;
    } | null;
    rejectedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryRequestPayload {
    requestedName: string;
    parentCategory?: string;
    reason?: string;
}

export interface AdminCategoryRequestState {
    requests: CategoryRequest[];
    loading: boolean;
    error: string | null;
}

export interface SellerCategoryRequestState {
    requests: CategoryRequest[];
    loading: boolean;
    error: string | null;
    requestsLoaded: boolean;
}
