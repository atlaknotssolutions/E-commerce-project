export type CommissionStatus = 'CALCULATED' | 'APPROVED' | 'SETTLED' | 'CANCELLED';

export interface Commission {
    _id: string;
    id: string;
    order: {
        id: string;
        orderId: string;
        totalSellingPrice?: number;
    };
    seller: {
        id: string;
        companyName?: string;
        email?: string;
    };
    customer: {
        id: string;
        fullName?: string;
        email?: string;
    };
    orderId: string;
    orderAmount: number;
    commissionPercentage: number;
    commissionAmount: number;
    gstPercentage: number;
    gstAmount: number;
    sellerAmount: number;
    currency: string;
    status: CommissionStatus;
    calculatedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CommissionPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CommissionStatistics {
    totalCommissions: number;
    totalOrderAmount: number;
    totalCommissionAmount: number;
    totalGstAmount: number;
    totalSellerAmount: number;
    statusCounts: Record<string, number>;
}

export interface CommissionFilters {
    status: string;
    seller?: string;
    search: string;
    startDate: string | null;
    endDate: string | null;
    page: number;
    limit: number;
}

export interface AdminCommissionState {
    commissions: Commission[];
    selectedCommission: Commission | null;
    statistics: CommissionStatistics | null;
    pagination: CommissionPagination | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    actionSuccess: boolean;
}

export interface SellerCommissionState {
    commissions: Commission[];
    selectedCommission: Commission | null;
    statistics: CommissionStatistics | null;
    pagination: CommissionPagination | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
}

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
    CALCULATED: 'Calculated',
    APPROVED: 'Approved',
    SETTLED: 'Settled',
    CANCELLED: 'Cancelled',
};
