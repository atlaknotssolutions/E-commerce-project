import {
    validateCouponExists,
    validateCouponActive,
    validateCouponExpiry,
    validateUsageLimit,
    validateUserUsage,
    validateMinimumOrder,
    validateSeller,
    validateScopeProducts,
    validateScopeCategories,
    validateCouponEligibility,
} from '../CouponValidationEngine.js';

describe('CouponValidationEngine', () => {
    describe('validateCouponExists', () => {
        it('returns valid when coupon exists', () => {
            const result = validateCouponExists({ _id: '123' });
            expect(result.valid).toBe(true);
        });

        it('returns COUPON_NOT_FOUND when coupon is null', () => {
            const result = validateCouponExists(null);
            expect(result.valid).toBe(false);
            expect(result.code).toBe('COUPON_NOT_FOUND');
        });
    });

    describe('validateCouponActive', () => {
        it('returns valid when coupon is active', () => {
            const result = validateCouponActive({ isActive: true });
            expect(result.valid).toBe(true);
        });

        it('returns COUPON_INACTIVE when coupon is inactive', () => {
            const result = validateCouponActive({ isActive: false });
            expect(result.valid).toBe(false);
            expect(result.code).toBe('COUPON_INACTIVE');
        });
    });

    describe('validateCouponExpiry', () => {
        const now = new Date('2026-06-15T12:00:00Z');

        it('returns valid when within validity window', () => {
            const coupon = { validityStartDate: '2026-06-01', validityEndDate: '2026-07-01' };
            const result = validateCouponExpiry(coupon, now);
            expect(result.valid).toBe(true);
        });

        it('returns COUPON_EXPIRED when before start date', () => {
            const coupon = { validityStartDate: '2026-07-01', validityEndDate: '2026-08-01' };
            const result = validateCouponExpiry(coupon, now);
            expect(result.valid).toBe(false);
            expect(result.code).toBe('COUPON_EXPIRED');
        });

        it('returns COUPON_EXPIRED when after end date', () => {
            const coupon = { validityStartDate: '2026-05-01', validityEndDate: '2026-06-01' };
            const result = validateCouponExpiry(coupon, now);
            expect(result.valid).toBe(false);
            expect(result.code).toBe('COUPON_EXPIRED');
        });
    });

    describe('validateUsageLimit', () => {
        it('returns valid when usageLimit is 0 (unlimited)', () => {
            const result = validateUsageLimit({ usageLimit: 0, usageCount: 100 });
            expect(result.valid).toBe(true);
        });

        it('returns valid when usageCount is below usageLimit', () => {
            const result = validateUsageLimit({ usageLimit: 10, usageCount: 5 });
            expect(result.valid).toBe(true);
        });

        it('returns COUPON_USAGE_LIMIT_EXHAUSTED when at limit', () => {
            const result = validateUsageLimit({ usageLimit: 10, usageCount: 10 });
            expect(result.valid).toBe(false);
            expect(result.code).toBe('COUPON_USAGE_LIMIT_EXHAUSTED');
        });

        it('returns COUPON_USAGE_LIMIT_EXHAUSTED when over limit', () => {
            const result = validateUsageLimit({ usageLimit: 10, usageCount: 15 });
            expect(result.valid).toBe(false);
            expect(result.code).toBe('COUPON_USAGE_LIMIT_EXHAUSTED');
        });
    });

    describe('validateUserUsage', () => {
        it('returns valid when user has not used coupon', () => {
            const coupon = { _id: 'abc123' };
            const user = { usedCoupons: ['xyz789'] };
            const result = validateUserUsage(coupon, user);
            expect(result.valid).toBe(true);
        });

        it('returns COUPON_ALREADY_USED when user has used coupon', () => {
            const coupon = { _id: 'abc123' };
            const user = { usedCoupons: ['abc123', 'xyz789'] };
            const result = validateUserUsage(coupon, user);
            expect(result.valid).toBe(false);
            expect(result.code).toBe('COUPON_ALREADY_USED');
        });

        it('returns USER_NOT_FOUND when user is null', () => {
            const coupon = { _id: 'abc123' };
            const result = validateUserUsage(coupon, null);
            expect(result.valid).toBe(false);
            expect(result.code).toBe('USER_NOT_FOUND');
        });
    });

    describe('validateMinimumOrder', () => {
        it('returns valid when cart sum meets minimum', () => {
            const result = validateMinimumOrder(1000, 500);
            expect(result.valid).toBe(true);
        });

        it('returns MINIMUM_ORDER_VALUE_NOT_MET when below minimum', () => {
            const result = validateMinimumOrder(300, 500);
            expect(result.valid).toBe(false);
            expect(result.code).toBe('MINIMUM_ORDER_VALUE_NOT_MET');
        });

        it('returns valid when minimum is 0', () => {
            const result = validateMinimumOrder(100, 0);
            expect(result.valid).toBe(true);
        });
    });

    describe('validateSeller', () => {
        it('returns valid for PLATFORM coupons (no seller check)', async () => {
            const coupon = { ownerType: 'PLATFORM' };
            const result = await validateSeller(coupon, null);
            expect(result.valid).toBe(true);
        });

        const mockSellerModel = (result) => ({
            findById: () => ({ lean: async () => result }),
        });

        it('returns valid for SELLER coupons with active seller', async () => {
            const coupon = { ownerType: 'SELLER', sellerId: 'seller1' };
            const result = await validateSeller(coupon, mockSellerModel({ accountStatus: 'ACTIVE' }));
            expect(result.valid).toBe(true);
        });

        it('returns SELLER_NOT_FOUND when seller does not exist', async () => {
            const coupon = { ownerType: 'SELLER', sellerId: 'seller1' };
            const result = await validateSeller(coupon, mockSellerModel(null));
            expect(result.valid).toBe(false);
            expect(result.code).toBe('SELLER_NOT_FOUND');
        });

        it('returns SELLER_INACTIVE when seller is not active', async () => {
            const coupon = { ownerType: 'SELLER', sellerId: 'seller1' };
            const result = await validateSeller(coupon, mockSellerModel({ accountStatus: 'SUSPENDED' }));
            expect(result.valid).toBe(false);
            expect(result.code).toBe('SELLER_INACTIVE');
        });
    });

    describe('validateScopeProducts', () => {
        it('returns valid when all products exist and belong to seller', async () => {
            const scopeIds = ['prod1', 'prod2'];
            const productModel = {
                find: () => ({
                    select: () => ({
                        lean: async () => [
                            { _id: 'prod1', seller: 'seller1', isDeleted: false },
                            { _id: 'prod2', seller: 'seller1', isDeleted: false },
                        ],
                    }),
                }),
            };
            const result = await validateScopeProducts(scopeIds, 'seller1', productModel);
            expect(result.valid).toBe(true);
        });

        it('returns INVALID_PRODUCT_IDS when count mismatch', async () => {
            const scopeIds = ['prod1', 'prod2'];
            const productModel = {
                find: () => ({
                    select: () => ({
                        lean: async () => [
                            { _id: 'prod1', seller: 'seller1', isDeleted: false },
                        ],
                    }),
                }),
            };
            const result = await validateScopeProducts(scopeIds, 'seller1', productModel);
            expect(result.valid).toBe(false);
            expect(result.code).toBe('INVALID_PRODUCT_IDS');
        });

        it('returns PRODUCT_DELETED when product is deleted', async () => {
            const scopeIds = ['prod1'];
            const productModel = {
                find: () => ({
                    select: () => ({
                        lean: async () => [
                            { _id: 'prod1', seller: 'seller1', isDeleted: true },
                        ],
                    }),
                }),
            };
            const result = await validateScopeProducts(scopeIds, 'seller1', productModel);
            expect(result.valid).toBe(false);
            expect(result.code).toBe('PRODUCT_DELETED');
        });
    });

    describe('validateScopeCategories', () => {
        it('returns valid when all categories exist', async () => {
            const scopeIds = ['cat1'];
            const categoryModel = {
                find: () => ({ lean: async () => [{ _id: 'cat1' }] }),
            };
            const productModel = {
                distinct: async () => ['cat1'],
            };
            const result = await validateScopeCategories(scopeIds, 'seller1', categoryModel, productModel);
            expect(result.valid).toBe(true);
        });

        it('returns INVALID_CATEGORY_IDS when count mismatch', async () => {
            const scopeIds = ['cat1', 'cat2'];
            const categoryModel = {
                find: () => ({ lean: async () => [{ _id: 'cat1' }] }),
            };
            const productModel = { distinct: async () => [] };
            const result = await validateScopeCategories(scopeIds, 'seller1', categoryModel, productModel);
            expect(result.valid).toBe(false);
            expect(result.code).toBe('INVALID_CATEGORY_IDS');
        });
    });

    describe('validateCouponEligibility (fail-fast orchestration)', () => {
        const validCoupon = {
            _id: 'c1',
            isActive: true,
            validityStartDate: '2026-01-01',
            validityEndDate: '2027-01-01',
            usageLimit: 10,
            usageCount: 2,
            minimumOrderValue: 100,
            ownerType: 'PLATFORM',
            scope: 'ALL',
            scopeIds: [],
        };

        it('returns valid for a fully eligible coupon', async () => {
            const result = await validateCouponEligibility({
                coupon: validCoupon,
                user: { usedCoupons: [] },
                cartSellingSum: 500,
                sellerModel: null,
                productModel: null,
                categoryModel: null,
            });
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('fails fast on first cheap check — returns only that error', async () => {
            const result = await validateCouponEligibility({
                coupon: null,
                user: null,
                cartSellingSum: 0,
                sellerModel: null,
                productModel: null,
                categoryModel: null,
            });
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].code).toBe('COUPON_NOT_FOUND');
        });

        it('returns disabled coupon error before checking expiry', async () => {
            const result = await validateCouponEligibility({
                coupon: { ...validCoupon, isActive: false },
                user: { usedCoupons: [] },
                cartSellingSum: 500,
                sellerModel: null,
                productModel: null,
                categoryModel: null,
            });
            expect(result.valid).toBe(false);
            expect(result.errors[0].code).toBe('COUPON_INACTIVE');
        });

        it('returns expired coupon error before expensive scope checks', async () => {
            const result = await validateCouponEligibility({
                coupon: { ...validCoupon, validityEndDate: '2025-01-01' },
                user: { usedCoupons: [] },
                cartSellingSum: 500,
                sellerModel: null,
                productModel: null,
                categoryModel: null,
            });
            expect(result.valid).toBe(false);
            expect(result.errors[0].code).toBe('COUPON_EXPIRED');
        });

        it('returns usage limit error before minimum order check', async () => {
            const result = await validateCouponEligibility({
                coupon: { ...validCoupon, usageLimit: 5, usageCount: 5 },
                user: { usedCoupons: [] },
                cartSellingSum: 500,
                sellerModel: null,
                productModel: null,
                categoryModel: null,
            });
            expect(result.valid).toBe(false);
            expect(result.errors[0].code).toBe('COUPON_USAGE_LIMIT_EXHAUSTED');
        });

        it('returns minimum order error before seller validation', async () => {
            const result = await validateCouponEligibility({
                coupon: { ...validCoupon, minimumOrderValue: 1000 },
                user: { usedCoupons: [] },
                cartSellingSum: 100,
                sellerModel: null,
                productModel: null,
                categoryModel: null,
            });
            expect(result.valid).toBe(false);
            expect(result.errors[0].code).toBe('MINIMUM_ORDER_VALUE_NOT_MET');
        });
    });
});
