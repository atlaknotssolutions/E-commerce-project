/**
 * Pure function-based factory representing the Brand Business Service layer.
 * Implements loose coupling architectures by accepting repository instances as parameters.
 */
export const createBrandService = ({
    brandRepository,
    productRepository,
    cloudinaryClient,
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

    const ensureUniqueSlug = async (name, excludeId = null) =>
    {
        const baseSlug = buildSlug(name);
        let candidateSlug = baseSlug;
        let counter = 1;

        while (true)
        {
            const existing = await brandRepository.findBySlug(candidateSlug);
            const isDuplicate = existing && (!excludeId || existing._id.toString() !== excludeId.toString());
            if (!isDuplicate) break;
            candidateSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        return candidateSlug;
    };

    const ensureUniqueName = async (name, excludeId = null) =>
    {
        const existing = await brandRepository.findByNameExact(name, excludeId);
        if (existing)
        {
            throw createApiError({
                statusCode: 409,
                code: 'DUPLICATE_BRAND_NAME',
                message: `A brand with the name "${name}" already exists.`,
            });
        }
    };

    const uploadBrandImage = async (file, folder) =>
    {
        if (!file?.buffer) return null;
        const targetFolder = `AI_knots_Commerce/brands/${folder}`;
        const uploaded = await cloudinaryClient.uploadImageBuffer(file.buffer, targetFolder);
        return uploaded.secureUrl;
    };

    const createBrand = async ({ brandData, files = {} }) =>
    {
        const name = brandData.name?.trim();
        if (!name)
        {
            throw createApiError({
                statusCode: 400,
                code: 'NAME_REQUIRED',
                message: 'Brand name is required.',
            });
        }

        await ensureUniqueName(name);

        const slug = await ensureUniqueSlug(name);

        let logo = brandData.logo || '';
        let bannerImage = brandData.bannerImage || '';

        if (files.logo)
        {
            logo = await uploadBrandImage(files.logo, 'logos');
        }
        if (files.bannerImage)
        {
            bannerImage = await uploadBrandImage(files.bannerImage, 'banners');
        }

        return brandRepository.create({
            ...brandData,
            name,
            slug,
            logo,
            bannerImage,
        });
    };

    const getBrandById = async ({ id }) =>
    {
        const brand = await brandRepository.findById(id);
        if (!brand)
        {
            throw createApiError({
                statusCode: 404,
                code: 'BRAND_NOT_FOUND',
                message: 'Brand not found.',
            });
        }
        return brand;
    };

    const getBrandBySlug = async ({ slug }) =>
    {
        const brand = await brandRepository.findBySlug(slug);
        if (!brand)
        {
            throw createApiError({
                statusCode: 404,
                code: 'BRAND_NOT_FOUND',
                message: 'Brand not found.',
            });
        }
        return brand;
    };

    const getActiveBrands = async ({ page, limit, search, categoryId } = {}) =>
    {
        return brandRepository.findActive({ page, limit, search, categoryId });
    };

    const getFeaturedBrands = async ({ limit } = {}) =>
    {
        return brandRepository.findFeatured({ limit });
    };

    const getAllBrands = async ({ page, limit, search, isActive, isFeatured, isDeleted, sortBy, sortOrder } = {}) =>
    {
        return brandRepository.findAll({ page, limit, search, isActive, isFeatured, isDeleted, sortBy, sortOrder });
    };

    const updateBrand = async ({ id, updateData, files = {} }) =>
    {
        const brand = await brandRepository.findById(id);
        if (!brand)
        {
            throw createApiError({
                statusCode: 404,
                code: 'BRAND_NOT_FOUND',
                message: 'Brand not found.',
            });
        }

        if (brand.isDeleted)
        {
            throw createApiError({
                statusCode: 400,
                code: 'BRAND_DELETED',
                message: 'Cannot update a deleted brand. Restore it first.',
            });
        }

        if (updateData.name && updateData.name.trim() !== brand.name)
        {
            await ensureUniqueName(updateData.name.trim(), id);
            updateData.slug = await ensureUniqueSlug(updateData.name.trim(), id);
            updateData.name = updateData.name.trim();
        }

        if (files.logo)
        {
            updateData.logo = await uploadBrandImage(files.logo, 'logos');
        }
        if (files.bannerImage)
        {
            updateData.bannerImage = await uploadBrandImage(files.bannerImage, 'banners');
        }

        return brandRepository.update(id, updateData);
    };

    const updateBrandStatus = async ({ id, isActive }) =>
    {
        const brand = await brandRepository.findById(id);
        if (!brand)
        {
            throw createApiError({
                statusCode: 404,
                code: 'BRAND_NOT_FOUND',
                message: 'Brand not found.',
            });
        }
        if (brand.isDeleted)
        {
            throw createApiError({
                statusCode: 400,
                code: 'BRAND_DELETED',
                message: 'Cannot modify a deleted brand.',
            });
        }
        return brandRepository.updateStatus(id, isActive);
    };

    const updateBrandFeatured = async ({ id, isFeatured }) =>
    {
        const brand = await brandRepository.findById(id);
        if (!brand)
        {
            throw createApiError({
                statusCode: 404,
                code: 'BRAND_NOT_FOUND',
                message: 'Brand not found.',
            });
        }
        if (brand.isDeleted)
        {
            throw createApiError({
                statusCode: 400,
                code: 'BRAND_DELETED',
                message: 'Cannot modify a deleted brand.',
            });
        }
        return brandRepository.updateFeatured(id, isFeatured);
    };

    const updateDisplayOrder = async ({ id, displayOrder }) =>
    {
        const brand = await brandRepository.findById(id);
        if (!brand)
        {
            throw createApiError({
                statusCode: 404,
                code: 'BRAND_NOT_FOUND',
                message: 'Brand not found.',
            });
        }
        return brandRepository.updateDisplayOrder(id, displayOrder);
    };

    const softDeleteBrand = async ({ id }) =>
    {
        const brand = await brandRepository.findById(id);
        if (!brand)
        {
            throw createApiError({
                statusCode: 404,
                code: 'BRAND_NOT_FOUND',
                message: 'Brand not found.',
            });
        }
        if (brand.isDeleted)
        {
            throw createApiError({
                statusCode: 400,
                code: 'BRAND_ALREADY_DELETED',
                message: 'Brand is already deleted.',
            });
        }

        const productCount = await brandRepository.countProducts(id);
        if (productCount > 0)
        {
            throw createApiError({
                statusCode: 400,
                code: 'BRAND_HAS_PRODUCTS',
                message: `Cannot delete brand "${brand.name}". It is referenced by ${productCount} product(s). Remove the brand from all products first.`,
            });
        }

        await brandRepository.softDelete(id);

        return { success: true, message: `Brand "${brand.name}" has been deleted.` };
    };

    const restoreBrand = async ({ id }) =>
    {
        const brand = await brandRepository.findById(id);
        if (!brand)
        {
            throw createApiError({
                statusCode: 404,
                code: 'BRAND_NOT_FOUND',
                message: 'Brand not found.',
            });
        }
        if (!brand.isDeleted)
        {
            throw createApiError({
                statusCode: 400,
                code: 'BRAND_NOT_DELETED',
                message: 'Brand is not deleted.',
            });
        }

        await brandRepository.restore(id);

        return { success: true, message: `Brand "${brand.name}" has been restored.` };
    };

    const hardDeleteBrand = async ({ id }) =>
    {
        const brand = await brandRepository.findById(id);
        if (!brand)
        {
            throw createApiError({
                statusCode: 404,
                code: 'BRAND_NOT_FOUND',
                message: 'Brand not found.',
            });
        }

        const productCount = await brandRepository.countProducts(id);
        if (productCount > 0)
        {
            throw createApiError({
                statusCode: 400,
                code: 'BRAND_HAS_PRODUCTS',
                message: `Cannot delete brand "${brand.name}". It is referenced by ${productCount} product(s). Remove the brand from all products first.`,
            });
        }

        await brandRepository.hardDelete(id);

        return { success: true, message: `Brand "${brand.name}" has been permanently deleted.` };
    };

    const searchBrands = async ({ query, page, limit } = {}) =>
    {
        return brandRepository.search({ query, page, limit });
    };

    const getBrandStats = async () =>
    {
        return brandRepository.getStats();
    };

    return Object.freeze({
        createBrand,
        getBrandById,
        getBrandBySlug,
        getActiveBrands,
        getFeaturedBrands,
        getAllBrands,
        updateBrand,
        updateBrandStatus,
        updateBrandFeatured,
        updateDisplayOrder,
        softDeleteBrand,
        restoreBrand,
        hardDeleteBrand,
        searchBrands,
        getBrandStats,
    });
};
