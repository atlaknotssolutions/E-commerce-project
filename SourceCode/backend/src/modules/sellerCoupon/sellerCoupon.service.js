import mongoose from 'mongoose';

export const createSellerCouponService = ({
    couponRepository,
    createApiError,
}) =>
{
    const validateDiscountFields = (data) =>
    {
        if (data.discountType === 'PERCENTAGE')
        {
            if (!data.discountPercentage && data.discountPercentage !== 0)
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'DISCOUNT_PERCENTAGE_REQUIRED',
                    message: 'Discount percentage is required for percentage-type coupons.',
                });
            }
            if (data.discountPercentage < 0 || data.discountPercentage > 100)
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'INVALID_DISCOUNT_PERCENTAGE',
                    message: 'Discount percentage must be between 0 and 100.',
                });
            }
        }
        else if (data.discountType === 'FLAT')
        {
            if (!data.discountValue && data.discountValue !== 0)
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'DISCOUNT_VALUE_REQUIRED',
                    message: 'Discount value is required for flat-type coupons.',
                });
            }
            if (data.discountValue < 0)
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'INVALID_DISCOUNT_VALUE',
                    message: 'Discount value cannot be negative.',
                });
            }
        }
    };

    const validateScopeAndSeller = async (payload) =>
    {
        if (payload.scope === 'PRODUCT' && payload.scopeIds && payload.scopeIds.length > 0)
        {
            const ProductModel = mongoose.model('Product');
            const products = await ProductModel.find({ _id: { $in: payload.scopeIds } })
                .select('seller')
                .lean();

            if (products.length !== payload.scopeIds.length)
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'INVALID_PRODUCT_IDS',
                    message: 'One or more selected products do not exist.',
                });
            }

            const invalidProduct = products.find(
                (p) => p.seller.toString() !== payload.sellerId.toString()
            );
            if (invalidProduct)
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'PRODUCT_SELLER_MISMATCH',
                    message: 'All selected products must belong to your store.',
                });
            }
        }

        if (payload.scope === 'CATEGORY' && payload.scopeIds && payload.scopeIds.length > 0)
        {
            const CategoryModel = mongoose.model('Category');
            const categories = await CategoryModel.find({ _id: { $in: payload.scopeIds } })
                .lean();

            if (categories.length !== payload.scopeIds.length)
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'INVALID_CATEGORY_IDS',
                    message: 'One or more selected categories do not exist.',
                });
            }

            const ProductModel = mongoose.model('Product');
            const sellerCategoryIds = await ProductModel.distinct('category', {
                seller: payload.sellerId,
            });
            const sellerCategorySet = new Set(sellerCategoryIds.map((id) => id.toString()));
            const invalidCategory = payload.scopeIds.find(
                (id) => !sellerCategorySet.has(id.toString())
            );
            if (invalidCategory)
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'CATEGORY_SELLER_MISMATCH',
                    message: 'All selected categories must have products from your store.',
                });
            }
        }

        const SellerModel = mongoose.model('Seller');
        const seller = await SellerModel.findById(payload.sellerId).lean();
        if (!seller)
        {
            throw createApiError({
                statusCode: 400,
                code: 'SELLER_NOT_FOUND',
                message: 'Seller account not found.',
            });
        }
    };

    const getCoupons = async ({ sellerId, page = 1, limit = 20, search, isActive, scope, targetType }) =>
    {
        return couponRepository.findAllWithFilters({
            page,
            limit,
            search,
            isActive,
            ownerType: 'SELLER',
            sellerId,
            scope,
            targetType,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    };

    const createCoupon = async (sellerId, couponData) =>
    {
        validateDiscountFields(couponData);

        const existing = await couponRepository.findByCode(couponData.code);
        if (existing)
        {
            throw createApiError({
                statusCode: 409,
                code: 'DUPLICATE_COUPON_CODE',
                message: `A coupon with code '${couponData.code.toUpperCase()}' already exists.`,
            });
        }

        const payload = {
            code: couponData.code.toUpperCase().trim(),
            name: couponData.name || '',
            description: couponData.description || '',
            discountType: couponData.discountType || 'PERCENTAGE',
            discountPercentage: couponData.discountType === 'FLAT' ? 0 : couponData.discountPercentage,
            discountValue: couponData.discountType === 'FLAT' ? couponData.discountValue : 0,
            maximumDiscount: couponData.maximumDiscount || 0,
            validityStartDate: couponData.validityStartDate,
            validityEndDate: couponData.validityEndDate,
            minimumOrderValue: couponData.minimumOrderValue || 0,
            usageLimit: couponData.usageLimit || 0,
            ownerType: 'SELLER',
            sellerId,
            scope: couponData.scope || 'ORDER',
            scopeIds: couponData.scopeIds || [],
            targetType: couponData.targetType || 'ALL_CUSTOMERS',
            priority: couponData.priority !== undefined ? couponData.priority : 0,
            stackable: couponData.stackable !== undefined ? couponData.stackable : false,
            metadata: couponData.metadata || {},
            isActive: couponData.isActive !== undefined ? couponData.isActive : true,
        };

        if (!payload.validityStartDate || !payload.validityEndDate)
        {
            throw createApiError({
                statusCode: 400,
                code: 'VALIDITY_DATES_REQUIRED',
                message: 'Validity start and end dates are required.',
            });
        }

        if (new Date(payload.validityEndDate) <= new Date(payload.validityStartDate))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_DATE_RANGE',
                message: 'Validity end date must be after the start date.',
            });
        }

        await validateScopeAndSeller(payload);

        return couponRepository.createCoupon(payload);
    };

    const updateCoupon = async (sellerId, couponId, updateData) =>
    {
        const existing = await couponRepository.findById(couponId);
        if (!existing)
        {
            throw createApiError({ statusCode: 404, code: 'COUPON_NOT_FOUND', message: 'Coupon not found.' });
        }
        if (existing.ownerType !== 'SELLER' || (existing.sellerId && existing.sellerId.toString() !== sellerId.toString()))
        {
            throw createApiError({ statusCode: 403, code: 'FORBIDDEN', message: 'You can only update your own coupons.' });
        }

        if (updateData.discountType) validateDiscountFields(updateData);

        const payload = { ...updateData };
        if (payload.code) payload.code = payload.code.toUpperCase().trim();

        return couponRepository.updateCoupon(couponId, payload);
    };

    const deleteCoupon = async (sellerId, couponId) =>
    {
        const existing = await couponRepository.findById(couponId);
        if (!existing)
        {
            throw createApiError({ statusCode: 404, code: 'COUPON_NOT_FOUND', message: 'Coupon not found.' });
        }
        if (existing.ownerType !== 'SELLER' || (existing.sellerId && existing.sellerId.toString() !== sellerId.toString()))
        {
            throw createApiError({ statusCode: 403, code: 'FORBIDDEN', message: 'You can only delete your own coupons.' });
        }

        await couponRepository.deleteCoupon(couponId);
        return { success: true, message: 'Coupon successfully deleted.' };
    };

    const enableCoupon = async (sellerId, couponId) =>
    {
        const existing = await couponRepository.findById(couponId);
        if (!existing) throw createApiError({ statusCode: 404, code: 'COUPON_NOT_FOUND', message: 'Coupon not found.' });
        if (existing.ownerType !== 'SELLER' || (existing.sellerId && existing.sellerId.toString() !== sellerId.toString()))
        {
            throw createApiError({ statusCode: 403, code: 'FORBIDDEN', message: 'You can only manage your own coupons.' });
        }
        if (existing.isActive) throw createApiError({ statusCode: 400, code: 'COUPON_ALREADY_ACTIVE', message: 'This coupon is already active.' });

        return couponRepository.updateCoupon(couponId, { isActive: true });
    };

    const disableCoupon = async (sellerId, couponId) =>
    {
        const existing = await couponRepository.findById(couponId);
        if (!existing) throw createApiError({ statusCode: 404, code: 'COUPON_NOT_FOUND', message: 'Coupon not found.' });
        if (existing.ownerType !== 'SELLER' || (existing.sellerId && existing.sellerId.toString() !== sellerId.toString()))
        {
            throw createApiError({ statusCode: 403, code: 'FORBIDDEN', message: 'You can only manage your own coupons.' });
        }
        if (!existing.isActive) throw createApiError({ statusCode: 400, code: 'COUPON_ALREADY_DISABLED', message: 'This coupon is already disabled.' });

        return couponRepository.updateCoupon(couponId, { isActive: false });
    };

    return Object.freeze({
        getCoupons,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        enableCoupon,
        disableCoupon,
    });
};
