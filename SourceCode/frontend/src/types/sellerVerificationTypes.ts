// Seller Verification Types

export interface SellerVerification {
    id: string;
    fullName: string;
    email: string;
    mobile: string | null;
    role: string;
    profileImage: string | null;
    sellerId: string | null;
    businessName: string | null;
    gstNumber: string | null;
    accountStatus: string | null;
    isEmailVerified: boolean | null;
    verificationStatus: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SellerVerificationPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SellerVerificationListResponse {
    success: boolean;
    data: SellerVerification[];
    pagination: SellerVerificationPagination;
}

export interface SellerDetailResponse {
    success: boolean;
    data: SellerVerification;
}

export interface SellerVerificationStats {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    SELLER_SUSPENDED: number;
    totalSellers: number;
}

export interface SellerVerificationStatsResponse {
    success: boolean;
    data: SellerVerificationStats;
}

export interface SellerActionResponse {
    success: boolean;
    data: SellerVerification;
}

export interface SellerVerificationState {
    pendingSellers: SellerVerification[];
    approvedSellers: SellerVerification[];
    rejectedSellers: SellerVerification[];
    suspendedSellers: SellerVerification[];
    selectedSeller: SellerVerification | null;
    stats: SellerVerificationStats | null;
    pendingPagination: SellerVerificationPagination | null;
    approvedPagination: SellerVerificationPagination | null;
    rejectedPagination: SellerVerificationPagination | null;
    suspendedPagination: SellerVerificationPagination | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    actionSuccess: boolean;
}
