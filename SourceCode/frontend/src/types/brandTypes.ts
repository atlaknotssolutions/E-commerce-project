export interface Brand {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    bannerImage?: string;
    website?: string;
    isActive: boolean;
    isFeatured: boolean;
    displayOrder?: number;
    categoryId?: string[];
    metaTitle?: string;
    metaDescription?: string;
    isDeleted?: boolean;
    deletedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BrandRequest {
    _id: string;
    seller: {
        _id: string;
        name?: string;
        email?: string;
    };
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    categoryId?: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string | null;
    approvedBy?: {
        _id: string;
        name?: string;
        email?: string;
    } | null;
    approvedAt?: string | null;
    rejectedBy?: {
        _id: string;
        name?: string;
        email?: string;
    } | null;
    rejectedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BrandStats {
    totalBrands: number;
    activeBrands: number;
    featuredBrands: number;
    deletedBrands: number;
}

export interface CreateBrandPayload {
    name: string;
    description?: string;
    logo?: string;
    bannerImage?: string;
    website?: string;
    categoryId?: string[];
    metaTitle?: string;
    metaDescription?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
}

export interface UpdateBrandPayload {
    name?: string;
    description?: string;
    logo?: string;
    bannerImage?: string;
    website?: string;
    categoryId?: string[];
    metaTitle?: string;
    metaDescription?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
}

export interface CreateBrandRequestPayload {
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    categoryId?: string;
}

export interface AdminBrandState {
    brands: Brand[];
    currentBrand: Brand | null;
    stats: BrandStats | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AdminBrandRequestState {
    requests: BrandRequest[];
    pendingCount: number;
    loading: boolean;
    error: string | null;
}

export interface SellerBrandRequestState {
    requests: BrandRequest[];
    loading: boolean;
    error: string | null;
    requestsLoaded: boolean;
}

export interface PublicBrandState {
    brands: Brand[];
    featuredBrands: Brand[];
    loading: boolean;
    error: string | null;
}
