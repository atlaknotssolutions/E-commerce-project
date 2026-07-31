export const createCouponDistributionController = ({ distributionEngine }) =>
{
    const getWallet = async (req, res) =>
    {
        const userId = req.user.id;
        const wallet = await distributionEngine.getWallet(userId);
        res.status(200).json(wallet);
    };

    const claimCoupon = async (req, res) =>
    {
        const userId = req.user.id;
        const { id } = req.params;
        const assignment = await distributionEngine.claimCoupon({ userId, assignmentId: id });
        res.status(200).json(assignment);
    };

    return Object.freeze({
        getWallet,
        claimCoupon,
    });
};
