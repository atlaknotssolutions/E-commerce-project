export const createCommissionController = ({ commissionService }) => {
    const calculateCommission = async (req, res) => {
        const commission = await commissionService.calculateCommission({
            orderId: req.params.orderId,
        });
        res.status(201).json({ success: true, data: commission });
    };

    const getCommission = async (req, res) => {
        const commission = await commissionService.getCommission(req.params.id);
        res.status(200).json({ success: true, data: commission });
    };

    const approveCommission = async (req, res) => {
        const commission = await commissionService.approveCommission(req.params.id);
        res.status(200).json({ success: true, data: commission });
    };

    const settleCommission = async (req, res) => {
        const commission = await commissionService.settleCommission(req.params.id);
        res.status(200).json({ success: true, data: commission });
    };

    const cancelCommission = async (req, res) => {
        const commission = await commissionService.cancelCommission(req.params.id);
        res.status(200).json({ success: true, data: commission });
    };

    const getAllCommissions = async (req, res) => {
        const { status, seller, search, startDate, endDate, page, limit } = req.query;
        const result = await commissionService.getAllCommissions({
            status,
            seller,
            search,
            startDate,
            endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result.commissions, pagination: result.pagination });
    };

    const getCommissionStats = async (req, res) => {
        const stats = await commissionService.getCommissionStats();
        res.status(200).json({ success: true, data: stats });
    };

    const getSellerCommissions = async (req, res) => {
        const { status, search, page, limit } = req.query;
        const sellerId = req.user.id;
        const result = await commissionService.getSellerCommissions(sellerId, {
            status,
            search,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result.commissions, pagination: result.pagination });
    };

    const getSellerCommissionStats = async (req, res) => {
        const sellerId = req.user.id;
        const stats = await commissionService.getSellerCommissionStats(sellerId);
        res.status(200).json({ success: true, data: stats });
    };

    return Object.freeze({
        calculateCommission,
        getCommission,
        approveCommission,
        settleCommission,
        cancelCommission,
        getAllCommissions,
        getCommissionStats,
        getSellerCommissions,
        getSellerCommissionStats,
    });
};
