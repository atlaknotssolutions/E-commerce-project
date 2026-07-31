import mongoose from 'mongoose';
import { toCartDto } from '../../utils/mappers/cart.mapper.js';
import {
    computeDiscountPercent,
} from '../../utils/financialEngine.js';
import { createCouponFacade } from '../../utils/couponEngine/CouponFacade.js';

/**
 * Pure function-based factory representing the Coupon Business Service layer.
 * Coordinates dynamic checkout discounts applying and administrative campaign assets controls.
 * All coupon validation and calculation is delegated to CouponFacade.
 */
export const createCouponService = ({
    couponRepository,
    cartRepository,
    userRepository,
    createApiError,
    customerSegmentService,
    sellerSegmentService,
}) =>
{
    const couponFacade = createCouponFacade({
        segmentService: customerSegmentService || null,
        sellerSegmentService: sellerSegmentService || null,
    });

    /**
     * Evaluates and applies a validated promo-code directly to user shopping cart.
     * Enforces strict chronological, spending threshold, and single-use constraints.
     */
    const applyCoupon = async ({ userId, code }) =>
    {
        const targetCode = code.toUpperCase().trim();

        // 1. Core Lookup: Locate coupon record inside database
        const coupon = await couponRepository.findByCode(targetCode);
        if (!coupon)
        {
            throw createApiError({
                statusCode: 404,
                code: 'COUPON_NOT_FOUND',
                message: `Promotion failed: The promo code '${targetCode}' does not exist.`
            });
        }

        // 2. Load cart and user
        const cart = await cartRepository.findByUserId({ userId });
        if (!cart)
        {
            throw createApiError({
                statusCode: 404,
                code: 'CART_NOT_FOUND',
                message: 'Cart session is missing.'
            });
        }

        const user = await userRepository.findById(userId);
        if (!user)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'User profile verification failed.'
            });
        }

        // 3. Server-side cart sum (anti-tampering)
        const currentSellingPriceSum = couponFacade.computeCartSum(cart.items);

        // 4. Extract seller IDs from cart items for seller segment validation
        const productIds = cart.items.map((item) => item.product).filter(Boolean);
        let cartItemSellerIds = [];
        if (productIds.length > 0)
        {
            const products = await mongoose.model('Product').find(
                { _id: { $in: productIds } },
                { seller: 1 }
            ).lean();
            cartItemSellerIds = [...new Set(products.map((p) => p.seller.toString()))];
        }

        // 5. Validate eligibility using CouponValidationEngine
        const Order = mongoose.model('Order');
        const userOrderCount = await Order.countDocuments({ user: userId });
        const { valid, errors } = await couponFacade.validateEligibility({
            coupon,
            user,
            cartSellingSum: currentSellingPriceSum,
            sellerModel: mongoose.model('Seller'),
            productModel: mongoose.model('Product'),
            categoryModel: mongoose.model('Category'),
            userOrderCount,
            cartItemSellerIds,
        });

        if (!valid)
        {
            const err = errors[0];
            throw createApiError({
                statusCode: err.code === 'COUPON_NOT_FOUND' ? 404 : 400,
                code: err.code,
                message: err.message,
            });
        }

        // 5. Calculate capped discount (uses FinancialEngine under the hood)
        const discountAmount = couponFacade.computeDiscount(currentSellingPriceSum, coupon);

        // 6. Update Cart schema: Inject promo code variables
        const updatedCartPayload = {
            couponCode: coupon.code,
            couponPrice: discountAmount,
            totalSellingPrice: currentSellingPriceSum,
            discount: computeDiscountPercent(cart.totalMrpPrice, currentSellingPriceSum),
        };

        const finalCart = await cartRepository.updateCart({ userId, cartData: updatedCartPayload });

        return toCartDto(finalCart);
    };

    /**
     * Resets applied promotional cuts, restoring standard cart selling subtotals.
     * Uses CouponRollbackService for usage rollback.
     */
    const removeCoupon = async ({ userId }) =>
    {
        const cart = await cartRepository.findByUserId({ userId });
        if (!cart)
        {
            throw createApiError({
                statusCode: 404,
                code: 'CART_NOT_FOUND',
                message: 'Cart session is missing.'
            });
        }

        if (!cart.couponCode)
        {
            return toCartDto(cart);
        }

        // Use CouponRollbackService (single source of truth)
        await couponFacade.rollbackByCart({
            cart,
            userId,
            couponRepository,
            userRepository,
        });

        // Recalculate basic cart totals resetting discount price variables
        const originalSellingPriceSum = couponFacade.computeCartSum(cart.items);

        const resetCartPayload = {
            couponCode: null,
            couponPrice: 0,
            totalSellingPrice: originalSellingPriceSum,
            discount: computeDiscountPercent(cart.totalMrpPrice, originalSellingPriceSum),
        };

        return toCartDto(await cartRepository.updateCart({ userId, cartData: resetCartPayload }));
    };

    /**
     * Administrative CRUD: Onboards a new promo campaign asset.
     */
    const createCoupon = async (couponData) =>
    {
        const existing = await couponRepository.findByCode(couponData.code);
        if (existing)
        {
            throw createApiError({
                statusCode: 409,
                code: 'DUPLICATE_COUPON_CODE',
                message: `Onboarding failed: A promo campaign code '${couponData.code.toUpperCase()}' is already active.`
            });
        }

        return couponRepository.createCoupon(couponData);
    };

    /**
     * Administrative CRUD: Erases promo asset from collections.
     */
    const deleteCoupon = async ({ id }) =>
    {
        const deleted = await couponRepository.deleteCoupon(id);
        if (!deleted)
        {
            throw createApiError({
                statusCode: 404,
                code: 'COUPON_NOT_FOUND',
                message: 'Deletion failed. Targeted coupon was not found.'
            });
        }
        return { success: true, message: 'Promotional coupon successfully deleted.' };
    };

    /**
     * Administrative CRUD: Displays list of all campaigns.
     */
    const listCoupons = async () =>
    {
        return couponRepository.findAllCoupons();
    };

    /**
     * Customer-facing: Returns all active coupons available to the user, plus their used/expired coupons.
     */
    const getAvailableCoupons = async ({ userId }) =>
    {
        const now = new Date();
        const [available, used] = await Promise.all([
            couponRepository.findAvailableForCustomer(userId),
            couponRepository.findUsedByCustomer(userId),
        ]);

        const expired = used.filter(c => new Date(c.validityEndDate) < now);
        const usedCoupons = used.filter(c => new Date(c.validityEndDate) >= now);

        return { available, used: usedCoupons, expired };
    };

    return Object.freeze({
        applyCoupon,
        removeCoupon,
        createCoupon,
        deleteCoupon,
        listCoupons,
        getAvailableCoupons,
    });
};