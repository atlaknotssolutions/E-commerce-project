/**
 * Pure function-based factory representing the Admin Coupon Business Service layer.
 * Coordinates admin-only coupon CRUD, activation, and analytics.
 * Reuses existing couponRepository — no duplication.
 */
import mongoose from 'mongoose';

export const createAdminCouponService = ({
    couponRepository,
    notificationService,
    createApiError,
}) =>
{

    /**
     * Validates discount fields based on discount type.
     */
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

    /**
     * Retrieves all coupons with search, filters, and pagination.
     * Supports enterprise fields: scope, targetType.
     */
    const getAllCoupons = async (opts) =>
    {
        return couponRepository.findAllWithFilters(opts);
    };

    /**
     * Retrieves a single coupon by ID.
     */
    const getCouponById = async (couponId) =>
    {
        const coupon = await couponRepository.findById(couponId);
        if (!coupon)
        {
            throw createApiError({
                statusCode: 404,
                code: 'COUPON_NOT_FOUND',
                message: 'The requested coupon does not exist.',
            });
        }
        return coupon;
    };

    /**
     * Creates a new coupon with validation.
     */
    const createCoupon = async (couponData) =>
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
            ownerType: couponData.ownerType || 'PLATFORM',
            sellerId: couponData.sellerId || null,
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

        // Validate scopeIds against seller ownership
        await validateScopeAndSeller(payload);

        return couponRepository.createCoupon(payload);
    };

    /**
     * Validates scopeIds and seller ownership for coupon creation/update.
     */
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

            if (payload.ownerType === 'SELLER' && payload.sellerId)
            {
                const invalidProduct = products.find(
                    (p) => p.seller.toString() !== payload.sellerId.toString()
                );
                if (invalidProduct)
                {
                    throw createApiError({
                        statusCode: 400,
                        code: 'PRODUCT_SELLER_MISMATCH',
                        message: 'All selected products must belong to the selected seller.',
                    });
                }
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

            if (payload.ownerType === 'SELLER' && payload.sellerId)
            {
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
                        message: 'All selected categories must have products by the selected seller.',
                    });
                }
            }
        }

        if (payload.ownerType === 'SELLER' && payload.sellerId)
        {
            const SellerModel = mongoose.model('Seller');
            const seller = await SellerModel.findById(payload.sellerId).lean();
            if (!seller)
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'SELLER_NOT_FOUND',
                    message: 'The selected seller does not exist.',
                });
            }
        }
    };

    /**
     * Updates an existing coupon with validation.
     */
    const updateCoupon = async (couponId, updateData) =>
    {
        const existing = await couponRepository.findById(couponId);
        if (!existing)
        {
            throw createApiError({
                statusCode: 404,
                code: 'COUPON_NOT_FOUND',
                message: 'The requested coupon does not exist.',
            });
        }

        if (updateData.discountType)
        {
            validateDiscountFields(updateData);
        }

        if (updateData.code && updateData.code.toUpperCase() !== existing.code)
        {
            const duplicate = await couponRepository.findByCode(updateData.code);
            if (duplicate)
            {
                throw createApiError({
                    statusCode: 409,
                    code: 'DUPLICATE_COUPON_CODE',
                    message: `A coupon with code '${updateData.code.toUpperCase()}' already exists.`,
                });
            }
        }

        const payload = { ...updateData };
        if (payload.code) payload.code = payload.code.toUpperCase().trim();
        if (payload.discountType === 'FLAT')
        {
            payload.discountPercentage = 0;
        }
        else if (payload.discountType === 'PERCENTAGE')
        {
            payload.discountValue = 0;
        }

        return couponRepository.updateCoupon(couponId, payload);
    };

    /**
     * Deletes a coupon by ID.
     */
    const deleteCoupon = async (couponId) =>
    {
        const deleted = await couponRepository.deleteCoupon(couponId);
        if (!deleted)
        {
            throw createApiError({
                statusCode: 404,
                code: 'COUPON_NOT_FOUND',
                message: 'Deletion failed. The requested coupon was not found.',
            });
        }
        return { success: true, message: 'Coupon successfully deleted.' };
    };

    /**
     * Enables a coupon (sets isActive to true).
     */
    const enableCoupon = async (couponId) =>
    {
        const coupon = await couponRepository.findById(couponId);
        if (!coupon)
        {
            throw createApiError({
                statusCode: 404,
                code: 'COUPON_NOT_FOUND',
                message: 'The requested coupon does not exist.',
            });
        }

        if (coupon.isActive)
        {
            throw createApiError({
                statusCode: 400,
                code: 'COUPON_ALREADY_ACTIVE',
                message: 'This coupon is already active.',
            });
        }

        return couponRepository.updateCoupon(couponId, { isActive: true });
    };

    /**
     * Disables a coupon (sets isActive to false).
     */
    const disableCoupon = async (couponId) =>
    {
        const coupon = await couponRepository.findById(couponId);
        if (!coupon)
        {
            throw createApiError({
                statusCode: 404,
                code: 'COUPON_NOT_FOUND',
                message: 'The requested coupon does not exist.',
            });
        }

        if (!coupon.isActive)
        {
            throw createApiError({
                statusCode: 400,
                code: 'COUPON_ALREADY_DISABLED',
                message: 'This coupon is already disabled.',
            });
        }

        return couponRepository.updateCoupon(couponId, { isActive: false });
    };

    /**
     * Returns coupons belonging to a specific seller.
     */
    const getSellerCoupons = async ({ sellerId, page = 1, limit = 20, search, isActive, scope, targetType }) =>
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

    /**
     * Seller creates a new coupon (ownerType forced to SELLER).
     */
    const createSellerCoupon = async (sellerId, couponData) =>
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

    /**
     * Seller updates their own coupon (ownership guard).
     */
    const updateSellerCoupon = async (sellerId, couponId, updateData) =>
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

    /**
     * Seller deletes their own coupon (ownership guard).
     */
    const deleteSellerCoupon = async (sellerId, couponId) =>
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

        const deleted = await couponRepository.deleteCoupon(couponId);
        return { success: true, message: 'Coupon successfully deleted.' };
    };

    /**
     * Seller enables their own coupon (ownership guard).
     */
    const enableSellerCoupon = async (sellerId, couponId) =>
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

    /**
     * Seller disables their own coupon (ownership guard).
     */
    const disableSellerCoupon = async (sellerId, couponId) =>
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

    /**
     * Returns coupon statistics for admin dashboard.
     */
    const getCouponStatistics = async () =>
    {
        const [statusCounts, usageStats, mostUsed] = await Promise.all([
            couponRepository.countByStatus(),
            couponRepository.getUsageStats(),
            couponRepository.findMostUsedCoupon(),
        ]);

        return {
            ...statusCounts,
            totalUsageCount: usageStats.totalUsageCount,
            avgUsageCount: Math.round(usageStats.avgUsageCount * 10) / 10,
            mostUsedCoupon: mostUsed
                ? { code: mostUsed.code, usageCount: mostUsed.usageCount }
                : null,
        };
    };

    /**
     * Returns usage details for a specific coupon.
     */
    const getCouponUsage = async (couponId) =>
    {
        const usage = await couponRepository.findUsageById(couponId);
        if (!usage)
        {
            throw createApiError({
                statusCode: 404,
                code: 'COUPON_NOT_FOUND',
                message: 'The requested coupon does not exist.',
            });
        }
        return usage;
    };

    return Object.freeze({
        getAllCoupons,
        getCouponById,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        enableCoupon,
        disableCoupon,
        getCouponStatistics,
        getCouponUsage,
        getSellerCoupons,
        createSellerCoupon,
        updateSellerCoupon,
        deleteSellerCoupon,
        enableSellerCoupon,
        disableSellerCoupon,
    });
};
