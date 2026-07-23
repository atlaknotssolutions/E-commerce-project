// src/types/addressTypes.ts
export interface Address {
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

export enum UserRole {
    ROLE_CUSTOMER = 'ROLE_CUSTOMER',
    ROLE_ADMIN = 'ROLE_ADMIN',
    ROLE_SELLER = 'ROLE_SELLER',
}

export interface User {
    id?: string;
    password?: string;
    email: string;
    fullName: string;
    mobile?: string;
    role: UserRole;
    profileImage?: string | null;
    addresses?: Address[];
}

export interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;
    profileUpdated: boolean;
}