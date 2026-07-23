import { Seller } from "./sellerTypes";

export interface Category {
    id?: string;
    name: string;
    categoryId: string;
    parentCategory?: Category;
    level: number;
  }

export interface ProductImage {
    url: string;
    publicId?: string;
    isPrimary?: boolean;
  }

export interface VariantAttributes {
    color?: string;
    size?: string;
    storage?: string;
    ram?: string;
    custom?: { key: string; value: string }[];
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
  }