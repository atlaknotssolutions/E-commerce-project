/**
 * Layer 3 — CouponSnapshotBuilder
 *
 * Creates an immutable coupon snapshot to be stored on orders.
 * The snapshot ensures order history never depends on live coupon data.
 * Once stored, historical orders read the snapshot — never the coupon collection.
 */
import { calculateContributions } from './CouponCalculationEngine.js';

/**
 * Builds an immutable coupon snapshot for order storage.
 * @param {Object} coupon - The coupon document at time of use
 * @param {number} couponDiscountApplied - The actual discount amount applied to this order
 * @param {Object} [options]
 * @param {number} [options.orderSellingPrice] - This order's selling price (for proportional calculation)
 * @param {number} [options.totalPayable] - Total payable across all orders
 * @returns {Object} Immutable snapshot
 */
export const buildCouponSnapshot = (coupon, couponDiscountApplied, options = {}) =>
{
    if (!coupon)
    {
        return null;
    }

    const { sellerContribution, platformContribution } = calculateContributions(coupon, couponDiscountApplied);

    const snapshot = {
        couponId: (coupon._id || coupon.id).toString(),
        couponCode: coupon.code,
        couponName: coupon.name || '',
        ownerType: coupon.ownerType,
        sellerId: coupon.sellerId ? coupon.sellerId.toString() : null,
        scope: coupon.scope,
        scopeIds: (coupon.scopeIds || []).map((id) => id.toString()),
        discountType: coupon.discountType,
        discountPercentage: coupon.discountPercentage || 0,
        discountValue: coupon.discountValue || 0,
        maximumDiscount: coupon.maximumDiscount || 0,
        minimumOrderValue: coupon.minimumOrderValue || 0,
        couponDiscountApplied: Math.round(couponDiscountApplied * 100) / 100,
        sellerContribution: Math.round(sellerContribution * 100) / 100,
        platformContribution: Math.round(platformContribution * 100) / 100,
        appliedAt: options.appliedAt || new Date(),
        appliedBy: options.appliedBy || options.userId || '',
    };

    return snapshot;
};

/**
 * Builds a minimal null snapshot when no coupon was applied.
 * @returns {null}
 */
export const buildNullSnapshot = () => null;
