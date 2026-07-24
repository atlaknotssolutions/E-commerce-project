export type AttributeType = 'text' | 'number' | 'select' | 'multi_select' | 'boolean' | 'color';

export interface AttributeDefinition {
    id: string;
    name: string;
    code: string;
    type: AttributeType;
    required?: boolean;
    options?: string[];
    sortable?: boolean;
    filterable?: boolean;
    variantAttribute?: boolean;
    displayOrder?: number;
    active?: boolean;
}

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

    supportedAttributes?: AttributeDefinition[];

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

    supportedAttributes?: AttributeDefinition[];
}

export interface UpdateCategoryPayload {
    id: string;

    name?: string;

    parentCategory?: string | null;

    description?: string;

    image?: string;

    isActive?: boolean;

    supportedAttributes?: AttributeDefinition[];
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