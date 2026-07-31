export const computeContribution = ({ couponOwnerType, couponAmount }) => {
    const amount = Number(couponAmount) || 0;
    if (couponOwnerType === 'SELLER') {
        return { sellerContribution: amount, platformContribution: 0 };
    }
    if (couponOwnerType === 'SHARED') {
        const half = Math.round(amount * 100 / 2) / 100;
        return { sellerContribution: half, platformContribution: amount - half };
    }
    return { sellerContribution: 0, platformContribution: amount };
};

export const computeSellerEarningsBase = (totalSellingPrice, couponPrice, couponOwnerType) => {
    const price = Number(totalSellingPrice) || 0;
    const coupon = Number(couponPrice) || 0;
    if (couponOwnerType === 'PLATFORM') {
        return price;
    }
    if (couponOwnerType === 'SHARED') {
        return Math.max(0, price - (coupon / 2));
    }
    return Math.max(0, price - coupon);
};
