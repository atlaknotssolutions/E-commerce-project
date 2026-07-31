export const createBrandRequestService = ({
    brandRequestRepository,
    brandRepository,
    categoryRepository,
    notificationService,
    createApiError,
}) =>
{
    const buildSlug = (name) =>
    {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const createRequest = async ({ sellerId, name, description, website, logo, categoryId }) =>
    {
        if (!name?.trim())
        {
            throw createApiError({
                statusCode: 400,
                code: 'NAME_REQUIRED',
                message: 'Brand name is required.',
            });
        }

        const trimmedName = name.trim();

        const existingBrand = await brandRepository.findByNameExact(trimmedName);
        if (existingBrand)
        {
            throw createApiError({
                statusCode: 409,
                code: 'BRAND_ALREADY_EXISTS',
                message: `A brand with the name "${trimmedName}" already exists.`,
            });
        }

        const duplicateRequest = await brandRequestRepository.findDuplicate({
            sellerId,
            name: trimmedName,
        });
        if (duplicateRequest)
        {
            throw createApiError({
                statusCode: 409,
                code: 'BRAND_REQUEST_ALREADY_EXISTS',
                message: 'You have already submitted a request for this brand name.',
            });
        }

        if (categoryId)
        {
            const category = await categoryRepository.findById(categoryId);
            if (!category)
            {
                throw createApiError({
                    statusCode: 404,
                    code: 'CATEGORY_NOT_FOUND',
                    message: 'Referenced category not found.',
                });
            }
        }

        return brandRequestRepository.create({
            requestedBy: sellerId,
            name: trimmedName,
            description: description?.trim() || '',
            website: website?.trim() || '',
            logo: logo || '',
            categoryId: categoryId || null,
        });
    };

    const getSellerRequests = async ({ sellerId }) =>
    {
        return brandRequestRepository.findBySellerId(sellerId);
    };

    const getAllRequests = async ({ status, search } = {}) =>
    {
        return brandRequestRepository.findAll({ status, search });
    };

    const getRequestById = async ({ id }) =>
    {
        const request = await brandRequestRepository.findById(id);
        if (!request)
        {
            throw createApiError({
                statusCode: 404,
                code: 'REQUEST_NOT_FOUND',
                message: 'Brand request not found.',
            });
        }
        return request;
    };

    const approveRequest = async ({ id, approvedBy }) =>
    {
        const request = await brandRequestRepository.findById(id);
        if (!request)
        {
            throw createApiError({
                statusCode: 404,
                code: 'REQUEST_NOT_FOUND',
                message: 'Brand request not found.',
            });
        }
        if (request.status !== 'PENDING')
        {
            throw createApiError({
                statusCode: 400,
                code: 'ALREADY_PROCESSED',
                message: `This request has already been ${request.status.toLowerCase()}.`,
            });
        }

        const existingBrand = await brandRepository.findByNameExact(request.name);
        if (existingBrand)
        {
            throw createApiError({
                statusCode: 409,
                code: 'BRAND_NOW_EXISTS',
                message: `A brand with the name "${request.name}" already exists. Reject this request.`,
            });
        }

        const slug = await (async () =>
        {
            const baseSlug = buildSlug(request.name);
            let candidateSlug = baseSlug;
            let counter = 1;
            while (true)
            {
                const existing = await brandRepository.findBySlug(candidateSlug);
                if (!existing) break;
                candidateSlug = `${baseSlug}-${counter}`;
                counter++;
            }
            return candidateSlug;
        })();

        const newBrand = await brandRepository.create({
            name: request.name.trim(),
            slug,
            description: request.description || '',
            logo: request.logo || '',
            website: request.website || '',
            categoryId: request.categoryId ? [request.categoryId] : [],
            isActive: true,
            isFeatured: false,
            displayOrder: 0,
            createdBy: approvedBy,
            createdByModel: 'User',
        });

        const updated = await brandRequestRepository.updateById(id, {
            status: 'APPROVED',
            approvedBy,
            approvedAt: new Date(),
        });

        try
        {
            const message = `Your brand request "${request.name}" has been approved. You can now use it for products.`;
            await notificationService.createNotification({
                customerId: request.seller?._id || request.seller,
                message,
            });
        }
        catch (_) { }

        return updated;
    };

    const rejectRequest = async ({ id, rejectionReason, rejectedBy }) =>
    {
        const request = await brandRequestRepository.findById(id);
        if (!request)
        {
            throw createApiError({
                statusCode: 404,
                code: 'REQUEST_NOT_FOUND',
                message: 'Brand request not found.',
            });
        }
        if (request.status !== 'PENDING')
        {
            throw createApiError({
                statusCode: 400,
                code: 'ALREADY_PROCESSED',
                message: `This request has already been ${request.status.toLowerCase()}.`,
            });
        }

        const updated = await brandRequestRepository.updateById(id, {
            status: 'REJECTED',
            rejectionReason: rejectionReason?.trim() || null,
            rejectedBy,
            rejectedAt: new Date(),
        });

        try
        {
            const reasonText = rejectionReason?.trim()
                ? ` Reason: ${rejectionReason.trim()}`
                : '';
            const message = `Your brand request "${request.name}" was rejected.${reasonText}`;
            await notificationService.createNotification({
                customerId: request.seller?._id || request.seller,
                message,
            });
        }
        catch (_) { }

        return updated;
    };

    const countPendingRequests = async () =>
    {
        return brandRequestRepository.countPending();
    };

    return Object.freeze({
        createRequest,
        getSellerRequests,
        getAllRequests,
        getRequestById,
        approveRequest,
        rejectRequest,
        countPendingRequests,
    });
};
