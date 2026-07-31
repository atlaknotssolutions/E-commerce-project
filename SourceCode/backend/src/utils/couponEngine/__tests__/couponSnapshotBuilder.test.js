import { buildCouponSnapshot } from '../CouponSnapshotBuilder.js';

describe('CouponSnapshotBuilder', () => {
    const mockCoupon = {
        _id: 'c123',
        code: 'SAVE10',
        name: 'Save 10%',
        ownerType: 'SELLER',
        sellerId: 'seller1',
        scope: 'ALL',
        scopeIds: [],
        discountType: 'PERCENTAGE',
        discountPercentage: 10,
        discountValue: 0,
        maximumDiscount: 200,
        minimumOrderValue: 500,
    };

    it('creates a complete immutable snapshot', () => {
        const snapshot = buildCouponSnapshot(mockCoupon, 150, {
            appliedAt: new Date('2026-06-15T12:00:00Z'),
            appliedBy: 'user1',
        });

        expect(snapshot).not.toBeNull();
        expect(snapshot.couponId).toBe('c123');
        expect(snapshot.couponCode).toBe('SAVE10');
        expect(snapshot.couponName).toBe('Save 10%');
        expect(snapshot.ownerType).toBe('SELLER');
        expect(snapshot.sellerId).toBe('seller1');
        expect(snapshot.scope).toBe('ALL');
        expect(snapshot.scopeIds).toEqual([]);
        expect(snapshot.discountType).toBe('PERCENTAGE');
        expect(snapshot.discountPercentage).toBe(10);
        expect(snapshot.maximumDiscount).toBe(200);
        expect(snapshot.minimumOrderValue).toBe(500);
        expect(snapshot.couponDiscountApplied).toBe(150);
        expect(snapshot.sellerContribution).toBe(150);
        expect(snapshot.platformContribution).toBe(0);
        expect(snapshot.appliedBy).toBe('user1');
    });

    it('returns null for null coupon', () => {
        expect(buildCouponSnapshot(null, 0)).toBeNull();
    });

    it('handles PLATFORM coupon contributions', () => {
        const platformCoupon = { ...mockCoupon, ownerType: 'PLATFORM', sellerId: null };
        const snapshot = buildCouponSnapshot(platformCoupon, 100);
        expect(snapshot.sellerContribution).toBe(0);
        expect(snapshot.platformContribution).toBe(100);
    });

    it('handles scopeIds conversion', () => {
        const couponWithScope = {
            ...mockCoupon,
            scope: 'PRODUCT',
            scopeIds: ['prod1', 'prod2'],
        };
        const snapshot = buildCouponSnapshot(couponWithScope, 50);
        expect(snapshot.scopeIds).toEqual(['prod1', 'prod2']);
    });

    it('stores appliedAt from options or defaults to Date', () => {
        const snapshot = buildCouponSnapshot(mockCoupon, 50, {
            appliedAt: new Date('2026-07-01T00:00:00Z'),
            appliedBy: 'admin',
        });
        expect(snapshot.appliedAt.toISOString()).toBe('2026-07-01T00:00:00.000Z');
    });

    it('snapshot is a plain object (not a class instance)', () => {
        const snapshot = buildCouponSnapshot(mockCoupon, 50);
        expect(Object.getPrototypeOf(snapshot)).toBe(Object.prototype);
    });

    it('rounds monetary values to 2 decimal places', () => {
        const snapshot = buildCouponSnapshot(mockCoupon, 150.456);
        expect(snapshot.couponDiscountApplied).toBe(150.46);
        expect(snapshot.sellerContribution).toBe(150.46);
    });
});
