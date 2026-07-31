/**
 * Layer 4 — CouponRollbackService
 *
 * Single reusable rollback implementation for coupon usage.
 * Replaces every duplicated rollback across:
 *   - Payment Failure (payment.service.js)
 *   - Checkout Failure (order.service.js reverseCheckout)
 *   - Order Cancellation (future)
 *   - Coupon Remove (coupon.service.js removeCoupon)
 *
 * Fully idempotent: safe to call multiple times.
 */

/**
 * Rolls back coupon usage for a user.
 * Decrements usageCount, removes userId from usedByUsers, and removes coupon from user's usedCoupons.
 *
 * @param {Object} params
 * @param {Object} params.coupon - The coupon document
 * @param {string} params.userId - The user ID to rollback
 * @param {Object} params.couponRepository - Coupon repository instance
 * @param {Object} params.userRepository - User repository instance
 * @returns {Promise<boolean>} Whether a rollback was actually performed
 */
export const rollbackCouponUsage = async ({ coupon, userId, couponRepository, userRepository }) =>
{
    if (!coupon || !userId)
    {
        return false;
    }

    // Idempotency guard 1: Re-fetch coupon to check current state
    const freshCoupon = await couponRepository.findById(coupon._id);
    if (!freshCoupon)
    {
        return false;
    }

    const userStillTracked = (freshCoupon.usedByUsers || []).some(
        (id) => id.toString() === userId.toString()
    );

    // Only decrement if the user is still tracked — prevents double-decrement
    if (userStillTracked)
    {
        await couponRepository.updateCoupon(coupon._id, {
            $inc: { usageCount: -1 },
            $pull: { usedByUsers: userId },
        });
    }

    // Idempotency guard 2: filter always produces the same result
    const user = await userRepository.findById(userId);
    if (user)
    {
        const couponId = (coupon._id || coupon.id).toString();
        user.usedCoupons = (user.usedCoupons || []).filter(
            (id) => id && id.toString() !== couponId
        );
        await userRepository.updateUsedCoupons({ userId, usedCoupons: user.usedCoupons });
    }

    return userStillTracked;
};

/**
 * Rolls back coupon usage by finding the coupon from the cart's couponCode.
 * Convenience wrapper used by checkout/payment failure handlers.
 *
 * @param {Object} params
 * @param {Object} params.cart - Cart document (must have couponCode)
 * @param {string} params.userId - User ID
 * @param {Object} params.couponRepository
 * @param {Object} params.userRepository
 * @returns {Promise<boolean>}
 */
export const rollbackCouponFromCart = async ({ cart, userId, couponRepository, userRepository }) =>
{
    if (!cart || !cart.couponCode || !userId)
    {
        return false;
    }

    const coupon = await couponRepository.findByCode(cart.couponCode);
    if (!coupon)
    {
        return false;
    }

    return rollbackCouponUsage({ coupon, userId, couponRepository, userRepository });
};
