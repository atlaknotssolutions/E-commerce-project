import { CartItem } from "../types/cartTypes"

/**
 * Calculates total selling price from cart items.
 * Preferred: use backend `cart.totalSellingPrice`.
 * This fallback is for display-only when cart object is partially loaded.
 */
export const sumCartItemSellingPrice = (items: CartItem[]): number =>
{
    return items.reduce((acc, item) => (item?.sellingPrice ?? 0) + acc, 0);
};

/**
 * Calculates total MRP from cart items.
 * Preferred: use backend `cart.totalMrpPrice`.
 * This fallback is for display-only when cart object is partially loaded.
 */
export const sumCartItemMrpPrice = (items: CartItem[]): number =>
{
    return items.reduce((acc, item) => (item?.mrpPrice ?? 0) + acc, 0);
};
