import { computeContribution, computeSellerEarningsBase } from './contributionEngine.js';

export const computeOrderSettlement = (order, config) => {
    const totalSellingPrice = Number(order.totalSellingPrice) || 0;
    const couponPrice = Number(order.couponPrice) || 0;
    const couponSnapshot = order.couponSnapshot || null;
    const couponOwnerType = couponSnapshot?.ownerType || null;
    const productDiscount = Number(order.discount) || 0;

    const { sellerContribution, platformContribution } = couponSnapshot
        ? {
            sellerContribution: Number(couponSnapshot.sellerContribution) || 0,
            platformContribution: Number(couponSnapshot.platformContribution) || 0,
        }
        : computeContribution({ couponOwnerType, couponAmount: couponPrice });

    const commissionPercentage = Number(config.commissionPercentage) ?? 10;
    const gstPercentage = Number(config.gstPercentage) ?? 18;
    const gstEnabled = config.gstEnabled !== false;
    const commissionBase = config.commissionBase === 'post_coupon'
        ? Math.max(0, totalSellingPrice - couponPrice)
        : totalSellingPrice;

    const sellerEarningsBase = computeSellerEarningsBase(totalSellingPrice, couponPrice, couponOwnerType);

    const commissionAmount = parseFloat((commissionBase * commissionPercentage / 100).toFixed(2));
    const gstAmount = gstEnabled
        ? parseFloat((commissionAmount * gstPercentage / 100).toFixed(2))
        : 0;

    const settlementAmount = parseFloat(Math.max(0, sellerEarningsBase - commissionAmount - gstAmount).toFixed(2));
    const netSellerEarnings = settlementAmount;

    return {
        totalSellingPrice,
        productDiscount,
        couponPrice,
        couponOwnerType,
        sellerContribution,
        platformContribution,
        commissionBase,
        commissionPercentage,
        commissionAmount,
        gstPercentage,
        gstAmount,
        gstEnabled,
        settlementAmount,
        netSellerEarnings,
        currency: config.currency || 'INR',
    };
};

export const computeSellerReportUpdate = (orderSettlement) => {
    return {
        earnings: orderSettlement.netSellerEarnings,
        sales: orderSettlement.totalSellingPrice,
        commission: orderSettlement.commissionAmount,
        gst: orderSettlement.gstAmount,
    };
};
