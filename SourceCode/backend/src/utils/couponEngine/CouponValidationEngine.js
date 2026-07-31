/**
 * Layer 1 — CouponValidationEngine
 *
 * Validates every aspect of a coupon without calculating money.
 * Returns { valid, code, message } for every check.
 * Never calls the database — receives all data as arguments.
 */

export const validateCouponExists = (coupon) =>
{
    if (!coupon)
    {
        return { valid: false, code: 'COUPON_NOT_FOUND', message: 'Coupon does not exist.' };
    }
    return { valid: true };
};

export const validateCouponActive = (coupon) =>
{
    if (!coupon.isActive)
    {
        return { valid: false, code: 'COUPON_INACTIVE', message: 'This coupon has been deactivated.' };
    }
    return { valid: true };
};

export const validateCouponExpiry = (coupon, now = new Date()) =>
{
    if (now < new Date(coupon.validityStartDate) || now > new Date(coupon.validityEndDate))
    {
        return { valid: false, code: 'COUPON_EXPIRED', message: 'This coupon has expired or is not yet active.' };
    }
    return { valid: true };
};

export const validateUsageLimit = (coupon) =>
{
    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit)
    {
        return { valid: false, code: 'COUPON_USAGE_LIMIT_EXHAUSTED', message: 'This coupon has reached its maximum usage limit.' };
    }
    return { valid: true };
};

export const validateUserUsage = (coupon, user) =>
{
    if (!user) return { valid: false, code: 'USER_NOT_FOUND', message: 'User not found.' };

    const hasUsed = (user.usedCoupons || []).some(
        (id) => id && id.toString() === (coupon._id || coupon.id).toString()
    );
    if (hasUsed)
    {
        return { valid: false, code: 'COUPON_ALREADY_USED', message: 'You have already used this coupon.' };
    }
    return { valid: true };
};

export const validateMinimumOrder = (cartSellingSum, minimumOrderValue) =>
{
    if (cartSellingSum < minimumOrderValue)
    {
        return { valid: false, code: 'MINIMUM_ORDER_VALUE_NOT_MET', message: `Minimum order value of ₹${minimumOrderValue} not met (cart: ₹${cartSellingSum}).` };
    }
    return { valid: true };
};

export const validateSeller = async (coupon, sellerModel) =>
{
    if (coupon.ownerType !== 'SELLER' || !coupon.sellerId)
    {
        return { valid: true };
    }
    const seller = await sellerModel.findById(coupon.sellerId).lean();
    if (!seller)
    {
        return { valid: false, code: 'SELLER_NOT_FOUND', message: 'The seller for this coupon no longer exists.' };
    }
    if (seller.accountStatus && seller.accountStatus !== 'ACTIVE')
    {
        return { valid: false, code: 'SELLER_INACTIVE', message: 'The seller for this coupon is not active.' };
    }
    return { valid: true };
};

export const validateScopeProducts = async (scopeIds, sellerId, productModel) =>
{
    const products = await productModel.find({ _id: { $in: scopeIds } })
        .select('seller isDeleted')
        .lean();

    if (products.length !== scopeIds.length)
    {
        return { valid: false, code: 'INVALID_PRODUCT_IDS', message: 'One or more selected products do not exist.' };
    }

    const deleted = products.find((p) => p.isDeleted);
    if (deleted)
    {
        return { valid: false, code: 'PRODUCT_DELETED', message: 'One or more selected products have been deleted.' };
    }

    if (sellerId)
    {
        const mismatch = products.find(
            (p) => p.seller.toString() !== sellerId.toString()
        );
        if (mismatch)
        {
            return { valid: false, code: 'PRODUCT_SELLER_MISMATCH', message: 'All selected products must belong to the specified seller.' };
        }
    }

    return { valid: true };
};

export const validateScopeCategories = async (scopeIds, sellerId, categoryModel, productModel) =>
{
    const categories = await categoryModel.find({ _id: { $in: scopeIds } }).lean();
    if (categories.length !== scopeIds.length)
    {
        return { valid: false, code: 'INVALID_CATEGORY_IDS', message: 'One or more selected categories do not exist.' };
    }

    if (sellerId)
    {
        const sellerCategoryIds = await productModel.distinct('category', { seller: sellerId });
        const categorySet = new Set(sellerCategoryIds.map((id) => id.toString()));
        const invalid = scopeIds.find((id) => !categorySet.has(id.toString()));
        if (invalid)
        {
            return { valid: false, code: 'CATEGORY_SELLER_MISMATCH', message: 'All selected categories must have products by the specified seller.' };
        }
    }

    return { valid: true };
};

/**
 * Validates the coupon target type against the user's profile.
 * ALL_CUSTOMERS — always valid.
 * NEW_CUSTOMERS — user account created within the last 30 days.
 * EXISTING_CUSTOMERS — user has placed at least one order.
 * FIRST_TIME — user has never placed an order.
 */
export const validateTargetType = (coupon, user, userOrderCount = 0) =>
{
    const targetType = coupon.targetType || 'ALL_CUSTOMERS';

    if (targetType === 'ALL_CUSTOMERS')
    {
        return { valid: true };
    }

    if (!user)
    {
        return { valid: false, code: 'USER_NOT_FOUND', message: 'User not found for target validation.' };
    }

    if (targetType === 'NEW_CUSTOMERS')
    {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const createdAt = new Date(user.createdAt);
        if (createdAt >= thirtyDaysAgo)
        {
            return { valid: true };
        }
        return { valid: false, code: 'TARGET_NEW_CUSTOMERS_ONLY', message: 'This coupon is only for new customers.' };
    }

    if (targetType === 'EXISTING_CUSTOMERS')
    {
        if (userOrderCount > 0)
        {
            return { valid: true };
        }
        return { valid: false, code: 'TARGET_EXISTING_CUSTOMERS_ONLY', message: 'This coupon is only for existing customers.' };
    }

    if (targetType === 'FIRST_TIME')
    {
        if (userOrderCount === 0)
        {
            return { valid: true };
        }
        return { valid: false, code: 'TARGET_FIRST_TIME_ONLY', message: 'This coupon is only for first-time customers.' };
    }

    return { valid: true };
};

