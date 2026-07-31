import {
    calculateDiscount,
    applyDiscount,
    allocateCouponProportionally,
    calculateProportionalShare,
    calculateSplitPayable,
    recalculateCartSum,
    calculateContributions,
} from '../CouponCalculationEngine.js';

describe('CouponCalculationEngine', () => {
    describe('calculateDiscount', () => {
        it('computes FLAT discount correctly', () => {
            const coupon = { discountType: 'FLAT', discountValue: 200, maximumDiscount: 0 };
            expect(calculateDiscount(1000, coupon)).toBe(200);
        });

        it('computes PERCENTAGE discount correctly', () => {
            const coupon = { discountType: 'PERCENTAGE', discountPercentage: 10, maximumDiscount: 0 };
            expect(calculateDiscount(1000, coupon)).toBe(100);
        });

        it('caps discount by maximumDiscount', () => {
            const coupon = { discountType: 'PERCENTAGE', discountPercentage: 20, maximumDiscount: 150 };
            expect(calculateDiscount(1000, coupon)).toBe(150);
        });

        it('never exceeds selling price', () => {
            const coupon = { discountType: 'FLAT', discountValue: 5000, maximumDiscount: 0 };
            expect(calculateDiscount(1000, coupon)).toBe(1000);
        });

        it('returns 0 for negative selling price', () => {
            const coupon = { discountType: 'FLAT', discountValue: 100, maximumDiscount: 0 };
            expect(calculateDiscount(-100, coupon)).toBe(0);
        });
    });

    describe('applyDiscount', () => {
        it('subtracts discount from selling price', () => {
            expect(applyDiscount(1000, 200)).toBe(800);
        });

        it('returns 0 when discount exceeds selling price', () => {
            expect(applyDiscount(100, 200)).toBe(0);
        });

        it('returns 0 for negative selling price', () => {
            expect(applyDiscount(-100, 50)).toBe(0);
        });
    });

    describe('allocateCouponProportionally', () => {
        it('allocates coupon proportionally across orders', () => {
            const orders = [
                { _id: 'o1', totalSellingPrice: 600 },
                { _id: 'o2', totalSellingPrice: 400 },
            ];
            const allocations = allocateCouponProportionally(orders, 100);
            expect(allocations).toHaveLength(2);
            expect(allocations[0].couponShare).toBe(60);
            expect(allocations[1].couponShare).toBe(40);
        });

        it('handles penny rounding so sum equals total coupon', () => {
            const orders = [
                { _id: 'o1', totalSellingPrice: 333 },
                { _id: 'o2', totalSellingPrice: 333 },
                { _id: 'o3', totalSellingPrice: 334 },
            ];
            const allocations = allocateCouponProportionally(orders, 100);
            const totalAllocated = allocations.reduce((s, a) => s + a.couponShare, 0);
            expect(totalAllocated).toBe(100);
        });

        it('returns zero shares when coupon is 0', () => {
            const orders = [
                { _id: 'o1', totalSellingPrice: 500 },
                { _id: 'o2', totalSellingPrice: 500 },
            ];
            const allocations = allocateCouponProportionally(orders, 0);
            expect(allocations.every((a) => a.couponShare === 0)).toBe(true);
        });

        it('returns zero shares when orders are empty', () => {
            const allocations = allocateCouponProportionally([], 100);
            expect(allocations).toHaveLength(0);
        });
    });

    describe('calculateProportionalShare', () => {
        it('computes proportional share', () => {
            expect(calculateProportionalShare(300, 1000, 100)).toBe(30);
        });

        it('returns 0 when total is 0', () => {
            expect(calculateProportionalShare(300, 0, 100)).toBe(0);
        });
    });

    describe('calculateSplitPayable', () => {
        it('computes total payable and final amount', () => {
            const orders = [
                { totalSellingPrice: 600 },
                { totalSellingPrice: 400 },
            ];
            const result = calculateSplitPayable(orders, 100);
            expect(result.totalPayable).toBe(1000);
            expect(result.finalAmount).toBe(900);
        });

        it('handles zero coupon', () => {
            const orders = [{ totalSellingPrice: 500 }];
            const result = calculateSplitPayable(orders, 0);
            expect(result.totalPayable).toBe(500);
            expect(result.finalAmount).toBe(500);
        });
    });

    describe('recalculateCartSum', () => {
        it('recalculates sum from cart items with product.sellingPrice', () => {
            const items = [
                { product: { sellingPrice: 200 }, quantity: 2 },
                { product: { sellingPrice: 100 }, quantity: 3 },
            ];
            expect(recalculateCartSum(items)).toBe(700);
        });

        it('recalculates sum from cart items with item-level sellingPrice', () => {
            const items = [
                { sellingPrice: 400, quantity: 2 },
                { sellingPrice: 300, quantity: 3 },
            ];
            expect(recalculateCartSum(items)).toBe(700);
        });

        it('returns 0 for empty items', () => {
            expect(recalculateCartSum([])).toBe(0);
        });
    });

    describe('calculateContributions', () => {
        it('SELLER coupon: seller bears full cost', () => {
            const result = calculateContributions({ ownerType: 'SELLER' }, 100);
            expect(result.sellerContribution).toBe(100);
            expect(result.platformContribution).toBe(0);
        });

        it('PLATFORM coupon: platform bears full cost', () => {
            const result = calculateContributions({ ownerType: 'PLATFORM' }, 100);
            expect(result.sellerContribution).toBe(0);
            expect(result.platformContribution).toBe(100);
        });

        it('returns zero contributions for zero coupon share', () => {
            const result = calculateContributions({ ownerType: 'SELLER' }, 0);
            expect(result.sellerContribution).toBe(0);
            expect(result.platformContribution).toBe(0);
        });
    });
});
