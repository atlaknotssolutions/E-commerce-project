import { Seller } from "./sellerTypes";

export type AttributeType = 'text' | 'number' | 'select' | 'multi_select' | 'boolean' | 'color';

export interface Category {
    id?: string;
    name: string;
    categoryId: string;
    parentCategory?: Category;
    level: number;
    supportedAttributes?: AttributeDefinition[];
  }

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

export interface ProductImage {
    url: string;
    publicId?: string;
    isPrimary?: boolean;
  }

export interface DynamicAttribute {
    name: string;
    value: string;
  }

export interface VariantAttributes {
    [key: string]: string | { key: string; value: string }[] | DynamicAttribute[] | undefined;
    color?: string;
    size?: string;
    storage?: string;
    ram?: string;
    custom?: { key: string; value: string }[];
    dynamic?: DynamicAttribute[];
  }

export interface ProductVariant {
    id?: string;
    sku: string;
    attributes: VariantAttributes;
    price: number;
    mrpPrice: number;
    discountPercent?: number;
    quantity: number;
    images: ProductImage[];
    weight?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  }

export interface Product {
    id?: string;
    title: string;
    description: string;
    mrpPrice: number;
    sellingPrice: number;
    discountPercent?: number;
    quantity?: number;
    color: string;
    images: ProductImage[];
    variants: ProductVariant[];
    numRatings?: number;
    category?: Category;
    seller: Seller;
    createdAt?: Date;
    sizes: string[];
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    variantCount?: number;
  }

export interface FilterAttribute {
    name: string;
    code: string;
    type: AttributeType;
    displayOrder?: number;
    values: string[];
  }

export interface FilterMetadata {
    attributes: FilterAttribute[];
    priceRange: { min: number; max: number };
    brands: string[];
  }