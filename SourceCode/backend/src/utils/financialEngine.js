/**
 * Centralized Financial Calculation Engine
 *
 * Single source of truth for ALL financial calculations across the marketplace.
 * Every service, controller, or module MUST use this engine instead of computing
 * values independently. This ensures consistency across cart, checkout, orders,
 * payments, refunds, dashboards, and reports.
 */

/**
 * Computes a single item line total (MRP and selling price multiplied by quantity).
 * @param {number} mrpPrice - Unit MRP
 * @param {number} sellingPrice - Unit selling price
 * @param {number} quantity - Quantity
 * @returns {{ mrpPrice: number, sellingPrice: number }}
 */
export const computeItemLine = (mrpPrice, sellingPrice, quantity) =>
{
    const qty = Number(quantity) || 1;
    return {
        mrpPrice: Number(mrpPrice) * qty,
        sellingPrice: Number(sellingPrice) * qty,
    };
};

/**
 * Aggregates a list of cart/order items into totals.
 * Each item must have `mrpPrice` and `sellingPrice` (already multiplied by quantity).
 * @param {Array<{ mrpPrice: number, sellingPrice: number, quantity?: number }>} items
 * @returns {{ totalItem: number, totalMrpPrice: number, totalSellingPrice: number }}
 */
export const aggregateItemTotals = (items) =>
{
    let totalItem = 0;
    let totalMrpPrice = 0;
    let totalSellingPrice = 0;

    for (const item of items)
    {
        totalItem += Number(item.quantity) || 0;
        totalMrpPrice += Number(item.mrpPrice) || 0;
        totalSellingPrice += Number(item.sellingPrice) || 0;
    }

    return { totalItem, totalMrpPrice, totalSellingPrice };
};

/**
 * Computes the final selling price after applying a coupon discount.
 * @param {number} totalSellingPrice - Aggregate selling price before coupon
 * @param {number} couponPrice - Coupon discount amount
 * @returns {number} Final selling price (never negative)
 */
export const applyCouponToSellingPrice = (totalSellingPrice, couponPrice = 0) =>
    Math.max(0, Number(totalSellingPrice) - Number(couponPrice || 0));

/**
 * Computes the overall discount percentage (combining product and coupon discount).
 * Uses the same formula as the original cart.service.js.
 * @param {number} totalMrpPrice - Sum of all item MRPs
 * @param {number} finalSellingPrice - Selling price after all discounts
 * @returns {number} Discount percentage (0-100, rounded to integer)
 */
export const computeDiscountPercent = (totalMrpPrice, finalSellingPrice) =>
{
    if (!totalMrpPrice || totalMrpPrice <= 0) return 0;
    return Math.round(((Number(totalMrpPrice) - Number(finalSellingPrice)) / Number(totalMrpPrice)) * 100);
};

/**
 * Computes a full cart-level totals object, including coupon deduction and discount %.
 * @param {Array} items - Cart items with `mrpPrice`, `sellingPrice`, `quantity`
 * @param {number} [couponPrice=0] - Coupon discount amount
 * @returns {{ items: Array, totalItem: number, totalMrpPrice: number, totalSellingPrice: number, discount: number }}
 */
export const computeCartTotals = (items, couponPrice = 0) =>
{
    const { totalItem, totalMrpPrice, totalSellingPrice } = aggregateItemTotals(items);
    const discount = computeDiscountPercent(totalMrpPrice, totalSellingPrice);

    return {
        items,
        totalItem,
        totalMrpPrice,
        totalSellingPrice,
        discount,
    };
};

/**
 * Recalculates the current selling price sum of a cart by iterating items.
 * Used by coupon service to verify minimum order thresholds.
 * @param {Array} items - Cart items with `product.sellingPrice` or `sellingPrice`
 * @returns {number} Current selling price sum
 */
export const recomputeCartSellingSum = (items) =>
{
    let sum = 0;
    for (const item of items)
    {
        const unitSelling = item.product
            ? Number(item.product.sellingPrice)
            : (Number(item.sellingPrice) / Number(item.quantity));
        sum += unitSelling * Number(item.quantity);
    }
    return sum;
};

/**
 * Calculates the coupon discount amount given a selling price sum and percentage.
 * @param {number} sellingPriceSum - Current total selling price
 * @param {number} discountPercentage - Coupon discount percentage (e.g. 10 for 10%)
 * @returns {number} Discount amount (rounded to integer)
 */
export const computeCouponDiscountAmount = (sellingPriceSum, discountPercentage) =>
    Math.round(Number(sellingPriceSum) * (Number(discountPercentage) / 100));

