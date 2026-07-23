import { MAX_CATEGORY_DEPTH } from '../../constants/enums.js';

export const createCategoryRequestService = ({
    categoryRequestRepository,
    categoryRepository,
    notificationService,
    createApiError,
}) => {
    const createRequest = async ({ sellerId, requestedName, parentCategory, reason }) => {
        if (!requestedName?.trim()) {
            throw createApiError({
                statusCode: 400,
                code: 'NAME_REQUIRED',
                message: 'Requested category name is required.',
            });
        }

        let requestedLevel = 1;
        if (parentCategory) {
            const parent = await categoryRepository.findById(parentCategory);
            if (!parent) {
                throw createApiError({
                    statusCode: 404,
                    code: 'PARENT_NOT_FOUND',
                    message: 'Selected parent category not found.',
                });
            }
            if (parent.level >= MAX_CATEGORY_DEPTH) {
                throw createApiError({
                    statusCode: 400,
                    code: 'CATEGORY_LEVEL_LIMIT',
                    message: `Maximum category depth is ${MAX_CATEGORY_DEPTH}.`,
                });
            }
            requestedLevel = parent.level + 1;
        }

        const existing = await categoryRequestRepository.findDuplicate({
            sellerId,
            requestedName: requestedName.trim(),
            parentCategory: parentCategory || null,
        });
        if (existing) {
            throw createApiError({
                statusCode: 409,
                code: 'CATEGORY_REQUEST_ALREADY_EXISTS',
                message: 'This category has already been requested.',
            });
        }

        return categoryRequestRepository.create({
            seller: sellerId,
            requestedName: requestedName.trim(),
            parentCategory: parentCategory || null,
            requestedLevel,
            reason: reason?.trim() || '',
        });
    };

    const getSellerRequests = async ({ sellerId }) => {
        return categoryRequestRepository.findBySellerId(sellerId);
    };

    const getAllRequests = async ({ status, search } = {}) => {
        return categoryRequestRepository.findAll({ status, search });
    };

    const getRequestById = async ({ id }) => {
        const request = await categoryRequestRepository.findById(id);
        if (!request) {
            throw createApiError({
                statusCode: 404,
                code: 'REQUEST_NOT_FOUND',
                message: 'Category request not found.',
            });
        }
        return request;
    };

    const approveRequest = async ({ id, approvedBy }) => {
        const request = await categoryRequestRepository.findById(id);
        if (!request) {
            throw createApiError({
                statusCode: 404,
                code: 'REQUEST_NOT_FOUND',
                message: 'Category request not found.',
            });
        }
        if (request.status !== 'PENDING') {
            throw createApiError({
                statusCode: 400,
                code: 'ALREADY_PROCESSED',
                message: `This request has already been ${request.status.toLowerCase()}.`,
            });
        }

        const categoryId = request.requestedName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');

        const existing = await categoryRepository.findByCategoryId(categoryId);
        if (existing) {
            throw createApiError({
                statusCode: 409,
                code: 'CATEGORY_ALREADY_EXISTS',
                message: `Category "${request.requestedName}" already exists.`,
            });
        }

        let level = 1;
        let parentCategory = null;
        if (request.parentCategory) {
            const parent = await categoryRepository.findById(request.parentCategory);
            if (!parent) {
                throw createApiError({
                    statusCode: 404,
                    code: 'PARENT_NOT_FOUND',
                    message: 'Referenced parent category no longer exists.',
                });
            }
            if (parent.level >= MAX_CATEGORY_DEPTH) {
                throw createApiError({
                    statusCode: 400,
                    code: 'CATEGORY_LEVEL_LIMIT',
                    message: 'Cannot create category. Maximum depth reached.',
                });
            }
            level = parent.level + 1;
            parentCategory = request.parentCategory;
        }

        await categoryRepository.createCategory({
            name: request.requestedName.trim(),
            categoryId,
            parentCategory,
            level,
            isActive: true,
        });

        const updated = await categoryRequestRepository.updateById(id, {
            status: 'APPROVED',
            requestedLevel: level,
            approvedBy,
            approvedAt: new Date(),
        });

        try {
            const message = `Your category request "${request.requestedName}" has been approved. You can now list products.`;
            await notificationService.createNotification({
                customerId: request.seller?._id || request.seller,
                message,
            });
        } catch (_) { }

        return updated;
    };

    const rejectRequest = async ({ id, rejectionReason, rejectedBy }) => {
        const request = await categoryRequestRepository.findById(id);
        if (!request) {
            throw createApiError({
                statusCode: 404,
                code: 'REQUEST_NOT_FOUND',
                message: 'Category request not found.',
            });
        }
        if (request.status !== 'PENDING') {
            throw createApiError({
                statusCode: 400,
                code: 'ALREADY_PROCESSED',
                message: `This request has already been ${request.status.toLowerCase()}.`,
            });
        }

        const updated = await categoryRequestRepository.updateById(id, {
            status: 'REJECTED',
            rejectionReason: rejectionReason?.trim() || null,
            rejectedBy,
            rejectedAt: new Date(),
        });

        try {
            const reasonText = rejectionReason?.trim()
                ? ` Reason: ${rejectionReason.trim()}`
                : '';
            const message = `Your request for "${request.requestedName}" was rejected.${reasonText}`;
            await notificationService.createNotification({
                customerId: request.seller?._id || request.seller,
                message,
            });
        } catch (_) { }

        return updated;
    };

    return Object.freeze({
        createRequest,
        getSellerRequests,
        getAllRequests,
        getRequestById,
        approveRequest,
        rejectRequest,
    });
};
