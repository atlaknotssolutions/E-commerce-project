// src/types/seller.ts

export interface PickupAddress {
    name: string;
    mobile: string;
    pincode: string;
    address: string;
    locality: string;
    city: string;
    state: string;
}

export interface BankDetails {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
}

export interface BusinessDetails {
    businessName: string;
}

export interface Seller {
    id?:string;
    mobile: string;
    otp: string;
    gstin: string;
    pickupAddress: PickupAddress;
    bankDetails: BankDetails;
    sellerName: string;
    email: string;
    avatar?: string | null;
    businessDetails: BusinessDetails;
    password: string;
    accountStatus?:string;
}

export interface SellerReport {
    id: string;
    seller: Seller;
    totalEarnings: number;
    totalSales: number;
    totalRefunds: number;
    totalTax: number;
    netEarnings: number;
    totalOrders: number;
    canceledOrders: number;
    totalTransactions: number;
  }
  