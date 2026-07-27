import { mapBrand, mapBrands } from './brand.mapper.js';

export const createBrandController = ({ brandService }) =>
{
    const createBrand = async (req, res) =>
    {
        const files = {
            logo: req.files?.logo?.[0] || null,
            bannerImage: req.files?.bannerImage?.[0] || null,
        };
        const brandData = {
            ...req.body,
            createdBy: req.user.id,
            createdByModel: 'User',
        };
        const brand = await brandService.createBrand({ brandData, files });
        res.status(201).json({ success: true, data: mapBrand(brand) });
    };

    const getBrandById = async (req, res) =>
    {
        const brand = await brandService.getBrandById({ id: req.params.id });
        res.status(200).json({ success: true, data: mapBrand(brand) });
    };

    const getBrandBySlug = async (req, res) =>
    {
        const brand = await brandService.getBrandBySlug({ slug: req.params.slug });
        res.status(200).json({ success: true, data: mapBrand(brand) });
    };

    const getActiveBrands = async (req, res) =>
    {
        const { page, limit, search, categoryId } = req.query;
        const result = await brandService.getActiveBrands({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            search,
            categoryId,
        });
        res.status(200).json({ success: true, data: result });
    };

    const getFeaturedBrands = async (req, res) =>
    {
        const { limit } = req.query;
        const brands = await brandService.getFeaturedBrands({
            limit: limit ? parseInt(limit, 10) : 10,
        });
        res.status(200).json({ success: true, data: mapBrands(brands) });
    };

    const getAllBrands = async (req, res) =>
    {
        const { page, limit, search, isActive, isFeatured, isDeleted, sortBy, sortOrder } = req.query;
        const result = await brandService.getAllBrands({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            search,
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
            isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
            isDeleted: isDeleted !== undefined ? isDeleted === 'true' : undefined,
            sortBy,
            sortOrder,
        });
        res.status(200).json({ success: true, data: result });
    };

    const updateBrand = async (req, res) =>
    {
        const files = {
            logo: req.files?.logo?.[0] || null,
            bannerImage: req.files?.bannerImage?.[0] || null,
        };
        const brandData = {
            ...req.body,
            updatedBy: req.user.id,
            updatedByModel: 'User',
        };
        const brand = await brandService.updateBrand({
            id: req.params.id,
            updateData: brandData,
            files,
        });
        res.status(200).json({ success: true, data: mapBrand(brand) });
    };

    const updateBrandStatus = async (req, res) =>
    {
        const { isActive } = req.body;
        const brand = await brandService.updateBrandStatus({
            id: req.params.id,
            isActive,
        });
        res.status(200).json({ success: true, data: mapBrand(brand) });
    };

    const updateBrandFeatured = async (req, res) =>
    {
        const { isFeatured } = req.body;
        const brand = await brandService.updateBrandFeatured({
            id: req.params.id,
            isFeatured,
        });
        res.status(200).json({ success: true, data: mapBrand(brand) });
    };

    const updateDisplayOrder = async (req, res) =>
    {
        const { displayOrder } = req.body;
        const brand = await brandService.updateDisplayOrder({
            id: req.params.id,
            displayOrder,
        });
        res.status(200).json({ success: true, data: mapBrand(brand) });
    };

    const softDeleteBrand = async (req, res) =>
    {
        const result = await brandService.softDeleteBrand({ id: req.params.id });
        res.status(200).json(result);
    };

    const restoreBrand = async (req, res) =>
    {
        const result = await brandService.restoreBrand({ id: req.params.id });
        res.status(200).json(result);
    };

    const hardDeleteBrand = async (req, res) =>
    {
        const result = await brandService.hardDeleteBrand({ id: req.params.id });
        res.status(200).json(result);
    };

    const searchBrands = async (req, res) =>
    {
        const { query, page, limit } = req.query;
        const result = await brandService.searchBrands({
            query,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result });
    };

    const getBrandStats = async (req, res) =>
    {
        const stats = await brandService.getBrandStats();
        res.status(200).json({ success: true, data: stats });
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
