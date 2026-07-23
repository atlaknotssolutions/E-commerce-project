export const createCommissionService = ({
    commissionRepository,
    orderRepository,
    systemSettingsRepository,
    createApiError,
    mapCommission,
    mapCommissions,
}) => {
    const getCommissionConfig = async () => {
        const settings = await systemSettingsRepository.getSettings();
        const marketplace = settings.marketplace || {};
        return {
            commissionPercentage: marketplace.commissionPercentage ?? 10,
            gstPercentage: marketplace.gstPercentage ?? 18,
            currency: settings.general?.currency || 'INR',
        };
    };

    const calculateCommission = async ({ orderId }) => {
        const existing = await commissionRepository.findByOrder(orderId);
        if (existing) {
            createApiError('Commission already calculated for this order', 409);
        }

        const order = await orderRepository.findById(orderId);
        if (!order) {
            createApiError('Order not found', 404);
        }

        const config = await getCommissionConfig();

        const orderAmount = order.totalSellingPrice;
        const commissionAmount = parseFloat((orderAmount * config.commissionPercentage / 100).toFixed(2));
        const gstAmount = parseFloat((commissionAmount * config.gstPercentage / 100).toFixed(2));
        const sellerAmount = parseFloat((orderAmount - commissionAmount - gstAmount).toFixed(2));

        const commissionData = {
            order: order._id,
            orderId: order.orderId,
            seller: order.seller,
            customer: order.user,
            orderAmount,
            commissionPercentage: config.commissionPercentage,
            commissionAmount,
            gstPercentage: config.gstPercentage,
            gstAmount,
            sellerAmount,
            currency: config.currency,
            status: 'CALCULATED',
            calculatedAt: new Date(),
        };

        const commission = await commissionRepository.create(commissionData);
        return mapCommission(commission);
    };

    const getCommission = async (id) => {
        const commission = await commissionRepository.findById(id);
        if (!commission) {
            createApiError('Commission record not found', 404);
        }
        return mapCommission(commission);
    };

    const getSellerCommissions = async (sellerId, filters) => {
        const result = await commissionRepository.findBySeller(sellerId, filters);
        return {
            commissions: mapCommissions(result.commissions),
            pagination: result.pagination,
        };
    };

    const getAllCommissions = async (filters) => {
        const result = await commissionRepository.findAll(filters);
        return {
            commissions: mapCommissions(result.commissions),
            pagination: result.pagination,
        };
    };

    const getCommissionStats = async () => {
        return await commissionRepository.getAdminCommissionStats();
    };

    const getSellerCommissionStats = async (sellerId) => {
        return await commissionRepository.getSellerCommissionStats(sellerId);
    };

    return Object.freeze({
        calculateCommission,
        getCommission,
        getSellerCommissions,
        getAllCommissions,
        getCommissionStats,
        getSellerCommissionStats,
        getCommissionConfig,
    });
};
