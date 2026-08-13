import crypto from 'crypto';
import mongoose from 'mongoose';
import branding from '../../config/branding.js';
import { ROLES } from '../../constants/enums.js';
import {
    hashPassword,
    isValidPasswordPolicy,
    isUsablePasswordHash,
    verifyPassword,
} from '../../utils/password.js';

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
     * Internal Helper: Issues a fresh access token plus a new rotatable
     * refresh token for an authenticated customer. Shared by all
     * session-establishing flows (OTP signup/signin, password signin).
     */
    const issueCustomerSession = async ({ user }) =>
    {
        const tokenPayload = { id: user._id, email: user.email, role: user.role };
        const accessToken = signToken({
            payload: tokenPayload,
            secret: jwtAccessSecret,
            expiresIn: jwtAccessExpiresIn,
        });

        const familyId = crypto.randomUUID(); // Unique family identifier for the new session
        const refreshToken = await issueRefreshToken({
            userId: user._id,
            familyId,
        });

        return {
            jwt: accessToken,
            refreshToken,
        };
    };

    /**
     * Dispatches Customer Login / Signup OTP.
     */
    const sendLoginOtp = async ({ email, fullName, purpose }) =>
    {
        let targetEmail = email.toLowerCase().trim();

        const isLegacyLoginPrefix = targetEmail.startsWith('signing_');
        if (isLegacyLoginPrefix)
        {
            targetEmail = targetEmail.replace('signing_', '');
        }

        const requireExistingUser =
            purpose === 'login' || isLegacyLoginPrefix;

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
     * Password-based signin for customers who have set a password.
     * Maps exactly to: POST /auth/password-login
     *
     * Deliberately returns ONE generic authentication failure for every
     * invalid combination (unknown email, non-customer role, missing/legacy
     * password hash, wrong password) to prevent account enumeration.
     */
    const signinCustomerWithPassword = async ({ email, password }) =>
    {
        const targetEmail = email.toLowerCase().trim();

        // passwordHash is schema-level `select: false`; this is the ONLY
        // repository read that explicitly requests it for verification.
        const existingUser =
            await userRepository.findByEmailWithPassword(targetEmail);

        // Short-circuit chain: bcrypt only runs when a usable hash exists.
        const passwordIsValid =
            existingUser
            && (existingUser.role === ROLES.CUSTOMER || existingUser.role === ROLES.ADMIN)
            && isUsablePasswordHash(existingUser.passwordHash)
            && typeof password === 'string'
            && password.length > 0
            && await verifyPassword(password, existingUser.passwordHash);

        if (!passwordIsValid)
        {
            throw createApiError({
                statusCode: 401,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password.',
            });
        }

        const { jwt, refreshToken } =
            await issueCustomerSession({ user: existingUser });

        return {
            jwt,
            refreshToken, // Export refresh token to be attached as HttpOnly cookie in controllers
            status: true,
            message: 'Login successfully verified.',
            role: existingUser.role,
        };
    };

    /**
     * Sets a password on an OTP-created (or legacy hash) customer account,
     * or changes an existing password after verifying the current one.
     * Maps exactly to: POST /auth/password (authenticated + ROLE_CUSTOMER)
     *
     * Case A (no usable bcrypt hash): only `password` is required.
     * Case B (usable bcrypt hash): `currentPassword` must be provided and
     * verified before the hash is replaced.
     */
    const setPassword = async ({ userId, password, currentPassword }) =>
    {
        // passwordHash is schema-level `select: false`; this is the ONLY
        // repository read that explicitly requests it for this decision.
        const user = await userRepository.findByIdWithPassword(userId);

        if (!user)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'The requested user profile does not exist on this server.',
            });
        }

        // Defense in depth: the route is already role-guarded, but the
        // service independently refuses non-customer principals.
        if (user.role !== ROLES.CUSTOMER && user.role !== ROLES.ADMIN)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: `Access Forbidden: Your account role (${user.role}) does not possess authorizations to execute this operational run.`,
            });
        }

        // Policy validation runs before any branch logic so it fails fast
        // and never depends on whether a password already exists.
        if (!isValidPasswordPolicy(password))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_PASSWORD',
                message: 'Password must be a non-empty string between 8 and 72 characters.',
            });
        }

        const hasUsablePassword = isUsablePasswordHash(user.passwordHash);

        if (hasUsablePassword)
        {
            if (typeof currentPassword !== 'string' || currentPassword.length === 0)
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'CURRENT_PASSWORD_REQUIRED',
                    message: 'Current password is required to change your password.',
                });
            }

            const currentPasswordIsValid =
                await verifyPassword(currentPassword, user.passwordHash);

            if (!currentPasswordIsValid)
            {
                throw createApiError({
                    statusCode: 401,
                    code: 'INVALID_CURRENT_PASSWORD',
                    message: 'The current password you entered is incorrect.',
                });
            }
        }

        const newPasswordHash = await hashPassword(password);

        await userRepository.updatePasswordHash({
            userId: user._id,
            passwordHash: newPasswordHash,
        });

        // Outstanding reset links are no longer actionable once the customer
        // controls a working password. Reuses the existing reset token purge.
        await passwordResetTokenRepository.deleteExistingTokens({
            email: user.email,
        });

        return {
            success: true,
            message: hasUsablePassword
                ? 'Your password has been changed successfully.'
                : 'Your password has been set successfully.',
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
     *
     * Enumeration protection: unknown emails, and any non-customer account,
     * receive the exact same generic response as a real customer. A token is
     * created and an email dispatched ONLY for customer accounts.
     */
    const requestPasswordReset = async ({ email }) =>
    {
        const targetEmail = email.toLowerCase().trim();

        if (!/^\S+@\S+\.\S+$/.test(targetEmail))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_EMAIL',
                message: 'Please provide a valid email address.',
            });
        }

        const user =
            await userRepository.findByEmail(targetEmail);

        // Identical generic response for unknown / non-customer accounts.
        // Never reveals whether the account exists or which role it holds.
        if (!user || user.role !== ROLES.CUSTOMER)
        {
            return {
                success: true,
                message: 'If an account exists for this email address, a password reset link has been sent.',
            };
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
            message: 'If an account exists for this email address, a password reset link has been sent.',
        };
    };



    /**
     * Password Reset Executer.
     *
     * Produces a bcrypt passwordHash (same format as Phase 2/3 password
     * flows). Rejects invalid passwords BEFORE any database write, and
     * restricts resets to customer accounts only.
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

        // Password policy (shared Phase 3 utility). Fails before any DB write.
        if (!isValidPasswordPolicy(newPassword))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_PASSWORD',
                message: 'Password must be a non-empty string between 8 and 72 characters.',
            });
        }

        const user = await userRepository.findByEmail(activeToken.email);
        if (!user)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'System updates failed. User account associated with this token was not found.'
            });
        }

        // Security boundary: reset tokens are issued to customers only.
        // A legacy/non-customer token must never reset a seller/admin account.
        if (user.role !== ROLES.CUSTOMER)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_OR_EXPIRED_TOKEN',
                message: 'The password reset link is invalid or has expired. Please request a new recovery link.'
            });
        }

        // CRITICAL: bcrypt-hash the new password. Legacy flow stored an
        // unsalted SHA-256 hash here which password-login could never verify.
        const newPasswordHash = await hashPassword(newPassword);

        await userRepository.updatePasswordHash({
            userId: user._id,
            passwordHash: newPasswordHash,
        });

        // Single use: purge the used token and any outstanding ones.
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

        // 1. Hash input token to locate database record
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

        // 2. Replay Attack Detection: If token is already used, ban the entire family lineage immediately!
        if (sessionToken.isUsed)
        {
            await refreshTokenRepository.revokeFamily({ familyId: sessionToken.familyId });
            throw createApiError({
                statusCode: 401,
                code: 'SECURITY_ALERT_REPLAY_ATTEMPT',
                message: 'Security Alert: This refresh token has already been rotated. Suspicious reuse detected. Session terminated.'
            });
        }

        // 3. Token is valid and unused -> Trigger Rotation
        const userId = sessionToken.user;
        const familyId = sessionToken.familyId;

        // Flag current token as used
        await refreshTokenRepository.markAsUsed({ id: sessionToken._id });

        // 4. Generate fresh rotated tokens under same family lineage
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
        signinCustomerWithPassword,
        setPassword,
        requestPasswordReset,
        resetPassword,
        refreshSession, // Added session rotation action
        logout,         // Added logout action
    });
};