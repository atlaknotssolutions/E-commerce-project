export const createCookieConsentService = ({
    cookieConsentRepository,
    createApiError,
}) => {

    const parseUserAgent = (userAgent) => {
        if (!userAgent) return { browser: null, os: null, deviceType: 'unknown' };

        let browser = 'Unknown';
        let os = 'Unknown';
        let deviceType = 'desktop';

        if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Edg')) browser = 'Edge';
        else if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';

        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac OS')) os = 'macOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

        if (userAgent.includes('Mobile') || userAgent.includes('Android')) deviceType = 'mobile';
        else if (userAgent.includes('iPad')) deviceType = 'tablet';

        return { browser, os, deviceType };
    };

    const getConsent = async (userId, anonymousId) => {
        const consent = await cookieConsentRepository.findConsent(userId, anonymousId);
        return consent;
    };

    const createConsent = async (data, req) => {
        const userAgent = req?.headers?.['user-agent'] || null;
        const parsed = parseUserAgent(userAgent);
        const ipAddress = req?.ip || req?.connection?.remoteAddress || null;

        const consentData = {
            userId: data.userId || null,
            anonymousId: data.anonymousId || null,
            ipAddress,
            userAgent,
            browser: parsed.browser,
            os: parsed.os,
            deviceType: parsed.deviceType,
            country: data.country || null,
            city: data.city || null,
            language: data.language || req?.headers?.['accept-language']?.split(',')[0] || null,
            timezone: data.timezone || null,
            consentVersion: data.consentVersion || '1.0',
            policyVersion: data.policyVersion || '1.0',
            necessaryCookies: true,
            analyticsAccepted: Boolean(data.analyticsAccepted),
            marketingAccepted: Boolean(data.marketingAccepted),
            preferencesAccepted: Boolean(data.preferencesAccepted),
            acceptedAt: new Date(),
            sourcePage: data.sourcePage || null,
        };

        const existing = await cookieConsentRepository.findConsent(
            data.userId || null,
            data.anonymousId || null
        );

        if (existing) {
            const updated = await cookieConsentRepository.update(
                data.userId || null,
                data.anonymousId || null,
                {
                    ...consentData,
                    acceptedAt: new Date(),
                }
            );
            return updated;
        }

        return cookieConsentRepository.create(consentData);
    };

    const updateConsent = async (userId, anonymousId, updateData) => {
        const existing = await cookieConsentRepository.findConsent(userId, anonymousId);
        if (!existing) {
            createApiError({
                statusCode: 404,
                code: 'CONSENT_NOT_FOUND',
                message: 'No consent record found',
            });
        }

        const allowed = {
            analyticsAccepted: updateData.analyticsAccepted,
            marketingAccepted: updateData.marketingAccepted,
            preferencesAccepted: updateData.preferencesAccepted,
            consentVersion: updateData.consentVersion,
            policyVersion: updateData.policyVersion,
        };

        Object.keys(allowed).forEach((key) => {
            if (allowed[key] === undefined) delete allowed[key];
        });

        allowed.necessaryCookies = true;
        allowed.acceptedAt = new Date();

        return cookieConsentRepository.update(userId, anonymousId, allowed);
    };

    const deleteConsent = async (userId, anonymousId) => {
        const existing = await cookieConsentRepository.findConsent(userId, anonymousId);
        if (!existing) {
            createApiError({
                statusCode: 404,
                code: 'CONSENT_NOT_FOUND',
                message: 'No consent record found to withdraw',
            });
        }

        return cookieConsentRepository.deleteConsent(userId, anonymousId);
    };

    const getStatistics = async () => {
        return cookieConsentRepository.getStatistics();
    };

    const getCountryDistribution = async () => {
        return cookieConsentRepository.getCountryDistribution();
    };

    const getRecentConsents = async (page, limit) => {
        return cookieConsentRepository.getRecentConsents(page, limit);
    };

    return Object.freeze({
        getConsent,
        createConsent,
        updateConsent,
        deleteConsent,
        getStatistics,
        getCountryDistribution,
        getRecentConsents,
    });
};