/**
 * Computes the absolute discount for an order (totalMrp - totalSelling).
 * @param {number} totalMrpPrice
 * @param {number} totalSellingPrice
 * @returns {number}
 */
export const computeOrderDiscount = (totalMrpPrice, totalSellingPrice) =>
    Math.max(0, Number(totalMrpPrice) - Number(totalSellingPrice));

/**
 * Resolves variant-level pricing, falling back to product-level pricing if no variant matches.
 * @param {Object} product - Full product document (with mrpPrice, sellingPrice, variants[])
 * @param {string|null|undefined} variantId - Variant ID to look up
 * @returns {{ mrpPrice: number, sellingPrice: number }}
 */
export const resolveVariantPricing = (product, variantId) =>
{
    let mrpPrice = Number(product.mrpPrice);
    let sellingPrice = Number(product.sellingPrice);

    if (variantId && product.variants)
    {
        const variant = product.variants.find(
            (v) => v._id && v._id.toString() === variantId.toString()
        );
        if (variant)
        {
            mrpPrice = Number(variant.mrpPrice);
            sellingPrice = Number(variant.price);
        }
    }

    return { mrpPrice, sellingPrice };
};

/**
 * Computes total payable across split orders and final amount after coupon deduction.
 * @param {Array<{ totalSellingPrice: number }>} splitOrders - List of order objects
 * @param {number} couponPrice - Coupon discount amount
 * @returns {{ totalPayable: number, finalAmount: number }}
 */
export const computeSplitOrderPayable = (splitOrders, couponPrice) =>
{
    const totalPayable = splitOrders.reduce((sum, o) => sum + (Number(o.totalSellingPrice) || 0), 0);
    return {
        totalPayable,
        finalAmount: applyCouponToSellingPrice(totalPayable, couponPrice),
    };
};

/**
 * Computes the per-order coupon discount proportionally.
 * Used to attach coupon discount to individual orders after checkout.
 * @param {number} orderSellingPrice - This order's total selling price
 * @param {number} totalSellingPriceAcrossOrders - Sum of all order selling prices
 * @param {number} totalCouponPrice - Total coupon discount amount
 * @returns {number} This order's share of the coupon discount
 */
export const computeProportionalCouponDiscount = (orderSellingPrice, totalSellingPriceAcrossOrders, totalCouponPrice) =>
{
    if (!totalSellingPriceAcrossOrders || totalSellingPriceAcrossOrders <= 0) return 0;
    const share = (Number(orderSellingPrice) / Number(totalSellingPriceAcrossOrders)) * Number(totalCouponPrice);
    return Math.round(share * 100) / 100;
};

/**
 * Computes the refund amount for a line item, optionally prorating coupon discount.
 * @param {number} lineSellingPrice - The order item's sellingPrice (already qty * unit)
 * @param {Object} [options]
 * @param {number} [options.orderTotalSellingPrice] - Total order selling price (for coupon proration)
 * @param {number} [options.orderCouponPrice] - Total coupon discount on the order
 * @param {boolean} [options.isFullRefund=false] - If true, refunds full line selling price
 * @returns {number} Refund amount (never negative, never exceeds lineSellingPrice)
 */
export const computeRefundAmount = (lineSellingPrice, options = {}) =>
{
    const itemPrice = Number(lineSellingPrice) || 0;
    if (itemPrice <= 0) return 0;

    const { orderTotalSellingPrice, orderCouponPrice, isFullRefund } = options;

    if (isFullRefund) return itemPrice;

    // Prorate coupon discount: customer paid less than item price when coupon was applied
    const totalPrice = Number(orderTotalSellingPrice) || 0;
    const coupon = Number(orderCouponPrice) || 0;
    if (totalPrice > 0 && coupon > 0 && coupon < totalPrice)
    {
        const couponShare = (itemPrice / totalPrice) * coupon;
        return Math.round(Math.max(0, itemPrice - couponShare) * 100) / 100;
    }

    return itemPrice;
};

/**
 * Validates that MRP >= selling price for an item.
 * @param {number} mrpPrice
 * @param {number} sellingPrice
 * @returns {{ valid: boolean, message?: string }}
 */
export const validatePricing = (mrpPrice, sellingPrice) =>
{
    if (Number(mrpPrice) < Number(sellingPrice))
    {
        return {
            valid: false,
            message: 'MRP must be greater than or equal to the selling price.',
        };
    }
    return { valid: true };
};

/**
 * Computes a capped coupon discount that respects maximumDiscount and never exceeds selling price.
 * Supports both PERCENTAGE and FLAT coupon types.
 * @param {number} sellingPriceSum - Current total selling price
 * @param {Object} coupon - Coupon document with discountType, discountPercentage, discountValue, maximumDiscount
 * @param {number} [systemMaxDiscountPercent=0] - System-level max discount percentage (from settings.coupons.maxDiscount)
 * @returns {number} Capped discount amount (never negative, never > sellingPriceSum)
 */
