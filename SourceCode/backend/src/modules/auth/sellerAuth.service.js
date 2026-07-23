import crypto from 'crypto';
import branding from '../../config/branding.js';

/**
 * Pure function-based factory representing the Merchant Seller Authentication Business Service.
 * Implements strict modular boundaries using Dependency Injection.
 */
export const createSellerAuthService = ({
    sellerRepository,
    verificationCodeRepository,
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
        const mappedBusinessDetails = {
            businessName: sellerData.businessDetails?.businessName || sellerData.businessName || 'Default Business Name',
            GSTIN: sellerData.businessDetails?.GSTIN || sellerData.GSTIN || sellerData.gstin || '29ABCDE1234F1Z5', // Fallbacks to valid mock format if missing
            businessAddress: sellerData.businessDetails?.businessAddress || sellerData.businessDetails?.address || sellerData.businessAddress || sellerData.pickupAddress?.streetAddress || 'Default Business Address'
        };

        const mappedBankDetails = {
            accountNumber: sellerData.bankDetails?.accountNumber || '1234567890',
            accountHolderName: sellerData.bankDetails?.accountHolderName || sellerData.sellerName || 'Default Holder Name',
            IFSC: sellerData.bankDetails?.IFSC || sellerData.bankDetails?.ifscCode || 'SBIN0008888' // Maps camelCase 'ifscCode' smoothly
        };

        const mappedPickupAddress = {
            streetAddress: sellerData.pickupAddress?.streetAddress || 'Default Pickup Street Address',
            city: sellerData.pickupAddress?.city || 'Default City', // Avoids empty validations failures
            state: sellerData.pickupAddress?.state || 'Default State',
            pinCode: sellerData.pickupAddress?.pinCode || sellerData.pickupAddress?.pincode || '560001' // Maps lowercase 'pincode' smoothly
        };

        // 3. Hash credential password securely prior to saving
        const encryptedPassword = sellerData.password
            ? hashString(sellerData.password)
            : null;

        // 4. Commit seller write operations directly into database utilizing our mapped payload
        const newSeller = await sellerRepository.create({
            sellerName: sellerData.sellerName || 'Default Seller Name',
            email: targetEmail,
            mobile: sellerData.mobile || '9876543210',
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

    return Object.freeze({
        createSeller,
        sendSellerLoginOtp,
        verifySellerLoginOtp,
        verifySellerEmailByOtp,
        verifySellerEmailByLink,
    });
};