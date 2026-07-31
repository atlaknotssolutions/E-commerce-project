import { DISTRIBUTION_RULES } from './couponDistribution.config.js';

export const createCouponDistributionRulesService = () =>
{
    const getRuleByTrigger = (trigger) =>
    {
        return DISTRIBUTION_RULES.find((rule) => rule.trigger === trigger && rule.isActive) || null;
    };

    const getAllActiveRules = () =>
    {
        return DISTRIBUTION_RULES.filter((rule) => rule.isActive);
    };

    const generateCouponCode = (trigger) =>
    {
        const prefix = trigger.substring(0, 4);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}${random}`;
    };

    return Object.freeze({
        getRuleByTrigger,
        getAllActiveRules,
        generateCouponCode,
    });
};
