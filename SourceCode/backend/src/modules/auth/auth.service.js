import crypto from 'crypto';
import mongoose from 'mongoose';
import branding from '../../config/branding.js';

/**
 * Pure function-based factory representing the Customer Authentication Business Service.
 * Implements Dependency Injection cleanly to enforce decoupled architectures.
 */
export const createAuthService = ({
    userRepository,
    cartRepository,
    verificationCodeRepository,
    passwordResetTokenRepository,
    refreshTokenRepository, // Injected dependency repository
    generateOTP,
    emailClient,
    signToken,
    verifyToken, // Injected verifyToken helper
    createApiError,
    jwtAccessSecret,
    jwtAccessExpiresIn,
    jwtRefreshSecret, // Injected refresh secrets config settings
    // jwtRefreshExpiresIn,
    distributionEngine,
    referralService,
}) =>
{

    /**
     * Internal SHA-256 generator. Protects OTP, reset links and session tokens by hashing them.
     */
    const hashString = (data) =>
    {
        return crypto.createHash('sha256').update(data).digest('hex');
    };


    /**
 * Validates a customer authentication OTP.
 */
    const validateCustomerOtp = async ({ email, otp }) =>
    {
        const activeCode =
            await verificationCodeRepository.findActiveCode({
                email,
                purpose: 'CUSTOMER_AUTH',
            });

        if (!activeCode)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_OR_EXPIRED_OTP',
                message:
                    'The verification session is invalid or has expired.',
            });
        }

        if (activeCode.attemptCount >= 3)
        {
            await verificationCodeRepository.markAsConsumed({
                id: activeCode._id,
            });

            throw createApiError({
                statusCode: 429,
                code: 'MAX_OTP_ATTEMPTS_EXCEEDED',
                message:
                    'Maximum verification failures reached. Code locked.',
            });
        }

        const inputHash = hashString(otp);

        if (activeCode.otpHash !== inputHash)
        {
            await verificationCodeRepository.incrementAttempts({
                id: activeCode._id,
            });

            throw createApiError({
                statusCode: 400,
                code: 'INCORRECT_OTP',
                message: 'Incorrect OTP.',
            });
        }

        await verificationCodeRepository.markAsConsumed({
            id: activeCode._id,
        });

        return true;
    };

    /**
     * Internal Helper: Generates and registers a new rotatable refresh token session.
     */
    const issueRefreshToken = async ({ userId, familyId }, options = {}) =>
    {
        const rawRefreshToken = crypto.randomBytes(40).toString('hex');
        const tokenHash = hashString(rawRefreshToken);

        // Default Refresh Token expiry set to 7 days
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await refreshTokenRepository.saveToken({
            userId,
            tokenHash,
            familyId,
            expiresAt,
        }, options);

        return rawRefreshToken;
    };

    /**
     * Dispatches Customer Login / Signup OTP.
     */
    const sendLoginOtp = async ({ email, fullName, }) =>
    {
        let targetEmail = email.toLowerCase().trim();
        let requireExistingUser = false;

        // Prefix "signing_" means Login flow.
        if (targetEmail.startsWith('signing_'))
        {
            targetEmail = targetEmail.replace('signing_', '');
            requireExistingUser = true;
        }

        let recipientName = fullName || 'Customer';


        // Login requires an existing customer.
        if (requireExistingUser)
        {
            const userExists =
                await userRepository.findByEmail(targetEmail);

            if (!userExists)
            {
                throw createApiError({
                    statusCode: 404,
                    code: 'USER_NOT_FOUND',
                    message:
                        'Authentication failed. No customer profile registered under this email.',
                });
            }

            recipientName = userExists.fullName || 'Customer';
        }

        // Signup requires that the email is NOT already registered.
        if (!requireExistingUser)
        {
            const existingUser = await userRepository.findByEmail(targetEmail);

            if (existingUser)
            {
                throw createApiError({
                    statusCode: 409,
                    code: 'USER_ALREADY_EXISTS',
                    message: 'A customer account already exists with this email.',
                });
            }
        }

        // Generate OTP
        const otp = generateOTP();
        const otpHash = hashString(otp);

        const expiresAt =
            new Date(Date.now() + 10 * 60 * 1000);

        // Remove previous active OTPs
        await verificationCodeRepository.deleteExistingCodes({
            email: targetEmail,
            purpose: 'CUSTOMER_AUTH',
        });

        // Save new OTP
        await verificationCodeRepository.saveCode({
            email: targetEmail,
            otpHash,
            purpose: 'CUSTOMER_AUTH',
            expiresAt,
        });

        // Send Email
        await emailClient.sendEmail({
            toEmail: targetEmail,

            // recipientName: 'Customer',

            recipientName,

            subject:
                `${branding.appName} • Login Verification Code`,

            title:
                'Login Verification',

            message: `
            Use the following One-Time Password (OTP) to securely sign in to your account.

            Enter this verification code on the login screen to continue.
            `,

            otp,

            showVerificationButton: false,

            buttonText: '',

            otpExpiryText:
                'This verification code is valid for 10 minutes.',

            footerNote: `
            Never share this OTP with anyone.

            Our support team will never ask for your verification code.
            `,
        });

        return {
            message:
                'A secure verification code has been successfully dispatched to your inbox.',
        };
    };





    /**
     * Standard signup business stream.
     */
    const signupCustomer = async ({ fullName, email, mobile, otp }) =>
    {
        const targetEmail = email.toLowerCase().trim();

        await validateCustomerOtp({
            email: targetEmail,
            otp,
        });

        let onboardedUser = null;
        const session = await mongoose.startSession();

        try
        {
            await session.withTransaction(async () =>
            {
                const userExists = await userRepository.findByEmail(targetEmail, { session });
                if (userExists)
                {
                    throw createApiError({
                        statusCode: 409,
                        code: 'USER_ALREADY_EXISTS',
                        message: 'A customer account already exists with this email.',
                    });
                }

                onboardedUser = await userRepository.create(
                    {
                        fullName,
                        email: targetEmail,
                        mobile,
                    },
                    { session }
                );

                await cartRepository.createCart({ userId: onboardedUser._id }, { session });
            });
        } finally
        {
            await session.endSession();
        }

        // Generate referral code for new user (non-blocking)
        try
        {
            const UserMongooseModel = mongoose.model('User');
            let code;
            let attempts = 0;
            do
            {
                code = crypto.randomBytes(4).toString('hex').toUpperCase();
                const existing = await UserMongooseModel.findOne({ referralCode: code }).lean();
                if (!existing) break;
                attempts++;
            } while (attempts < 5);
            await UserMongooseModel.findByIdAndUpdate(onboardedUser._id, { referralCode: code });
        }
        catch (err) { /* referral code generation failure should not block signup */ }

        // Trigger welcome coupon distribution (non-blocking)
        if (distributionEngine)
        {
            distributionEngine.onUserRegistered(onboardedUser._id).catch(() => {});
        }

        // Generate rotated Access and Refresh tokens
        const tokenPayload = { id: onboardedUser._id, email: onboardedUser.email, role: onboardedUser.role };
        const accessToken = signToken({ payload: tokenPayload, secret: jwtAccessSecret, expiresIn: jwtAccessExpiresIn });

        const familyId = crypto.randomUUID(); // Unique family identifier for the initial session
        const refreshToken = await issueRefreshToken({ userId: onboardedUser._id, familyId });

        return {
            jwt: accessToken,
            refreshToken, // Export refresh token to be attached as HttpOnly cookie in controllers
            status: true,
            message: 'Registration process successfully completed.',
            role: onboardedUser.role,
        };
    };

    /**
     * Standard signin validation logic.
     */
    const signinCustomer = async ({ email, otp }) =>
    {
        const targetEmail = email.toLowerCase().trim();

        const existingUser =
            await userRepository.findByEmail(targetEmail);

        if (!existingUser)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'No active profile found registered under this email address.'
            });
        }

        await validateCustomerOtp({
            email: targetEmail,
            otp,
        });

        // Generate rotated tokens
        const tokenPayload = { id: existingUser._id, email: existingUser.email, role: existingUser.role };
        const accessToken = signToken({ payload: tokenPayload, secret: jwtAccessSecret, expiresIn: jwtAccessExpiresIn });

        const familyId = crypto.randomUUID();
        const refreshToken = await issueRefreshToken({ userId: existingUser._id, familyId });

        return {
            jwt: accessToken,
            refreshToken,
            status: true,
            message: 'Login successfully verified.',
            role: existingUser.role,
        };
    };


    /**
 * Generates and dispatches a secure password reset link.
 */
    const requestPasswordReset = async ({ email }) =>
    {
        const targetEmail = email.toLowerCase().trim();

        const user =
            await userRepository.findByEmail(targetEmail);

        if (!user)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message:
                    'Reset failed. No customer profile registered under this email address.',
            });
        }

        // Generate secure token
        const rawToken =
            crypto.randomBytes(32).toString('hex');

        const tokenHash =
            hashString(rawToken);

        const expiresAt =
            new Date(Date.now() + 15 * 60 * 1000);

        // Remove previous reset requests
        await passwordResetTokenRepository.deleteExistingTokens({
            email: targetEmail,
        });

        // Save new reset request
        await passwordResetTokenRepository.saveToken({
            email: targetEmail,
            tokenHash,
            expiresAt,
        });

        // Build recovery URL
        const recoveryLink =
            `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

        // Send email
        await emailClient.sendEmail({
            toEmail: targetEmail,

            recipientName:
                user.fullName || 'Customer',

            subject:
                `${branding.appName} • Password Reset Request`,

            title:
                'Reset Your Password',

            otp: null,

            message: `
            We received a request to reset your account password.

            Click the button below to create a new password.

            If you didn't request this change, you can safely ignore this email.
            `,

            verificationLink: recoveryLink,

            showVerificationButton: true,

            buttonText: 'Reset Password',

            otpExpiryText: '',

            footerNote: `
            This password reset link will expire in 15 minutes.

            If you didn't request a password reset, you can safely ignore this email.
            `,
        });

        return {
            success: true,
            message:
                'A secure password reset link has been sent to your registered email address.',
        };
    };



    /**
     * Password Reset Executer.
     */
    const resetPassword = async ({ token, newPassword }) =>
    {
        const tokenHash = hashString(token);

        const activeToken = await passwordResetTokenRepository.findByTokenHash(tokenHash);
        if (!activeToken)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_OR_EXPIRED_TOKEN',
                message: 'The password reset link is invalid or has expired. Please request a new recovery link.'
            });
        }

        const encryptedPassword = hashString(newPassword);

        const user = await userRepository.findByEmail(activeToken.email);
        if (!user)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'System updates failed. User account associated with this token was not found.'
            });
        }

        const UserMongooseModel = mongoose.model('User');
        await UserMongooseModel.findByIdAndUpdate(user._id, { passwordHash: encryptedPassword });

        await passwordResetTokenRepository.deleteExistingTokens({ email: activeToken.email });

        return { success: true, message: 'Your password has been successfully reset. Please log in with your new credentials.' };
    };

    /**
     * Refresh Token Rotation (RTR) Engine.
     * Decrypts current session token, detects and blocks replay attacks,
     * and issues rotated Access and Refresh tokens.
     */
    const refreshSession = async ({ refreshToken }) =>
    {

        try
        {
            verifyToken({
                token: refreshToken,
                secret: jwtRefreshSecret,
            });
        } catch (error)
        {
            throw createApiError({
                statusCode: 401,
                code: 'REFRESH_TOKEN_EXPIRED',
                message: 'Your refresh token session has expired or is invalid. Please log in again.'
            });
        }

        // 2. Hash input token to locate database record
        const tokenHash = hashString(refreshToken);
        const sessionToken = await refreshTokenRepository.findByTokenHash(tokenHash);

        // Dynamic security checks
        if (!sessionToken || sessionToken.isRevoked)
        {
            throw createApiError({
                statusCode: 401,
                code: 'SESSION_REVOKED',
                message: 'This session has been revoked. Re-authentication required.'
            });
        }

        // 3. Replay Attack Detection: If token is already used, ban the entire family lineage immediately!
        if (sessionToken.isUsed)
        {
            await refreshTokenRepository.revokeFamily({ familyId: sessionToken.familyId });
            throw createApiError({
                statusCode: 401,
                code: 'SECURITY_ALERT_REPLAY_ATTEMPT',
                message: 'Security Alert: This refresh token has already been rotated. Suspicious reuse detected. Session terminated.'
            });
        }

        // 4. Token is valid and unused -> Trigger Rotation
        const userId = sessionToken.user;
        const familyId = sessionToken.familyId;

        // Flag current token as used
        await refreshTokenRepository.markAsUsed({ id: sessionToken._id });

        // 5. Generate fresh rotated tokens under same family lineage
        const userProfile = await userRepository.findById(userId);
        if (!userProfile)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'User profile associated with this session was not found.'
            });
        }

        const tokenPayload = { id: userProfile._id, email: userProfile.email, role: userProfile.role };
        const newAccessToken = signToken({ payload: tokenPayload, secret: jwtAccessSecret, expiresIn: jwtAccessExpiresIn });
        const newRefreshToken = await issueRefreshToken({ userId: userProfile._id, familyId });

        return {
            jwt: newAccessToken,
            refreshToken: newRefreshToken,
        };
    };

    /**
     * Manual session logout terminator.
     * Completely drops and purges all active refresh token registries for the user.
     */
    const logout = async ({ userId }) =>
    {
        await refreshTokenRepository.deleteByUser({ userId });
        return { success: true, message: 'Logged out successfully. All active sessions terminated.' };
    };

    return Object.freeze({
        sendLoginOtp,
        signupCustomer,
        signinCustomer,
        requestPasswordReset,
        resetPassword,
        refreshSession, // Added session rotation action
        logout,         // Added logout action
    });
};