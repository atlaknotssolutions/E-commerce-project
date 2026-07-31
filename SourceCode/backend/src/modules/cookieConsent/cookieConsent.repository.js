export const createCookieConsentRepository = ({ CookieConsent }) => {

    const findByUser = async (userId) => {
        return CookieConsent.findOne({ userId }).sort({ createdAt: -1 }).lean();
    };

    const findByAnonymousId = async (anonymousId) => {
        return CookieConsent.findOne({ anonymousId }).sort({ createdAt: -1 }).lean();
    };

    const findConsent = async (userId, anonymousId) => {
        if (userId) {
            return findByUser(userId);
        }
        if (anonymousId) {
            return findByAnonymousId(anonymousId);
        }
        return null;
    };

    const create = async (data) => {
        const consent = await CookieConsent.create(data);
        return consent.toObject();
    };

    const update = async (userId, anonymousId, updateData) => {
        const query = userId ? { userId } : { anonymousId };
        return CookieConsent.findOneAndUpdate(
            query,
            { $set: updateData },
            { new: true }
        ).lean();
    };

    const deleteConsent = async (userId, anonymousId) => {
        const query = userId ? { userId } : { anonymousId };
        return CookieConsent.deleteOne(query);
    };

    const getStatistics = async () => {
        const totalAccepted = await CookieConsent.countDocuments({
            analyticsAccepted: true,
        });
        const totalRejected = await CookieConsent.countDocuments({
            analyticsAccepted: false,
            marketingAccepted: false,
            preferencesAccepted: false,
        });
        const acceptedToday = await CookieConsent.countDocuments({
            acceptedAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
        });

        const allConsents = await CookieConsent.find().lean();
        const total = allConsents.length || 1;

        const analyticsPercentage = Math.round(
            (allConsents.filter((c) => c.analyticsAccepted).length / total) * 100
        );
        const marketingPercentage = Math.round(
            (allConsents.filter((c) => c.marketingAccepted).length / total) * 100
        );
        const preferencesPercentage = Math.round(
            (allConsents.filter((c) => c.preferencesAccepted).length / total) * 100
        );

        return {
            totalConsents: allConsents.length,
            totalAccepted,
            totalRejected,
            acceptedToday,
            analyticsPercentage,
            marketingPercentage,
            preferencesPercentage,
        };
    };

    const getCountryDistribution = async () => {
        const result = await CookieConsent.aggregate([
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, country: '$_id', count: 1 } },
        ]);
        return result;
    };

    const getRecentConsents = async (page = 1, limit = 20) => {
        const skip = (page - 1) * limit;
        const consents = await CookieConsent.find()
            .populate('userId', 'fullName email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await CookieConsent.countDocuments();
        return {
            consents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    };

    return Object.freeze({
        findByUser,
        findByAnonymousId,
        findConsent,
        create,
        update,
        deleteConsent,
        getStatistics,
        getCountryDistribution,
        getRecentConsents,
    });
};
