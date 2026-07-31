/**
 * Pure function-based factory representing the SellerReport Persistence database interface.
 * Decouples database collections lookup pipelines using Dependency Injection.
 */
export const createSellerReportRepository = ({ SellerReport }) =>
{

    /**
     * Retrieves or lazy-initializes a merchant's active analytical report card.
     */
    const getOrCreateReport = async ({ sellerId }, options = {}) =>
    {
        let report = await SellerReport.findOne({ seller: sellerId }, null, options).lean();

        // Lazy Onboarding Initialization: If report document is missing, build it immediately
        if (!report)
        {
            const [newReport] = await SellerReport.create([{
                seller: sellerId,
                totalEarnings: 0,
                totalSales: 0,
                totalRefunds: 0,
                totalTax: 0,
                netEarnings: 0,
                totalOrders: 0,
                canceledOrders: 0,
                totalTransactions: 0,
            }], options);

            report = newReport ? newReport.toObject() : null;
        }

        return report;
    };

    /**
     * Atomically increments financial sales and order volume counters inside database.
     * Employs $inc operator to prevent write-race conditions on high traffic checkouts.
     */
    const applyPaymentSuccess = async ({ sellerId, earnings, sales, commission = 0, gst = 0 }, options = {}) =>
    {
        return SellerReport.findOneAndUpdate(
            { seller: sellerId },
            {
                $inc: {
                    totalEarnings: parseFloat(earnings),
                    totalSales: parseFloat(sales),
                    netEarnings: parseFloat(earnings),
                    totalOrders: 1,
                    totalTransactions: 1,
                    totalCommission: parseFloat(commission),
                    totalGst: parseFloat(gst),
                }
            },
            { ...options, new: true, upsert: true }
        ).lean();
    };

    /**
     * Atomically registers cancellations and refund metrics inside database.
     */
    const applyCancellation = async ({ sellerId, refund }, options = {}) =>
    {
        return SellerReport.findOneAndUpdate(
            { seller: sellerId },
            {
                $inc: {
                    canceledOrders: 1,
                    totalRefunds: parseFloat(refund),
                    netEarnings: -parseFloat(refund), // Decrements net payouts earnings cleanly
                }
            },
            { ...options, new: true, upsert: true }
        ).lean();
    };

    /**
     * Reverses seller earnings and sales when a refund is processed.
     * Maintains the invariant: sum(sellerPostCouponEarnings) = customerPaid.
     */
    const applyRefund = async ({ sellerId, earnings, sales }, options = {}) =>
    {
        return SellerReport.findOneAndUpdate(
            { seller: sellerId },
            {
                $inc: {
                    totalEarnings: -parseFloat(earnings),
                    totalSales: -parseFloat(sales),
                    netEarnings: -parseFloat(earnings),
                    totalRefunds: parseFloat(earnings),
                }
            },
            { ...options, new: true, upsert: true }
        ).lean();
    };

    return Object.freeze({
        getOrCreateReport,
        applyPaymentSuccess,
        applyCancellation,
        applyRefund,
    });
};