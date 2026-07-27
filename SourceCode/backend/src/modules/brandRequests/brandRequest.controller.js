import { mapBrandRequest, mapBrandRequests } from './brandRequest.mapper.js';

export const createBrandRequestController = ({
    brandRequestService,
    asyncHandler,
}) =>
{
    const createRequest = async (req, res) =>
    {
        const { name, description, website, logo, categoryId } = req.body;
        const request = await brandRequestService.createRequest({
            sellerId: req.user.id,
            name,
            description,
            website,
            logo,
            categoryId,
        });
        return res.status(201).json({
            success: true,
            message: 'Brand request submitted successfully.',
            data: mapBrandRequest(request),
        });
    };

    const getMyRequests = async (req, res) =>
    {
        const requests = await brandRequestService.getSellerRequests({
            sellerId: req.user.id,
        });
        return res.status(200).json({
            success: true,
            data: mapBrandRequests(requests),
        });
    };

    const getAllRequests = async (req, res) =>
    {
        const { status, search } = req.query;
        const requests = await brandRequestService.getAllRequests({ status, search });
        return res.status(200).json({
            success: true,
            data: requests,
        });
    };

    const getRequestById = async (req, res) =>
    {
        const request = await brandRequestService.getRequestById({ id: req.params.id });
        return res.status(200).json({
            success: true,
            data: mapBrandRequest(request),
        });
    };

    const approveRequest = async (req, res) =>
    {
        const request = await brandRequestService.approveRequest({
            id: req.params.id,
            approvedBy: req.user.id,
        });
        return res.status(200).json({
            success: true,
            message: 'Brand request approved. Brand created successfully.',
            data: mapBrandRequest(request),
        });
    };

    const rejectRequest = async (req, res) =>
    {
        const { rejectionReason } = req.body;
        const request = await brandRequestService.rejectRequest({
            id: req.params.id,
            rejectionReason,
            rejectedBy: req.user.id,
        });
        return res.status(200).json({
            success: true,
            message: 'Brand request rejected.',
            data: mapBrandRequest(request),
        });
    };

    const countPendingRequests = async (req, res) =>
    {
        const count = await brandRequestService.countPendingRequests();
        return res.status(200).json({
            success: true,
            data: { pendingCount: count },
        });
    };

    return Object.freeze({
        createRequest,
        getMyRequests,
        getAllRequests,
        getRequestById,
        approveRequest,
        rejectRequest,
        countPendingRequests,
    });
};
