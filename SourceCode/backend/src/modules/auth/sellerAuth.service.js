import crypto from 'crypto';
import branding from '../../config/branding.js';
import { ROLES } from '../../constants/enums.js';
import {
    hashPassword,
    isValidPasswordPolicy,
    isUsablePasswordHash,
    verifyPassword,
} from '../../utils/password.js';

/**
 * Pure function-based factory representing the Merchant Seller Authentication Business Service.
 * Implements strict modular boundaries using Dependency Injection.
 */
export const createSellerAuthService = ({
    sellerRepository,
    verificationCodeRepository,
    passwordResetTokenRepository,
    generateOTP,
    emailClient,
    signToken,
    createApiError,
    jwtAccessSecret,
    jwtAccessExpiresIn,
}) =>
{

    /**
     * Internal high-speed SHA-256 OTP hashing utility.
     */
    const hashString = (data) =>
    {
        return crypto.createHash('sha256').update(data).digest('hex');
    };


    const validateSellerOtp = async ({
        email,
        otp,
        purpose,
    }) =>
    {
        const activeCode =
            await verificationCodeRepository.findActiveCode({
                email,
                purpose,
            });

        if (!activeCode)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_OR_EXPIRED_OTP',
                message: 'The verification session is invalid or has expired.',
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
                message: 'Maximum verification failures reached. Code locked.',
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
     * Onboards a brand-new merchant seller account.
     * Applies robust defensive payload mapping to support React frontend properties variations.
     */
    const createSeller = async (sellerData) =>
    {
        const targetEmail = sellerData.email.toLowerCase().trim();

        // 1. Core Check: Prevent duplicate email registration attempts
        const existingSeller = await sellerRepository.findByEmail(targetEmail);
        if (existingSeller)
        {
            throw createApiError({
                statusCode: 409,
                code: 'DUPLICATE_SELLER_EMAIL',
                message: `Onboarding failed: A business merchant profile is already registered under '${targetEmail}'.`
            });
        }

        // 2. Defensive Payload Mapping: Converts flat/camelCase frontend keys to strict Mongoose schema expectations
        const requireField = (value, fieldName) =>
        {
            if (!value || String(value).trim() === '')
            {
                throw createApiError({
                    statusCode: 400,
                    code: 'MISSING_REQUIRED_FIELD',
                    message: `Onboarding failed: '${fieldName}' is required.`,
                });
            }

            return String(value).trim();
        };

        const businessName = requireField(
            sellerData.businessDetails?.businessName || sellerData.businessName,
            'businessName'
        );

        const gstin = requireField(
            sellerData.businessDetails?.GSTIN || sellerData.GSTIN || sellerData.gstin,
            'GSTIN'
        );

        const businessAddress = requireField(
            sellerData.businessDetails?.businessAddress ||
            sellerData.businessDetails?.address ||
            sellerData.businessAddress ||
            sellerData.pickupAddress?.streetAddress,
            'businessAddress'
        );

        const mappedBusinessDetails = {
            businessName,
            GSTIN: gstin,
            businessAddress,
        };

        const mappedBankDetails = {
            accountNumber: requireField(
                sellerData.bankDetails?.accountNumber,
                'bankDetails.accountNumber'
            ),
            accountHolderName: requireField(
                sellerData.bankDetails?.accountHolderName || sellerData.sellerName,
                'bankDetails.accountHolderName'
            ),
            IFSC: requireField(
                sellerData.bankDetails?.IFSC || sellerData.bankDetails?.ifscCode,
                'bankDetails.IFSC'
            ),
        };

        const mappedPickupAddress = {
            streetAddress: requireField(
                sellerData.pickupAddress?.streetAddress ||
                sellerData.pickupAddress?.address,
                'pickupAddress.streetAddress'
            ),
            city: requireField(
                sellerData.pickupAddress?.city,
                'pickupAddress.city'
            ),
            state: requireField(
                sellerData.pickupAddress?.state,
                'pickupAddress.state'
            ),
            pinCode: requireField(
                sellerData.pickupAddress?.pinCode || sellerData.pickupAddress?.pincode,
                'pickupAddress.pinCode'
            ),
        };

        const sellerName = requireField(
            sellerData.sellerName,
            'sellerName'
        );

        const mobile = requireField(
            sellerData.mobile,
            'mobile'
        );

        // 3. Hash credential password securely prior to saving
        const encryptedPassword = sellerData.password
            ? hashString(sellerData.password)
            : null;

        // 4. Commit seller write operations directly into database utilizing our mapped payload
        const newSeller = await sellerRepository.create({
            sellerName,
            email: targetEmail,
            mobile,
            passwordHash: encryptedPassword,
            role: 'ROLE_SELLER',
            isEmailVerified: false,
            accountStatus: 'PENDING_VERIFICATION',
            businessDetails: mappedBusinessDetails,
            bankDetails: mappedBankDetails,
            pickupAddress: mappedPickupAddress
        });

        // 5. Generate dynamic 6-digit email-verification OTP
        const otp = generateOTP();
        const otpHash = hashString(otp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valid for exactly 10 minutes

        // Generate one-time email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const verificationTokenHash = hashString(verificationToken);

        const verificationTokenExpiresAt =
            new Date(Date.now() + 10 * 60 * 1000);

        const verificationLink =
            `${process.env.API_BASE_URL}/sellers/verify-email/${verificationToken}`;


        // 6. Persist code state using verification repository
        await verificationCodeRepository.deleteExistingCodes({ email: targetEmail, purpose: 'SELLER_EMAIL_VERIFICATION' });
        await verificationCodeRepository.saveCode({
            email: targetEmail,

            otpHash,

            verificationTokenHash,

            verificationTokenExpiresAt,

            purpose: 'SELLER_EMAIL_VERIFICATION',

            expiresAt,
        });

        // 7. Deliver welcome verification OTP directly to the merchant inbox
        // await emailClient.sendEmail({
        //     toEmail: targetEmail,
        //     otp,
        //     verificationLink
        // });

        // await emailClient.sendEmail({
        //     toEmail: seller.businessEmail,
        //     otp,
        //     recipientName: seller.businessDetails.businessName,
        //     verificationLink,
        // });


        await emailClient.sendEmail({
            toEmail: targetEmail,

            recipientName:
                newSeller.businessDetails.businessName ||
                newSeller.sellerName ||
                'Seller',

            otp,
            verificationLink,

            title: 'Verify Your Email',

            subject: `${branding.appName} • Verify Your Email`,

            message: `
Welcome to <strong>${branding.appName}</strong>.

Please verify your email address to activate your seller account.

You can either use the OTP below or simply click the
<strong>Verify My Email</strong> button.
`,

            showVerificationButton: true,
            buttonText: 'Verify My Email',
        });

        return newSeller;
    };

    /**
     * Dispatched verification OTP for existing onboarded sellers.
     */
    const sendSellerLoginOtp = async ({ email }) =>
    {
        const targetEmail = email.toLowerCase().trim();

        const sellerExists = await sellerRepository.findByEmail(targetEmail);
        if (!sellerExists)
        {
            throw createApiError({
                statusCode: 404,
                code: 'SELLER_NOT_FOUND',
                message: 'No registered merchant profile matches the provided email address.'
            });
        }

        if (sellerExists.accountStatus === 'BANNED' || sellerExists.accountStatus === 'SUSPENDED')
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCOUNT_SUSPENDED',
                message: 'Access Denied: This merchant account has been suspended or banned due to compliance violations.'
            });
        }

        const otp = generateOTP();
        const otpHash = hashString(otp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valid for exactly 10 minutes

        await verificationCodeRepository.deleteExistingCodes({ email: targetEmail, purpose: 'SELLER_LOGIN' });
        await verificationCodeRepository.saveCode({
            email: targetEmail,
            otpHash,
            purpose: 'SELLER_LOGIN',
            expiresAt,
        });

        // await emailClient.sendEmail({ toEmail: targetEmail, otp });

        await emailClient.sendEmail({
            toEmail: targetEmail,

            recipientName:
                sellerExists.businessDetails.businessName ||
                sellerExists.sellerName ||
                'Seller',

            otp,

            title: 'Seller Login Verification',

            subject: `${branding.appName} • Seller Login Verification`,

            message: `
Use the verification code below to securely sign in to your seller account.

This verification code is valid for 10 minutes.
`,

            showVerificationButton: false,
        });

        return { message: 'Verification OTP has been successfully transmitted to your merchant email.' };
    };

    /**
     * Validates merchant login OTP inputs and issues system authorization tokens.
     */
    const verifySellerLoginOtp = async ({ email, otp }) =>
    {
        const targetEmail = email.toLowerCase().trim();

        const sellerExists = await sellerRepository.findByEmail(targetEmail);
        if (!sellerExists)
        {
            throw createApiError({
                statusCode: 404,
                code: 'SELLER_NOT_FOUND',
                message: 'No registered merchant account found matching this email.'
            });
        }

        await validateSellerOtp({
            email: targetEmail,
            otp,
            purpose: 'SELLER_LOGIN',
        });

        const tokenPayload = { id: sellerExists._id, email: sellerExists.email, role: sellerExists.role };
        const accessToken = signToken({ payload: tokenPayload, secret: jwtAccessSecret, expiresIn: jwtAccessExpiresIn });

        return {
            jwt: accessToken,
            status: true,
            message: 'Merchant session successfully verified.',
            role: sellerExists.role,
        };
    };

    /**
     * Standard Email Verification Pipeline (Finalizes merchant registers).
     */
    const verifySellerEmailByOtp = async ({ email, otp }) =>
    {
        const targetEmail = email.toLowerCase().trim();

        await validateSellerOtp({
            email: targetEmail,
            otp,
            purpose: 'SELLER_EMAIL_VERIFICATION',
        });

        const seller = await sellerRepository.findByEmail(targetEmail);
        if (!seller)
        {
            throw createApiError({
                statusCode: 404,
                code: 'SELLER_NOT_FOUND',
                message: 'No registered seller matches the email associated with this verification code.'
            });
        }

        const verifiedSeller = await sellerRepository.updateVerificationStatus({ id: seller._id, isEmailVerified: true, accountStatus: 'ACTIVE', });

        return {
            success: true,
            message: 'Merchant email successfully verified and onboarded.',
            seller: verifiedSeller,
        };
    };


    /**
 * Verifies merchant email using one-click verification link.
 */
    const verifySellerEmailByLink = async ({ token }) =>
    {
        const verificationTokenHash = hashString(token);

        const activeCode =
            await verificationCodeRepository.findActiveVerificationToken({
                verificationTokenHash
            });

        if (!activeCode)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_OR_EXPIRED_LINK',
                message: 'Verification link is invalid or has expired.'
            });
        }

        const seller = await sellerRepository.findByEmail(activeCode.email);

        if (!seller)
        {
            throw createApiError({
                statusCode: 404,
                code: 'SELLER_NOT_FOUND',
                message: 'Seller account not found.'
            });
        }

        if (seller.isEmailVerified)
        {
            return {
                success: true,
                message: 'Seller account is already verified.',
                seller
            };
        }

        await verificationCodeRepository.markAsConsumed({
            id: activeCode._id
        });

        const verifiedSeller =
            await sellerRepository.updateVerificationStatus({
                id: seller._id,
                isEmailVerified: true,
                accountStatus: 'ACTIVE',
            });

        return {
            success: true,
            message: 'Seller email verified successfully.',
            seller: verifiedSeller
        };
    };

    /**
     * Password-based signin for sellers who have set a bcrypt password.
     * Maps exactly to: POST /sellers/password-login
     *
     * Deliberately returns ONE generic authentication failure for every
     * invalid combination (unknown email, non-seller role, missing/legacy
     * password hash, banned/suspended account, wrong password) to prevent
     * account enumeration.
     *
     * Issues the SAME session contract as the existing Seller OTP login:
     * a JWT access token with payload { id, email, role }. The Seller
     * architecture has no refresh-token mechanism, so none is issued here.
     */
    const signinSellerWithPassword = async ({ email, password }) =>
    {
        const targetEmail = email.toLowerCase().trim();

        // passwordHash is schema-level `select: false`; this is the ONLY
        // repository read that explicitly requests it for verification.
        const existingSeller =
            await sellerRepository.findByEmailWithPassword(targetEmail);

        // Short-circuit chain: bcrypt only runs when a usable hash exists
        // and the account is a legitimate, active Seller.
        const passwordIsValid =
            existingSeller
            && existingSeller.role === ROLES.SELLER
            && existingSeller.accountStatus !== 'BANNED'
            && existingSeller.accountStatus !== 'SUSPENDED'
            && isUsablePasswordHash(existingSeller.passwordHash)
            && typeof password === 'string'
            && password.length > 0
            && await verifyPassword(password, existingSeller.passwordHash);

        if (!passwordIsValid)
        {
            throw createApiError({
                statusCode: 401,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password.',
            });
        }

        const tokenPayload = { id: existingSeller._id, email: existingSeller.email, role: existingSeller.role };
        const accessToken = signToken({ payload: tokenPayload, secret: jwtAccessSecret, expiresIn: jwtAccessExpiresIn });

        return {
            jwt: accessToken,
            status: true,
            message: 'Merchant session successfully verified.',
            role: existingSeller.role,
        };
    };

    /**
     * Sets a password on a legacy/OTP-created Seller account, or changes an
     * existing password after verifying the current one.
     * Maps exactly to: POST /sellers/password (authenticated + ROLE_SELLER)
     *
     * Case A (no usable bcrypt hash): only `password` is required.
     * Case B (usable bcrypt hash): `currentPassword` must be provided and
     * verified before the hash is replaced.
     *
     * Reuses the shared password utility (same bcrypt cost as Customer).
     */
    const setSellerPassword = async ({ sellerId, password, currentPassword }) =>
    {
        // passwordHash is schema-level `select: false`; this is the ONLY
        // repository read that explicitly requests it for this decision.
        const seller = await sellerRepository.findByIdWithPassword(sellerId);

        if (!seller)
        {
            throw createApiError({
                statusCode: 404,
                code: 'SELLER_NOT_FOUND',
                message: 'The requested merchant account profile does not exist.',
            });
        }

        // Defense in depth: the route is already role-guarded, but the
        // service independently refuses non-seller principals.
        if (seller.role !== ROLES.SELLER)
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: `Access Forbidden: Your account role (${seller.role}) does not possess authorizations to execute this operational run.`,
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

        const hasUsablePassword = isUsablePasswordHash(seller.passwordHash);

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
                await verifyPassword(currentPassword, seller.passwordHash);

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

        await sellerRepository.updatePasswordHash({
            userId: seller._id,
            passwordHash: newPasswordHash,
        });

        // Outstanding reset links are no longer actionable once the seller
        // controls a working password. Reuses the existing reset token purge.
        await passwordResetTokenRepository.deleteExistingTokens({
            email: seller.email,
        });

        return {
            success: true,
            message: hasUsablePassword
                ? 'Your password has been changed successfully.'
                : 'Your password has been set successfully.',
        };
    };

    /**
     * Generates and dispatches a secure password reset link for Sellers.
     * Maps exactly to: POST /sellers/reset-password-request
     *
     * Enumeration protection: unknown emails, and any non-seller account,
     * receive the exact same generic response as a real Seller. A token is
     * created and an email dispatched ONLY for legitimate Seller accounts.
     *
     * Reuses the existing PasswordResetToken infrastructure (SHA-256 token
     * hashing, 15-minute expiry, deleteExistingTokens, single-use purge).
     */
    const requestSellerPasswordReset = async ({ email }) =>
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

        const seller =
            await sellerRepository.findByEmail(targetEmail);

        // Identical generic response for unknown / non-seller / banned /
        // suspended accounts. Never reveals whether the account exists or
        // which role it holds.
        if (!seller
            || seller.role !== ROLES.SELLER
            || seller.accountStatus === 'BANNED'
            || seller.accountStatus === 'SUSPENDED')
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
            `${process.env.FRONTEND_URL}/seller/reset-password?token=${rawToken}`;

        // Send email
        await emailClient.sendEmail({
            toEmail: targetEmail,

            recipientName:
                seller.businessDetails?.businessName ||
                seller.sellerName ||
                'Seller',

            subject:
                `${branding.appName} • Seller Password Reset Request`,

            title:
                'Reset Your Seller Password',

            otp: null,

            message: `
            We received a request to reset your seller account password.

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
     * Seller Password Reset Executer.
     * Maps exactly to: POST /sellers/reset-password
     *
     * Produces a bcrypt passwordHash (same format as the Customer reset
     * flow). Rejects invalid passwords BEFORE any database write, and
     * restricts resets to Seller accounts only. Invalid/expired/replayed
     * tokens all surface the same generic error so nothing is revealed
     * about the token, the user, or the role.
     */
    const resetSellerPassword = async ({ token, newPassword }) =>
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

        // Password policy (shared utility). Fails before any DB write.
        if (!isValidPasswordPolicy(newPassword))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_PASSWORD',
                message: 'Password must be a non-empty string between 8 and 72 characters.',
            });
        }

        const seller = await sellerRepository.findByEmail(activeToken.email);

        // Generic token failure: never reveals whether the token belonged to
        // an account, or which role that account holds.
        if (!seller || seller.role !== ROLES.SELLER)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_OR_EXPIRED_TOKEN',
                message: 'The password reset link is invalid or has expired. Please request a new recovery link.'
            });
        }

        const newPasswordHash = await hashPassword(newPassword);

        await sellerRepository.updatePasswordHash({
            userId: seller._id,
            passwordHash: newPasswordHash,
        });

        // Single use: purge the used token and any outstanding ones.
        await passwordResetTokenRepository.deleteExistingTokens({ email: activeToken.email });

        return { success: true, message: 'Your password has been successfully reset. Please log in with your new credentials.' };
    };

    return Object.freeze({
        createSeller,
        sendSellerLoginOtp,
        verifySellerLoginOtp,
        verifySellerEmailByOtp,
        verifySellerEmailByLink,
        signinSellerWithPassword,
        setSellerPassword,
        requestSellerPasswordReset,
        resetSellerPassword,
    });
};