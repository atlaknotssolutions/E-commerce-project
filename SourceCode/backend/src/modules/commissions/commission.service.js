import { COMMISSION_STATUS } from '../../constants/enums.js';
import { createCouponFacade } from '../../utils/couponEngine/CouponFacade.js';
import { computeSellerEarningsBase } from '../settlementEngine/contributionEngine.js';

export const createCommissionService = ({
    commissionRepository,
    orderRepository,
    configurationService,
    createApiError,
    mapCommission,
    mapCommissions,
}) => {
    const couponFacade = createCouponFacade();
    const VALID_TRANSITIONS = {
        [COMMISSION_STATUS.CALCULATED]: [COMMISSION_STATUS.APPROVED, COMMISSION_STATUS.CANCELLED],
        [COMMISSION_STATUS.APPROVED]: [COMMISSION_STATUS.SETTLED, COMMISSION_STATUS.CANCELLED],
        [COMMISSION_STATUS.SETTLED]: [],
        [COMMISSION_STATUS.CANCELLED]: [],
    };

    const getCommissionConfig = async () => {
        return await configurationService.getCommissionConfig();
    };

    const calculateCommission = async ({ orderId }) => {
        const existing = await commissionRepository.findByOrder(orderId);
        if (existing) {
            throw createApiError({ statusCode: 409, message: 'Commission already calculated for this order' });
        }

        const order = await orderRepository.findById(orderId);
        if (!order) {
            throw createApiError({ statusCode: 404, message: 'Order not found' });
        }

        const config = await getCommissionConfig();

        // Use configured commission base (default: pre-coupon sellingPrice)
        const orderAmount = config.commissionBase === 'post_coupon'
            ? couponFacade.computeSellerEarnings(order.totalSellingPrice, order.couponPrice)
            : order.totalSellingPrice;
        const commissionAmount = parseFloat((orderAmount * config.commissionPercentage / 100).toFixed(2));
        const gstAmount = config.gstEnabled
            ? parseFloat((commissionAmount * config.gstPercentage / 100).toFixed(2))
            : 0;

        // Use sellerEarningsBase to correctly account for coupon ownership
        const sellerEarningsBase = computeSellerEarningsBase(
            Number(order.totalSellingPrice) || 0,
            Number(order.couponPrice) || 0,
            order.couponSnapshot?.ownerType || null
        );
        const sellerAmount = parseFloat(Math.max(0, sellerEarningsBase - commissionAmount - gstAmount).toFixed(2));

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
            status: COMMISSION_STATUS.CALCULATED,
            calculatedAt: new Date(),
        };

        const commission = await commissionRepository.create(commissionData);
        return mapCommission(commission);
    };

    const getCommission = async (id) => {
        const commission = await commissionRepository.findById(id);
        if (!commission) {
            throw createApiError({ statusCode: 404, message: 'Commission record not found' });
        }
        return mapCommission(commission);
    };

    const validateTransition = (id, currentStatus, targetStatus) => {
        const allowed = VALID_TRANSITIONS[currentStatus] || [];
        if (!allowed.includes(targetStatus)) {
            throw createApiError({
                statusCode: 400,
                message: `Cannot transition commission from ${currentStatus} to ${targetStatus}`,
            });
        }
    };

    const approveCommission = async (id) => {
        const commission = await commissionRepository.findById(id);
        if (!commission) {
            throw createApiError({ statusCode: 404, message: 'Commission record not found' });
        }
        validateTransition(id, commission.status, COMMISSION_STATUS.APPROVED);
        const updated = await commissionRepository.updateStatus(id, COMMISSION_STATUS.APPROVED);
        return mapCommission(updated);
    };

    const settleCommission = async (id) => {
        const commission = await commissionRepository.findById(id);
        if (!commission) {
            throw createApiError({ statusCode: 404, message: 'Commission record not found' });
        }
        validateTransition(id, commission.status, COMMISSION_STATUS.SETTLED);
        const updated = await commissionRepository.updateStatus(id, COMMISSION_STATUS.SETTLED);
        return mapCommission(updated);
    };

    const cancelCommission = async (id) => {
        const commission = await commissionRepository.findById(id);
        if (!commission) {
            throw createApiError({ statusCode: 404, message: 'Commission record not found' });
        }
        validateTransition(id, commission.status, COMMISSION_STATUS.CANCELLED);
        const updated = await commissionRepository.updateStatus(id, COMMISSION_STATUS.CANCELLED);
        return mapCommission(updated);
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

    const cancelCommissionForRefund = async (orderId, options = {}) => {
        const commission = await commissionRepository.findByOrder(orderId);
        if (!commission) return null;
        if (commission.status === COMMISSION_STATUS.CANCELLED) return mapCommission(commission);
        const allowed = VALID_TRANSITIONS[commission.status] || [];
        if (!allowed.includes(COMMISSION_STATUS.CANCELLED)) return mapCommission(commission);
        const updated = await commissionRepository.updateStatus(commission.id || commission._id, COMMISSION_STATUS.CANCELLED, options);
        return mapCommission(updated);
    };

    return Object.freeze({
        calculateCommission,
        getCommission,
        approveCommission,
        settleCommission,
        cancelCommission,
        cancelCommissionForRefund,
        getSellerCommissions,
        getAllCommissions,
        getCommissionStats,
        getSellerCommissionStats,
        getCommissionConfig,
    });
};
