export const createPayoutController = ({ payoutService }) => {
    const requestPayout = async (req, res) => {
        const { amount } = req.body;
        const sellerId = req.user.id;
        const payout = await payoutService.requestPayout({ sellerId, amount: parseFloat(amount) });
        res.status(201).json({ success: true, data: payout });
    };

    const approvePayout = async (req, res) => {
        const adminId = req.user.id;
        const payout = await payoutService.approvePayout(req.params.id, adminId);
        res.status(200).json({ success: true, data: payout });
    };

    const rejectPayout = async (req, res) => {
        const { reason } = req.body;
        const payout = await payoutService.rejectPayout(req.params.id, reason);
        res.status(200).json({ success: true, data: payout });
    };

    const disbursePayout = async (req, res) => {
        const payout = await payoutService.executeGatewayPayout(req.params.id);
        res.status(200).json({ success: true, data: payout });
    };

    const getPayout = async (req, res) => {
        const payout = await payoutService.getPayout(req.params.id);
        res.status(200).json({ success: true, data: payout });
    };

    const getAvailableBalance = async (req, res) => {
        const sellerId = req.user.id;
        const balance = await payoutService.getAvailableBalance(sellerId);
        res.status(200).json({ success: true, data: balance });
    };

    const getSellerPayouts = async (req, res) => {
        const { status, page, limit } = req.query;
        const sellerId = req.user.id;
        const result = await payoutService.getSellerPayouts(sellerId, {
            status,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result.payouts, pagination: result.pagination });
    };

    const getAllPayouts = async (req, res) => {
        const { status, seller, startDate, endDate, page, limit } = req.query;
        const result = await payoutService.getAllPayouts({
            status,
            seller,
            startDate,
            endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result.payouts, pagination: result.pagination });
    };

    const getPayoutStats = async (req, res) => {
        const stats = await payoutService.getPayoutStats();
        res.status(200).json({ success: true, data: stats });
    };

    const getSellerPayoutStats = async (req, res) => {
        const sellerId = req.user.id;
        const stats = await payoutService.getSellerPayoutStats(sellerId);
        res.status(200).json({ success: true, data: stats });
    };

    const processBatchPayouts = async (req, res) => {
        const { payoutIds } = req.body;
        const adminId = req.user.id;
        const results = await payoutService.processBatchPayouts({ payoutIds, adminId });
        res.status(200).json({ success: true, data: results });
    };

    const updateBankDetails = async (req, res) => {
        const sellerId = req.user.id;
        const { accountNumber, accountHolderName, IFSC } = req.body;
        if (!accountNumber || !accountHolderName || !IFSC) {
            return res.status(400).json({ success: false, message: 'accountNumber, accountHolderName, and IFSC are required' });
        }
        const result = await payoutService.updateBankDetails({
            sellerId,
            bankDetails: { accountNumber, accountHolderName, IFSC },
        });
        res.status(200).json({ success: true, data: result });
    };

    const getFundAccountStatus = async (req, res) => {
        const sellerId = req.user.id;
        const data = await payoutService.getFundAccountStatus(sellerId);
        res.status(200).json({ success: true, data });
    };

    return Object.freeze({
        requestPayout,
        approvePayout,
        rejectPayout,
        disbursePayout,
        getPayout,
        getAvailableBalance,
        getSellerPayouts,
        getAllPayouts,
        getPayoutStats,
        getSellerPayoutStats,
        processBatchPayouts,
        updateBankDetails,
        getFundAccountStatus,
    });
};
