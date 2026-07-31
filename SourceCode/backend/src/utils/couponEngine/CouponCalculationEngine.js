/**
 * Layer 2 — CouponCalculationEngine
 *
 * Pure functions only — no database access.
 * Delegates monetary math to the FinancialEngine (single source of truth).
 * Computes discount amounts, allocations, contributions, and final payables.
 */
import {
    computeCappedCouponDiscount,
    applyCouponToSellingPrice,
    computeProportionalCouponAllocation,
    computeProportionalCouponDiscount,
    computeSplitOrderPayable,
    recomputeCartSellingSum,
} from '../financialEngine.js';

/**
 * Computes the final discount amount for a coupon against a selling price sum.
 * @param {number} sellingPriceSum - Server-verified cart/order total
 * @param {Object} coupon - Coupon document
 * @param {number} [systemMaxDiscountPercent=0] - System-level max discount percentage
 * @returns {number} Capped discount amount
 */
export const calculateDiscount = (sellingPriceSum, coupon, systemMaxDiscountPercent = 0) =>
    computeCappedCouponDiscount(sellingPriceSum, coupon, systemMaxDiscountPercent);

/**
 * Applies a discount to a selling price.
 * @param {number} totalSellingPrice
 * @param {number} discountAmount
 * @returns {number} Final price (never negative)
 */
export const applyDiscount = (totalSellingPrice, discountAmount) =>
    applyCouponToSellingPrice(totalSellingPrice, discountAmount);

/**
 * Allocates a coupon proportionally across split orders.
 * @param {Array} orders - List of split orders with totalSellingPrice
 * @param {number} totalCouponPrice - Total coupon discount
 * @returns {Array<{orderIndex, orderId, couponShare}>}
 */
export const allocateCouponProportionally = (orders, totalCouponPrice) =>
    computeProportionalCouponAllocation(orders, totalCouponPrice);

/**
 * Computes a single order's proportional share of a coupon.
 * @param {number} orderSellingPrice
 * @param {number} totalSelling
 * @param {number} totalCoupon
 * @returns {number}
 */
export const calculateProportionalShare = (orderSellingPrice, totalSelling, totalCoupon) =>
    computeProportionalCouponDiscount(orderSellingPrice, totalSelling, totalCoupon);

/**
 * Computes total payable and final amount after coupon for a set of split orders.
 * @param {Array} splitOrders
 * @param {number} couponPrice
 * @returns {{ totalPayable: number, finalAmount: number }}
 */
export const calculateSplitPayable = (splitOrders, couponPrice) =>
    computeSplitOrderPayable(splitOrders, couponPrice);

/**
 * Recomputes the selling price sum from cart items (server-side, anti-tampering).
 * @param {Array} items
 * @returns {number}
 */
export const recalculateCartSum = (items) =>
    recomputeCartSellingSum(items);

/**
 * Computes the seller's share of a coupon discount (seller bears the cost).
 * For SELLER coupons, the seller bears the full discount.
 * For PLATFORM coupons, the platform bears the full discount.
 * @param {Object} coupon - Coupon document
 * @param {number} couponShare - This order's share of the coupon discount
 * @returns {{ sellerContribution: number, platformContribution: number }}
 */
export const calculateContributions = (coupon, couponShare = 0) =>
{
    const amount = Number(couponShare) || 0;
    if (coupon.ownerType === 'SELLER')
    {
        return { sellerContribution: amount, platformContribution: 0 };
    }
    // PLATFORM coupon
    return { sellerContribution: 0, platformContribution: amount };
};
