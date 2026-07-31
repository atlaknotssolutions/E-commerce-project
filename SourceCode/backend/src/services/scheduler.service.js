import cron from 'node-cron';

export const createSchedulerService = ({
    distributionEngine,
    userRepository,
    userModel: User,
    customerMetricModel: CustomerMetric,
    sellerMetricModel: SellerMetric,
    cartModel: Cart,
}) =>
{
    const jobs = [];

    const start = () =>
    {
        // Daily at 00:00 — Birthday coupons
        const birthdayJob = cron.schedule('0 0 * * *', async () =>
        {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            const users = await User.find({ birthDate: { $gte: todayStart, $lte: todayEnd } }).lean();
            for (const user of users)
            {
                try { await distributionEngine.assignCoupon({ userId: user._id, trigger: 'BIRTHDAY' }); }
                catch (err) { /* skip */ }
            }
        });
        jobs.push(birthdayJob);

        // Daily at 00:15 — Anniversary coupons (based on createdAt month/day)
        const anniversaryJob = cron.schedule('15 0 * * *', async () =>
        {
            const now = new Date();
            const todayMonth = now.getMonth() + 1;
            const todayDay = now.getDate();
            const users = await User.find({
                $expr: {
                    $and: [
                        { $eq: [{ $month: '$createdAt' }, todayMonth] },
                        { $eq: [{ $dayOfMonth: '$createdAt' }, todayDay] },
                    ]
                }
            }).lean();
            for (const user of users)
            {
                try { await distributionEngine.assignCoupon({ userId: user._id, trigger: 'ANNIVERSARY' }); }
                catch (err) { /* skip */ }
            }
        });
        jobs.push(anniversaryJob);

        // Daily at 01:00 — Inactive customers (>180 days since last order)
        const inactiveJob = cron.schedule('0 1 * * *', async () =>
        {
            const inactiveMetrics = await CustomerMetric.find({ daysSinceLastOrder: { $gt: 180 } }).lean();
            for (const metric of inactiveMetrics)
            {
                try { await distributionEngine.assignCoupon({ userId: metric.userId, trigger: 'INACTIVE_CUSTOMER' }); }
                catch (err) { /* skip */ }
            }
        });
        jobs.push(inactiveJob);

        // Daily at 02:00 — VIP achievement
        const vipJob = cron.schedule('0 2 * * *', async () =>
        {
            const vipMetrics = await CustomerMetric.find({ segment: 'SEGMENT_VIP_CUSTOMER' }).lean();
            for (const metric of vipMetrics)
            {
                try { await distributionEngine.assignCoupon({ userId: metric.userId, trigger: 'VIP_ACHIEVEMENT' }); }
                catch (err) { /* skip */ }
            }
        });
        jobs.push(vipJob);

        // Daily at 03:00 — Seller milestone (top sellers)
        const sellerMilestoneJob = cron.schedule('0 3 * * *', async () =>
        {
            const topSellers = await SellerMetric.find({ totalOrders: { $gt: 100 } }).lean();
            for (const metric of topSellers)
            {
                try { await distributionEngine.assignCoupon({ userId: metric.sellerId, trigger: 'SELLER_MILESTONE' }); }
                catch (err) { /* skip */ }
            }
        });
        jobs.push(sellerMilestoneJob);

        // Every 30 minutes — Cart abandonment
        const cartAbandonJob = cron.schedule('*/30 * * * *', async () =>
        {
            const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
            const abandonedCarts = await Cart.find({
                lastActivityAt: { $lt: cutoff },
                'items.0': { $exists: true },
            }).lean();
            for (const cart of abandonedCarts)
            {
                try { await distributionEngine.assignCoupon({ userId: cart.user, trigger: 'CART_ABANDONMENT' }); }
                catch (err) { /* skip */ }
            }
        });
        jobs.push(cartAbandonJob);

        // Every hour — Expire stale assignments
        const expireJob = cron.schedule('0 * * * *', async () =>
        {
            await distributionEngine.expireAssignments();
        });
        jobs.push(expireJob);
    };

    const stop = () =>
    {
        for (const job of jobs) { job.stop(); }
        jobs.length = 0;
    };

    return Object.freeze({ start, stop });
};
