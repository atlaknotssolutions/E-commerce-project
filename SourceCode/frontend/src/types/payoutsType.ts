export interface Payout {
  id: string;
  seller: {
    id: string;
    companyName?: string;
    email?: string;
  };
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  requestedAt: string;
  processedAt?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  transactions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SellerBalance {
  netEarnings: number;
  activeCommissions: number;
  lockedPayouts: number;
  availableBalance: number;
}

export interface PayoutRequest {
  amount: number;
}

export interface PayoutStats {
  totalPayouts: number;
  totalAmount: number;
  totalCompleted: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
}
