export interface LedgerEntry {
  _id: string;
  order: { _id: string; orderId: string; totalSellingPrice: number; orderStatus: string } | null;
  seller: string;
  type: 'ORDER_PLACED' | 'COMMISSION_CALCULATED' | 'SETTLEMENT_COMPLETED' | 'PAYOUT_INITIATED' | 'PAYOUT_COMPLETED' | 'REFUND_PROCESSED' | 'CANCELLATION' | 'ADJUSTMENT';
  direction: 'CREDIT' | 'DEBIT';
  amount: number;
  runningBalance: number;
  referenceId: string | null;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerStats {
  totalCredits: number;
  totalDebits: number;
  entryCount: number;
}

export interface SellerSettlement {
  _id: string;
  payout: string | null;
  seller: { _id: string; sellerName?: string } | string | null;
  type: 'PAYOUT' | 'REFUND' | 'COMMISSION' | 'ADJUSTMENT';
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  gatewaySettlementId: string | null;
  gatewayPayoutId: string | null;
  referenceId: string | null;
  utr: string | null;
  bankAccount: { accountHolderName: string; accountNumber: string; ifsc: string } | null;
  settledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SellerSettlementStats {
  totalSettlements: number;
  totalAmount: number;
  totalCompleted: number;
  totalPending: number;
  totalFailed: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WalletState {
  ledgerEntries: LedgerEntry[];
  ledgerStats: LedgerStats | null;
  ledgerLoading: boolean;
  ledgerError: string | null;
  settlements: SellerSettlement[];
  settlementStats: SellerSettlementStats | null;
  settlementLoading: boolean;
  settlementError: string | null;
  pagination: Pagination | null;
  ledgerRequestKey: string | null;
  ledgerStatsLoaded: boolean;
  settlementRequestKey: string | null;
  settlementStatsLoaded: boolean;
}
