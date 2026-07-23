export interface Category {
    _id: string;

    name: string;

    categoryId: string;

    level: number;

    parentCategory?: string | null;

    description?: string;

    image?: string;

    isActive?: boolean;

    children?: Category[];

    createdAt?: string;

    updatedAt?: string;
}

export interface CategoryTreeResponse {
    success: boolean;
    message: string;
    data: Category[];
}

export interface CategoryListResponse {
    success: boolean;
    message: string;
    data: Category[];
}

export interface CreateCategoryPayload {
    name: string;

    parentCategory?: string;

    description?: string;

    image?: string;
}

export interface UpdateCategoryPayload {
    id: string;

    name?: string;

    parentCategory?: string | null;

    description?: string;

    image?: string;

    isActive?: boolean;
}

export interface AdminCategoryState {
    categories: Category[];

    categoryTree: Category[];

    loading: boolean;

    error: string | null;

    success: boolean;

    treeLoaded: boolean;
}


export interface CategoryTableProps {
    categories: Category[];
}


export interface CreateCategoryFormProps {
    open: boolean;
    onClose: () => void;
}