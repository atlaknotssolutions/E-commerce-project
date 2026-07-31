import crypto from 'crypto';

export const createReferralService = ({
    userRepository,
    createApiError,
}) =>
{
    const generateReferralCode = () =>
    {
        return crypto.randomBytes(4).toString('hex').toUpperCase();
    };

    const ensureReferralCode = async (userId) =>
    {
        const user = await userRepository.findById(userId);
        if (!user)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'User not found.',
            });
        }

        if (user.referralCode) return user.referralCode;

        let code;
        let attempts = 0;
        do
        {
            code = generateReferralCode();
            const existing = await userRepository.findByReferralCode(code);
            if (!existing) break;
            attempts++;
        } while (attempts < 5);

        const UserMongooseModel = (await import('mongoose')).default.model('User');
        await UserMongooseModel.findByIdAndUpdate(userId, { referralCode: code });

        return code;
    };

    const applyReferralCode = async ({ userId, referralCode }) =>
    {
        const referrer = await userRepository.findByReferralCode(referralCode);
        if (!referrer)
        {
            throw createApiError({
                statusCode: 404,
                code: 'INVALID_REFERRAL_CODE',
                message: 'The referral code is invalid.',
            });
        }

        if (referrer._id.toString() === userId.toString())
        {
            throw createApiError({
                statusCode: 400,
                code: 'SELF_REFERRAL',
                message: 'You cannot use your own referral code.',
            });
        }

        const user = await userRepository.findById(userId);
        if (user.referredBy)
        {
            throw createApiError({
                statusCode: 400,
                code: 'ALREADY_REFERRED',
                message: 'You have already been referred by someone.',
            });
        }

        await userRepository.updateReferral({ userId, referredBy: referrer._id });

        return {
            success: true,
            message: 'Referral code applied successfully.',
            referrerName: referrer.fullName,
        };
    };

    const getMyReferralCode = async (userId) =>
    {
        const code = await ensureReferralCode(userId);
        return { referralCode: code };
    };

    return Object.freeze({
        generateReferralCode,
        ensureReferralCode,
        applyReferralCode,
        getMyReferralCode,
    });
};