/**
 * Validates ORDER scope — applies to the entire order (always valid at cart level).
 */
export const validateScopeOrder = () =>
{
    return { valid: true };
};

/**
 * Validates SELLER_STORE scope — all cart items must belong to the coupon's seller.
 */
export const validateScopeSellerStore = async (coupon, productModel) =>
{
    if (!coupon.sellerId)
    {
        return { valid: false, code: 'SELLER_NOT_FOUND', message: 'Seller store coupon requires a seller.' };
    }

    const products = await productModel.find({ seller: coupon.sellerId, isDeleted: false })
        .select('_id')
        .lean();

    if (products.length === 0)
    {
        return { valid: false, code: 'SELLER_NO_PRODUCTS', message: 'The seller has no active products.' };
    }

    return { valid: true };
};

/**
 * Runs all eligibility checks for applying a coupon at the cart level.
 * Returns { valid, errors[] } where errors is an array of { code, message }.
 */
export const validateCouponEligibility = async ({
    coupon,
    user,
    cartSellingSum,
    sellerModel,
    productModel,
    categoryModel,
    userOrderCount = 0,
    segmentService = null,
    cartItemSellerIds = [],
} = {}) =>
{
    // Order 1-6: Cheap synchronous validation (fail-fast)
    const exists = validateCouponExists(coupon);
    if (!exists.valid) return { valid: false, errors: [exists] };

    const active = validateCouponActive(coupon);
    if (!active.valid) return { valid: false, errors: [active] };

    const expiry = validateCouponExpiry(coupon);
    if (!expiry.valid) return { valid: false, errors: [expiry] };

    const usage = validateUsageLimit(coupon);
    if (!usage.valid) return { valid: false, errors: [usage] };

    const userUsage = validateUserUsage(coupon, user);
    if (!userUsage.valid) return { valid: false, errors: [userUsage] };

    const minOrder = validateMinimumOrder(cartSellingSum, coupon.minimumOrderValue);
    if (!minOrder.valid) return { valid: false, errors: [minOrder] };

    // targetType validation: built-in types OR segment-based
    const targetType = coupon.targetType || 'ALL_CUSTOMERS';
    if (targetType.startsWith('SEGMENT_'))
    {
        if (targetType.endsWith('_SELLER'))
        {
            if (!segmentService || !segmentService.sellerMatchesSegment)
            {
                return { valid: false, errors: [{ code: 'SELLER_SEGMENT_SERVICE_UNAVAILABLE', message: 'Seller segmentation service is not available.' }] };
            }
            const { cartItemSellerIds } = params;
            if (!cartItemSellerIds || cartItemSellerIds.length === 0)
            {
                return { valid: false, errors: [{ code: 'NO_SELLERS_IN_CART', message: 'No sellers found in cart for seller segment validation.' }] };
            }
            const results = await Promise.all(
                cartItemSellerIds.map((sid) => segmentService.sellerMatchesSegment(sid, targetType))
            );
            const anyMatch = results.some(Boolean);
            if (!anyMatch)
            {
                return {
                    valid: false,
                    errors: [{ code: 'COUPON_SELLER_SEGMENT_MISMATCH', message: 'This coupon is not available for the sellers in your cart.' }],
                };
            }
        }
        else
        {
            if (!segmentService)
            {
                return { valid: false, errors: [{ code: 'SEGMENT_SERVICE_UNAVAILABLE', message: 'Segmentation service is not available.' }] };
            }
            const userId = user && (user._id || user.id);
            if (userId)
            {
                const matches = await segmentService.userMatchesSegment(userId, targetType);
                if (!matches)
                {
                    return {
                        valid: false,
                        errors: [{ code: 'COUPON_SEGMENT_MISMATCH', message: 'This coupon is not available for your customer segment.' }],
                    };
                }
            }
        }
    }
    else
    {
        const targetCheck = validateTargetType(coupon, user, userOrderCount);
        if (!targetCheck.valid) return { valid: false, errors: [targetCheck] };
    }

    // Order 7+: Expensive database-backed validation
    const errors = [];

    const sellerCheck = await validateSeller(coupon, sellerModel);
    if (!sellerCheck.valid) { errors.push(sellerCheck); return { valid: false, errors }; }

    if (coupon.scope === 'PRODUCT' && coupon.scopeIds && coupon.scopeIds.length > 0)
    {
        const productCheck = await validateScopeProducts(coupon.scopeIds, coupon.ownerType === 'SELLER' ? coupon.sellerId : null, productModel);
        if (!productCheck.valid) { errors.push(productCheck); return { valid: false, errors }; }
    }

    if (coupon.scope === 'CATEGORY' && coupon.scopeIds && coupon.scopeIds.length > 0)
    {
        const categoryCheck = await validateScopeCategories(coupon.scopeIds, coupon.ownerType === 'SELLER' ? coupon.sellerId : null, categoryModel, productModel);
        if (!categoryCheck.valid) { errors.push(categoryCheck); return { valid: false, errors }; }
    }

    if (coupon.scope === 'SELLER_STORE')
    {
        const storeCheck = await validateScopeSellerStore(coupon, productModel);
        if (!storeCheck.valid) { errors.push(storeCheck); return { valid: false, errors }; }
    }

    return { valid: true, errors: [] };
};
