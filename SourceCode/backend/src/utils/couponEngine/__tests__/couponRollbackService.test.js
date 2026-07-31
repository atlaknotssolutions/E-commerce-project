import { jest } from '@jest/globals';
import { rollbackCouponUsage, rollbackCouponFromCart } from '../CouponRollbackService.js';

describe('CouponRollbackService', () => {
    const createMockCouponRepo = (overrides = {}) => ({
        findById: overrides.findById || (async () => ({
            _id: 'c1',
            usageCount: 3,
            usedByUsers: ['user1', 'user2'],
        })),
        updateCoupon: overrides.updateCoupon || (async () => {}),
    });

    const createMockUserRepo = (overrides = {}) => ({
        findById: overrides.findById || (async () => ({
            _id: 'user1',
            usedCoupons: ['c1', 'c2'],
        })),
        updateUsedCoupons: overrides.updateUsedCoupons || (async () => {}),
    });

    describe('rollbackCouponUsage', () => {
        it('rolls back coupon usage and user tracking', async () => {
            const updateCoupon = jest.fn();
            const updateUsedCoupons = jest.fn();

            const result = await rollbackCouponUsage({
                coupon: { _id: 'c1', usageCount: 3, usedByUsers: ['user1'] },
                userId: 'user1',
                couponRepository: createMockCouponRepo({
                    updateCoupon,
                }),
                userRepository: createMockUserRepo({
                    updateUsedCoupons,
                }),
            });

            expect(result).toBe(true);
            expect(updateCoupon).toHaveBeenCalledWith('c1', {
                $inc: { usageCount: -1 },
                $pull: { usedByUsers: 'user1' },
            });
            expect(updateUsedCoupons).toHaveBeenCalled();
        });

        it('is idempotent — second call does not decrement again', async () => {
            const updateCoupon = jest.fn();

            // First call: user is in usedByUsers
            await rollbackCouponUsage({
                coupon: { _id: 'c1' },
                userId: 'user1',
                couponRepository: createMockCouponRepo({
                    findById: async () => ({
                        _id: 'c1',
                        usageCount: 3,
                        usedByUsers: ['user1', 'user2'],
                    }),
                    updateCoupon,
                }),
                userRepository: createMockUserRepo({
                    findById: async () => ({ _id: 'user1', usedCoupons: ['c1', 'c2'] }),
                }),
            });

            // Second call: user already removed from usedByUsers
            await rollbackCouponUsage({
                coupon: { _id: 'c1' },
                userId: 'user1',
                couponRepository: createMockCouponRepo({
                    findById: async () => ({
                        _id: 'c1',
                        usageCount: 2,
                        usedByUsers: ['user2'],
                    }),
                    updateCoupon,
                }),
                userRepository: createMockUserRepo({
                    findById: async () => ({ _id: 'user1', usedCoupons: ['c2'] }),
                }),
            });

            // updateCoupon should have been called only once
            expect(updateCoupon).toHaveBeenCalledTimes(1);
        });

        it('returns false when coupon or userId is missing', async () => {
            const result = await rollbackCouponUsage({
                coupon: null,
                userId: 'user1',
                couponRepository: createMockCouponRepo(),
                userRepository: createMockUserRepo(),
            });
            expect(result).toBe(false);
        });

        it('returns false when coupon is not found in DB', async () => {
            const result = await rollbackCouponUsage({
                coupon: { _id: 'nonexistent' },
                userId: 'user1',
                couponRepository: createMockCouponRepo({
                    findById: async () => null,
                }),
                userRepository: createMockUserRepo(),
            });
            expect(result).toBe(false);
        });

        it('handles user with empty usedCoupons', async () => {
            const result = await rollbackCouponUsage({
                coupon: { _id: 'c1', usageCount: 1, usedByUsers: ['user1'] },
                userId: 'user1',
                couponRepository: createMockCouponRepo(),
                userRepository: createMockUserRepo({
                    findById: async () => ({ _id: 'user1', usedCoupons: [] }),
                }),
            });
            expect(result).toBe(true);
        });
    });

    describe('rollbackCouponFromCart', () => {
        it('rolls back via cart couponCode', async () => {
            const findByCode = jest.fn().mockResolvedValue({ _id: 'c1', usageCount: 2, usedByUsers: ['user1'] });
            const updateCoupon = jest.fn();
            const updateUsedCoupons = jest.fn();

            const result = await rollbackCouponFromCart({
                cart: { couponCode: 'SAVE10' },
                userId: 'user1',
                couponRepository: {
                    findByCode,
                    findById: async () => ({ _id: 'c1', usageCount: 2, usedByUsers: ['user1'] }),
                    updateCoupon,
                },
                userRepository: createMockUserRepo({
                    updateUsedCoupons,
                }),
            });

            expect(result).toBe(true);
            expect(findByCode).toHaveBeenCalledWith('SAVE10');
        });

        it('returns false when cart has no couponCode', async () => {
            const result = await rollbackCouponFromCart({
                cart: { couponCode: null },
                userId: 'user1',
                couponRepository: { findByCode: jest.fn() },
                userRepository: createMockUserRepo(),
            });
            expect(result).toBe(false);
        });

        it('returns false when coupon code not found', async () => {
            const result = await rollbackCouponFromCart({
                cart: { couponCode: 'INVALID' },
                userId: 'user1',
                couponRepository: { findByCode: async () => null },
                userRepository: createMockUserRepo(),
            });
            expect(result).toBe(false);
        });
    });
});
