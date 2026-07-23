export const createCategoryRequestController = ({
    categoryRequestService,
    asyncHandler,
}) => {
    const createRequest = async (req, res) => {
        const { requestedName, parentCategory, reason } = req.body;
        const request = await categoryRequestService.createRequest({
            sellerId: req.user.id,
            requestedName,
            parentCategory,
            reason,
        });
        return res.status(201).json({
            success: true,
            message: 'Category request submitted successfully.',
            data: request,
        });
    };

    const getMyRequests = async (req, res) => {
        const requests = await categoryRequestService.getSellerRequests({
            sellerId: req.user.id,
        });
        return res.status(200).json({
            success: true,
            data: requests,
        });
    };

    const getAllRequests = async (req, res) => {
        const { status, search } = req.query;
        const requests = await categoryRequestService.getAllRequests({ status, search });
        return res.status(200).json({
            success: true,
            data: requests,
        });
    };

    const getRequestById = async (req, res) => {
        const request = await categoryRequestService.getRequestById({ id: req.params.id });
        return res.status(200).json({
            success: true,
            data: request,
        });
    };

    const approveRequest = async (req, res) => {
        const request = await categoryRequestService.approveRequest({
            id: req.params.id,
            approvedBy: req.user.id,
        });
        return res.status(200).json({
            success: true,
            message: 'Category request approved. Category created successfully.',
            data: request,
        });
    };

    const rejectRequest = async (req, res) => {
        const { rejectionReason } = req.body;
        const request = await categoryRequestService.rejectRequest({
            id: req.params.id,
            rejectionReason,
            rejectedBy: req.user.id,
        });
        return res.status(200).json({
            success: true,
            message: 'Category request rejected.',
            data: request,
        });
    };

    return Object.freeze({
        createRequest,
        getMyRequests,
        getAllRequests,
        getRequestById,
        approveRequest,
        rejectRequest,
    });
};
