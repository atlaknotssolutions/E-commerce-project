export type AdminPayoutStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface AdminPayout {
    id: string;
    seller: {
        id: string;
        companyName?: string;
        email?: string;
    };
    amount: number;
    status: AdminPayoutStatus;
    requestedAt: string;
    processedAt?: string | null;
    approvedBy?: { id: string; fullName?: string; email?: string } | null;
    rejectionReason?: string | null;
    transactions: string[];
    createdAt: string;
    updatedAt: string;
}

export interface AdminPayoutPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AdminPayoutStatistics {
    totalPayouts: number;
    totalAmount: number;
    totalCompleted: number;
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
}

export interface AdminPayoutFilters {
    status: string;
    seller?: string;
    startDate: string | null;
    endDate: string | null;
    page: number;
    limit: number;
}

export interface AdminPayoutState {
    payouts: AdminPayout[];
    selectedPayout: AdminPayout | null;
    statistics: AdminPayoutStatistics | null;
    pagination: AdminPayoutPagination | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    actionSuccess: boolean;
}

export const ADMIN_PAYOUT_STATUS_LABELS: Record<AdminPayoutStatus, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
};
