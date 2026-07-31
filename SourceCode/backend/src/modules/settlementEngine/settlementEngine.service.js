import { computeOrderSettlement } from './settlementEngine.js';

export const createSettlementEngineService = ({
    orderRepository,
    commissionRepository,
    ledgerRepository,
    configurationService,
    notificationService,
    createApiError,
}) => {
    const getSettlementConfig = async () => {
        return await configurationService.getCommissionConfig();
    };

    const calculateAndRecordSettlement = async ({ orderId }) => {
        const order = await orderRepository.findById(orderId);
        if (!order) {
            throw createApiError({ statusCode: 404, message: 'Order not found' });
        }

        const config = await getSettlementConfig();
        const settlement = computeOrderSettlement(order, config);

        const commissionData = {
            order: order._id,
            orderId: order.orderId,
            seller: order.seller?._id || order.seller,
            customer: order.user?._id || order.user,
            orderAmount: settlement.commissionBase,
            commissionPercentage: settlement.commissionPercentage,
            commissionAmount: settlement.commissionAmount,
            gstPercentage: settlement.gstPercentage,
            gstAmount: settlement.gstAmount,
            sellerAmount: settlement.netSellerEarnings,
            currency: settlement.currency,
            status: 'CALCULATED',
            calculatedAt: new Date(),
        };

        const commission = await commissionRepository.create(commissionData);

        // Update order with settlement fields
        const sellerId = order.seller?._id || order.seller;
        await orderRepository.updateOrder(order._id, {
            platformContribution: settlement.platformContribution,
            sellerContribution: settlement.sellerContribution,
            couponOwnerType: settlement.couponOwnerType,
            commissionAmount: settlement.commissionAmount,
            gstAmount: settlement.gstAmount,
            settlementAmount: settlement.settlementAmount,
            netSellerEarnings: settlement.netSellerEarnings,
        });

        // Create ledger entries (append-only financial audit trail)
        await ledgerRepository.createEntry({
            order: order._id,
            seller: sellerId,
            type: 'ORDER_PLACED',
            direction: 'CREDIT',
            amount: settlement.settlementAmount,
            description: `Net settlement of ₹${settlement.settlementAmount} for order ${order.orderId}`,
            metadata: settlement,
        });

        await ledgerRepository.createEntry({
            order: order._id,
            seller: sellerId,
            type: 'COMMISSION_CALCULATED',
            direction: 'DEBIT',
            amount: settlement.commissionAmount + settlement.gstAmount,
            description: `Commission ₹${settlement.commissionAmount} + GST ₹${settlement.gstAmount} on order ${order.orderId}`,
            metadata: settlement,
        });

        if (notificationService) {
            notificationService.createNotification({
                customerId: sellerId,
                message: `Settlement for order ${order.orderId}: Net ₹${settlement.netSellerEarnings}`,
            }).catch(() => {});
        }

        return { settlement, commission };
    };

    const getSellerLedger = async (sellerId, filters) => {
        return await ledgerRepository.findBySeller(sellerId, filters);
    };

    const getOrderLedger = async (orderId) => {
        return await ledgerRepository.findByOrder(orderId);
    };

    const getAllLedger = async (filters) => {
        return await ledgerRepository.findAll(filters);
    };

    const getSellerLedgerStats = async (sellerId) => {
        return await ledgerRepository.getSellerLedgerStats(sellerId);
    };

    const recalculateSettlement = async ({ orderId }) => {
        const order = await orderRepository.findById(orderId);
        if (!order) {
            throw createApiError({ statusCode: 404, message: 'Order not found' });
        }
        const existingEntries = await ledgerRepository.findByOrder(orderId);
        if (existingEntries.length > 0) {
            throw createApiError({ statusCode: 409, message: 'Settlement already exists for this order. Use admin override instead.' });
        }
        return await calculateAndRecordSettlement({ orderId });
    };

    const getOrderSettlementPreview = async ({ orderId }) => {
        const order = await orderRepository.findById(orderId);
        if (!order) {
            throw createApiError({ statusCode: 404, message: 'Order not found' });
        }
        const config = await getSettlementConfig();
        return computeOrderSettlement(order, config);
    };

    return Object.freeze({
        calculateAndRecordSettlement,
        getSellerLedger,
        getOrderLedger,
        getAllLedger,
        getSellerLedgerStats,
        recalculateSettlement,
        getOrderSettlementPreview,
        getSettlementConfig,
    });
};
