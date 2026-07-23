import { Product } from "./productTypes";
import { User } from "./userTypes";

export interface CartItem {
    id: string;
    cart?: Cart;
    product: Product;
    variantId: string | null;
    size: string;
    quantity: number;
    mrpPrice: number;
    sellingPrice: number;
    userId: string;
}


export interface Cart {
    id: string;
    user: User;
    cartItems: CartItem[];
    totalSellingPrice: number;
    totalItem: number;
    totalMrpPrice: number;
    discount: number;
    couponCode: string | null;
    couponPrice: number;
}
