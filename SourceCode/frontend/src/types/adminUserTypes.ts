// Admin User Management Types

export interface AdminUser {
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
    createdAt: string;
    updatedAt: string;
}

export interface AdminUserAddress {
    id?: string;
    name: string;
    mobile: string;
    pinCode: string;
    address: string;
    locality: string;
    city: string;
    state: string;
    isDefault?: boolean;
}

export interface AdminUserCounts {
    ROLE_CUSTOMER: number;
    ROLE_SELLER: number;
    ROLE_ADMIN: number;
    total: number;
}

export interface AdminUserPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AdminUserListResponse {
    success: boolean;
    data: AdminUser[];
    pagination: AdminUserPagination;
}

export interface AdminUserDetailResponse {
    success: boolean;
    data: AdminUser;
}

export interface AdminUserCountsResponse {
    success: boolean;
    data: AdminUserCounts;
}

export interface AdminSellerStatusResponse {
    success: boolean;
    data: {
        sellerId: string;
        accountStatus: string;
    };
}

export interface AdminUserState {
    users: AdminUser[];
    selectedUser: AdminUser | null;
    counts: AdminUserCounts | null;
    pagination: AdminUserPagination | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    statusUpdated: boolean;
}
