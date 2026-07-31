/**
 * Layer 5 — CouponFacade
 *
 * Public API for ALL coupon operations.
 *
 * Other services (Cart, Order, Payment, Return, Admin, Seller, Customer)
 * must ONLY call this layer. Never call internal engines directly.
 *
 * Cart Service
 *         │
 *         ▼
 *    CouponFacade
 *  ├── CouponValidationEngine
 *  ├── CouponCalculationEngine
 *  ├── CouponSnapshotBuilder
 *  └── CouponRollbackService
 *         │
 *         ▼
 *   FinancialEngine
 */

// ——— Layer 1 ———
import {
    validateCouponEligibility,
} from './CouponValidationEngine.js';

// ——— Layer 2 ———
import {
    calculateDiscount,
    applyDiscount,
    allocateCouponProportionally,
    calculateSplitPayable,
    recalculateCartSum,
    calculateContributions,
    calculateProportionalShare,
} from './CouponCalculationEngine.js';

// FinancialEngine — single source of truth for monetary math
import {
    applyCouponToSellingPrice,
} from '../financialEngine.js';

// ——— Layer 3 ———
import {
    buildCouponSnapshot,
} from './CouponSnapshotBuilder.js';

// ——— Layer 4 ———
import {
    rollbackCouponUsage,
    rollbackCouponFromCart,
} from './CouponRollbackService.js';

/**
 * CouponFacade — public API
 */
export const createCouponFacade = ({ segmentService, sellerSegmentService } = {}) =>
{
    // ——— VALIDATION ———
    const validateEligibility = async (params) => {
        const mergedService = {
            userMatchesSegment: segmentService ? segmentService.userMatchesSegment : null,
            sellerMatchesSegment: sellerSegmentService ? sellerSegmentService.sellerMatchesSegment : null,
        };
        return validateCouponEligibility({ ...params, segmentService: mergedService });
    };

    // ——— CALCULATION ———
    const computeDiscount = (sellingPriceSum, coupon, systemMaxDiscountPercent) =>
        calculateDiscount(sellingPriceSum, coupon, systemMaxDiscountPercent);

    const computeFinalPrice = (totalSellingPrice, discountAmount) =>
        applyDiscount(totalSellingPrice, discountAmount);

    const computeSellerEarnings = (orderSellingPrice, couponPrice) =>
        applyCouponToSellingPrice(orderSellingPrice, couponPrice);

    const computeProportionalAllocation = (orders, totalCouponPrice) =>
        allocateCouponProportionally(orders, totalCouponPrice);

    const computeProportionalShare = (orderSellingPrice, totalSelling, totalCoupon) =>
        calculateProportionalShare(orderSellingPrice, totalSelling, totalCoupon);

    const computeSplitPayable = (splitOrders, couponPrice) =>
        calculateSplitPayable(splitOrders, couponPrice);

    const computeCartSum = (items) =>
        recalculateCartSum(items);

    const computeContributions = (coupon, couponShare) =>
        calculateContributions(coupon, couponShare);

    // ——— SNAPSHOT ———
    const createSnapshot = (coupon, couponDiscountApplied, options) =>
        buildCouponSnapshot(coupon, couponDiscountApplied, options);

    // ——— ROLLBACK ———
    const rollback = async (params) =>
        rollbackCouponUsage(params);

    const rollbackByCart = async (params) =>
        rollbackCouponFromCart(params);

    return Object.freeze({
        // Validation
        validateEligibility,
        // Calculation
        computeDiscount,
        computeFinalPrice,
        computeSellerEarnings,
        computeProportionalAllocation,
        computeProportionalShare,
        computeSplitPayable,
        computeCartSum,
        computeContributions,
        // Snapshot
        createSnapshot,
        // Rollback
        rollback,
        rollbackByCart,
    });
};
