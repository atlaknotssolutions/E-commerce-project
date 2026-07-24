import { api } from "../Config/Api";
import {
    Brand,
    BrandRequest,
    BrandStats,
    CreateBrandPayload,
    UpdateBrandPayload,
    CreateBrandRequestPayload,
} from "../types/brandTypes";

const BRAND_API = "/api/brands";
const BRAND_REQUEST_API = "/admin/brand-requests";
const SELLER_BRAND_REQUEST_API = "/seller/brand-requests";

// ==========================================
// ADMIN BRAND OPERATIONS
// ==========================================

export const fetchAllBrands = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isDeleted?: boolean;
    sortBy?: string;
    sortOrder?: string;
}) => {
    const response = await api.get(BRAND_API, { params });
    return response.data;
};

export const fetchBrandById = async (id: string) => {
    const response = await api.get(`${BRAND_API}/${id}`);
    return response.data;
};

export const fetchBrandBySlug = async (slug: string) => {
    const response = await api.get(`${BRAND_API}/slug/${slug}`);
    return response.data;
};

export const createBrand = async (payload: CreateBrandPayload) => {
    const response = await api.post(BRAND_API, payload);
    return response.data;
};

export const createBrandWithFiles = async (
    formData: FormData
) => {
    const response = await api.post(BRAND_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const updateBrand = async (id: string, payload: UpdateBrandPayload) => {
    const response = await api.put(`${BRAND_API}/${id}`, payload);
    return response.data;
};

export const updateBrandWithFiles = async (
    id: string,
    formData: FormData
) => {
    const response = await api.put(`${BRAND_API}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const updateBrandStatus = async (id: string, isActive: boolean) => {
    const response = await api.patch(`${BRAND_API}/${id}/status`, { isActive });
    return response.data;
};

export const updateBrandFeatured = async (id: string, isFeatured: boolean) => {
    const response = await api.patch(`${BRAND_API}/${id}/featured`, { isFeatured });
    return response.data;
};

export const updateBrandDisplayOrder = async (id: string, displayOrder: number) => {
    const response = await api.patch(`${BRAND_API}/${id}/display-order`, { displayOrder });
    return response.data;
};

export const deleteBrand = async (id: string) => {
    const response = await api.delete(`${BRAND_API}/${id}`);
    return response.data;
};

export const restoreBrand = async (id: string) => {
    const response = await api.patch(`${BRAND_API}/${id}/restore`);
    return response.data;
};

export const hardDeleteBrand = async (id: string) => {
    const response = await api.delete(`${BRAND_API}/${id}/hard`);
    return response.data;
};

export const searchBrands = async (params: {
    query: string;
    page?: number;
    limit?: number;
}) => {
    const response = await api.get(`${BRAND_API}/search`, { params });
    return response.data;
};

export const fetchBrandStats = async () => {
    const response = await api.get(`${BRAND_API}/admin/stats`);
    return response.data;
};

// ==========================================
// PUBLIC BRAND OPERATIONS
// ==========================================

export const fetchActiveBrands = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
}) => {
    const response = await api.get(`${BRAND_API}/active`, { params });
    return response.data;
};

export const fetchFeaturedBrands = async (limit?: number) => {
    const response = await api.get(`${BRAND_API}/featured`, {
        params: { limit },
    });
    return response.data;
};

// ==========================================
// ADMIN BRAND REQUEST OPERATIONS
// ==========================================

export const fetchAllBrandRequests = async (params?: {
    status?: string;
    search?: string;
}) => {
    const response = await api.get(BRAND_REQUEST_API, { params });
    return response.data;
};

export const fetchBrandRequestById = async (id: string) => {
    const response = await api.get(`${BRAND_REQUEST_API}/${id}`);
    return response.data;
};

export const approveBrandRequest = async (id: string) => {
    const response = await api.patch(`${BRAND_REQUEST_API}/${id}/approve`);
    return response.data;
};

export const rejectBrandRequest = async (id: string, rejectionReason?: string) => {
    const response = await api.patch(`${BRAND_REQUEST_API}/${id}/reject`, {
        rejectionReason,
    });
    return response.data;
};

export const fetchPendingBrandRequestCount = async () => {
    const response = await api.get(`${BRAND_REQUEST_API}/pending-count`);
    return response.data;
};

// ==========================================
// SELLER BRAND REQUEST OPERATIONS
// ==========================================

export const createBrandRequest = async (payload: CreateBrandRequestPayload) => {
    const response = await api.post(SELLER_BRAND_REQUEST_API, payload);
    return response.data;
};

export const fetchSellerBrandRequests = async () => {
    const response = await api.get(SELLER_BRAND_REQUEST_API);
    return response.data;
};
