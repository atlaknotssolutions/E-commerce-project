// Product Moderation Types

export interface ProductModeration {
    _id: string;
    title: string;
    description: string;
    mrpPrice: number;
    sellingPrice: number;
    discountPercent: number;
    quantity: number;
    color: string | null;
    brand: string | null;
    approvalStatus: string;
    publishStatus: string;
    isFeatured: boolean;
    featuredAt: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    images: Array<{ url: string; publicId?: string; isPrimary?: boolean }>;
    category: {
        _id: string;
        name?: string;
        categoryId?: string;
    } | null;
    seller: {
        _id: string;
        sellerName?: string;
        email?: string;
        businessDetails?: {
            businessName?: string;
        };
    } | null;
    moderationHistory: ProductModerationHistoryEntry[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductModerationHistoryEntry {
    action: string;
    adminId: string;
    reason: string | null;
    previousStatus: string | null;
    newStatus: string | null;
    timestamp: string;
}

export interface ProductModerationPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ProductModerationListResponse {
    success: boolean;
    data: ProductModeration[];
    pagination: ProductModerationPagination;
}

export interface ProductDetailResponse {
    success: boolean;
    data: ProductModeration;
}

export interface ProductModerationStats {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    DRAFT: number;
    PUBLISHED: number;
    UNPUBLISHED: number;
    featured: number;
    totalProducts: number;
}

export interface ProductModerationStatsResponse {
    success: boolean;
    data: ProductModerationStats;
}

export interface ProductActionResponse {
    success: boolean;
    data: ProductModeration;
}

export interface ProductModerationState {
    pendingProducts: ProductModeration[];
    approvedProducts: ProductModeration[];
    rejectedProducts: ProductModeration[];
    publishedProducts: ProductModeration[];
    unpublishedProducts: ProductModeration[];
    featuredProducts: ProductModeration[];
    selectedProduct: ProductModeration | null;
    stats: ProductModerationStats | null;
    pendingPagination: ProductModerationPagination | null;
    approvedPagination: ProductModerationPagination | null;
    rejectedPagination: ProductModerationPagination | null;
    publishedPagination: ProductModerationPagination | null;
    unpublishedPagination: ProductModerationPagination | null;
    featuredPagination: ProductModerationPagination | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    actionSuccess: boolean;
}
