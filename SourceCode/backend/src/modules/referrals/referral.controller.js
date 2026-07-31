export const createReferralController = ({ referralService }) =>
{
    const applyReferralCode = async (req, res) =>
    {
        const userId = req.user.id;
        const { referralCode } = req.body;
        const result = await referralService.applyReferralCode({ userId, referralCode });
        res.status(200).json(result);
    };

    const getMyReferralCode = async (req, res) =>
    {
        const userId = req.user.id;
        const result = await referralService.getMyReferralCode(userId);
        res.status(200).json(result);
    };

    return Object.freeze({
        applyReferralCode,
        getMyReferralCode,
    });
};