export const computeCappedCouponDiscount = (sellingPriceSum, coupon, systemMaxDiscountPercent = 0) =>
{
    const total = Number(sellingPriceSum) || 0;
    if (total <= 0) return 0;

    let discount = 0;

    if (coupon.discountType === 'FLAT')
    {
        discount = Number(coupon.discountValue) || 0;
    }
    else
    {
        const pct = Number(coupon.discountPercentage) || 0;
        discount = Math.round(total * (pct / 100));
    }

    // Cap by coupon's own maximumDiscount if set (0 means no cap)
    const maxDiscount = Number(coupon.maximumDiscount) || 0;
    if (maxDiscount > 0 && discount > maxDiscount)
    {
        discount = maxDiscount;
    }

    // Cap by system maximum discount percentage (if set)
    const sysMaxPct = Number(systemMaxDiscountPercent) || 0;
    if (sysMaxPct > 0)
    {
        const sysMaxAbs = Math.round(total * (sysMaxPct / 100));
        if (discount > sysMaxAbs) discount = sysMaxAbs;
    }

    // Never allow discount greater than the selling price
    return Math.min(discount, total);
};

/**
 * Allocates coupon discount proportionally across multiple orders and handles
 * rounding remainder so the sum of allocations exactly equals the total coupon.
 * @param {Array<{ _id?: string, totalSellingPrice: number }>} orders - List of order objects
 * @param {number} totalCouponPrice - Total coupon discount to allocate
 * @returns {Array<{ orderIndex: number, orderId: string|undefined, couponShare: number }>}
 */
export const computeProportionalCouponAllocation = (orders, totalCouponPrice) =>
{
    const couponTotal = Number(totalCouponPrice) || 0;
    if (couponTotal <= 0 || !orders || orders.length === 0)
    {
        return orders.map((o, i) => ({
            orderIndex: i,
            orderId: o._id ? o._id.toString() : undefined,
            couponShare: 0,
        }));
    }

    const totalPayable = orders.reduce((sum, o) => sum + (Number(o.totalSellingPrice) || 0), 0);
    if (totalPayable <= 0)
    {
        return orders.map((o, i) => ({
            orderIndex: i,
            orderId: o._id ? o._id.toString() : undefined,
            couponShare: 0,
        }));
    }

    // Round each share to 2 decimal places
    const allocations = orders.map((o, i) => {
        const share = (Number(o.totalSellingPrice) / totalPayable) * couponTotal;
        return {
            orderIndex: i,
            orderId: o._id ? o._id.toString() : undefined,
            rawShare: share,
            couponShare: Math.floor(share * 100) / 100,
        };
    });

    // Distribute the rounding remainder (in paise) to preserve total exactly
    const allocatedSum = allocations.reduce((s, a) => s + a.couponShare, 0);
    let remainder = Math.round((couponTotal - allocatedSum) * 100); // remainder in paise

    let idx = 0;
    while (remainder > 0 && idx < allocations.length)
    {
        allocations[idx].couponShare = Math.round((allocations[idx].couponShare + 0.01) * 100) / 100;
        remainder--;
        idx++;
    }

    return allocations.map(({ orderIndex, orderId, couponShare }) => ({
        orderIndex,
        orderId,
        couponShare,
    }));
};

/**
 * Validates that a value is non-negative.
 * @param {number} value
 * @param {string} label - Label for error message
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateNonNegative = (value, label = 'Value') =>
{
    if (Number(value) < 0)
    {
        return {
            valid: false,
            message: `${label} must not be negative.`,
        };
    }
    return { valid: true };
};

/**
 * Validates the fundamental financial reconciliation equation:
 * totalCustomerPaid = sum(sellerPostCouponEarnings) AND each individual seller's portion reconciles.
 * @param {number} customerPaid - Total amount paid by customer
 * @param {number} totalSellerEarnings - Sum of all sellers' post-coupon earnings
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateReconciliation = (customerPaid, totalSellerEarnings) =>
{
    const paid = Number(customerPaid) || 0;
    const earnings = Number(totalSellerEarnings) || 0;

    if (Math.abs(paid - earnings) > 0.02)
    {
        return {
            valid: false,
            message: `Reconciliation mismatch: customer paid ₹${paid} but total seller earnings = ₹${earnings}. Difference: ₹${Math.abs(paid - earnings)}`,
        };
    }
    return { valid: true };
};
