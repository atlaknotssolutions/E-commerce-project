export const createAdminNotificationRepository = ({ AdminNotification, User, Seller }) => {

    const findById = async (id) => {
        return AdminNotification.findById(id)
            .populate('createdBy', 'fullName email')
            .lean();
    };

    const create = async (data) => {
        const notification = await AdminNotification.create(data);
        return AdminNotification.findById(notification._id)
            .populate('createdBy', 'fullName email')
            .lean();
    };

    const update = async (id, data) => {
        return AdminNotification.findByIdAndUpdate(id, { $set: data }, { new: true })
            .populate('createdBy', 'fullName email')
            .lean();
    };

    const remove = async (id) => {
        return AdminNotification.findByIdAndDelete(id).lean();
    };

    const findAllWithFilters = async ({ status, notificationType, targetAudience, search, startDate, endDate, page = 1, limit = 20 }) => {
        const match = {};

        if (status) match.status = status;
        if (notificationType) match.notificationType = notificationType;
        if (targetAudience) match.targetAudience = targetAudience;

        if (search) {
            match.$or = [
                { title: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
            ];
        }

        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            AdminNotification.find(match)
                .populate('createdBy', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AdminNotification.countDocuments(match),
        ]);

        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    };

    const getStatistics = async () => {
        const [statusCounts, totalNotifications, deliveredRate] = await Promise.all([
            AdminNotification.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]),
            AdminNotification.countDocuments(),
            AdminNotification.aggregate([
                { $match: { status: 'DELIVERED' } },
                {
                    $group: {
                        _id: null,
                        totalDelivered: { $sum: '$deliveredCount' },
                        totalRead: { $sum: '$readCount' },
                    },
                },
            ]),
        ]);

        const statusMap = {};
        statusCounts.forEach((item) => {
            statusMap[item._id] = item.count;
        });

        const delivered = deliveredRate.length > 0 ? deliveredRate[0].totalDelivered : 0;
        const read = deliveredRate.length > 0 ? deliveredRate[0].totalRead : 0;

        return {
            totalNotifications,
            published: statusMap['PUBLISHED'] || 0,
            scheduled: statusMap['SCHEDULED'] || 0,
            draft: statusMap['DRAFT'] || 0,
            failed: statusMap['FAILED'] || 0,
            archived: statusMap['ARCHIVED'] || 0,
            delivered: statusMap['DELIVERED'] || 0,
            deliveredCount: delivered,
            readCount: read,
            deliveryRate: totalNotifications > 0
                ? (((statusMap['DELIVERED'] || 0) + (statusMap['PUBLISHED'] || 0)) / totalNotifications * 100).toFixed(2)
                : '0',
        };
    };

    const findScheduledDue = async () => {
        return AdminNotification.find({
            status: 'SCHEDULED',
            scheduledAt: { $lte: new Date() },
        }).lean();
    };

    const countByStatus = async () => {
        return AdminNotification.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
    };

    return Object.freeze({
        findById,
        create,
        update,
        remove,
        findAllWithFilters,
        getStatistics,
        findScheduledDue,
        countByStatus,
    });
};
