export const createCookieConsentController = ({ cookieConsentService }) => {

    const getConsent = async (req, res) => {
        const userId = req.user?.id || null;
        const anonymousId = req.query.anonymousId || req.headers['x-anonymous-id'] || null;
        const consent = await cookieConsentService.getConsent(userId, anonymousId);
        res.status(200).json({ success: true, data: consent });
    };

    const createConsent = async (req, res) => {
        const userId = req.user?.id || null;
        const data = {
            ...req.body,
            userId,
        };
        const consent = await cookieConsentService.createConsent(data, req);
        res.status(201).json({ success: true, data: consent });
    };

    const updateConsent = async (req, res) => {
        const userId = req.user?.id || null;
        const anonymousId = req.body.anonymousId || req.headers['x-anonymous-id'] || null;
        const consent = await cookieConsentService.updateConsent(userId, anonymousId, req.body);
        res.status(200).json({ success: true, data: consent });
    };

    const deleteConsent = async (req, res) => {
        const userId = req.user?.id || null;
        const anonymousId = req.query.anonymousId || req.headers['x-anonymous-id'] || null;
        await cookieConsentService.deleteConsent(userId, anonymousId);
        res.status(200).json({ success: true, message: 'Consent withdrawn successfully' });
    };

    const getStatistics = async (req, res) => {
        const [statistics, countryDistribution, recentResult] = await Promise.all([
            cookieConsentService.getStatistics(),
            cookieConsentService.getCountryDistribution(),
            cookieConsentService.getRecentConsents(
                parseInt(req.query.page, 10) || 1,
                parseInt(req.query.limit, 10) || 20
            ),
        ]);
        res.status(200).json({
            success: true,
            data: {
                statistics,
                countryDistribution,
                recentConsents: recentResult.consents,
                pagination: recentResult.pagination,
            },
        });
    };

    return Object.freeze({
        getConsent,
        createConsent,
        updateConsent,
        deleteConsent,
        getStatistics,
    });
};
