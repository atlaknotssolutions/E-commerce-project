/**
 * Pure function-based factory representing the Merchant Seller Authentication HTTP Controllers.
 * Strictly enforces thin controller design principles, avoiding classes and context leaks.
 */
export const createSellerAuthController = ({ sellerAuthService, createApiError }) =>
{

    /**
     * Registers a brand-new merchant seller account (Onboarding).
     * Maps exactly to: POST /sellers
     */
    const createSeller = async (req, res) =>
    {
        const sellerPayload = req.body; // Captures complete merchant registration payload

        const newSeller = await sellerAuthService.createSeller(sellerPayload);

        // 201 Created: Standard HTTP code for successful resource creation
        res.status(201).json({
            success: true,
            message:
                'Seller account created successfully. Please verify your email.',
            seller: newSeller,
        });
    };

    /**
     * Dispatches login OTP to registered merchant business email ids.
     * Maps exactly to: POST /sellers/sent/login-top
     */
    const sendOTP = async (req, res) =>
    {
        const { email } = req.body;

        // Standard business delegation
        const outcome = await sellerAuthService.sendSellerLoginOtp({ email });

        // 201 Created: Dynamic verification resource successfully allocated
        res.status(201).json(outcome);
    };

    /**
     * Verifies login OTP codes to authorize merchant login sessions.
     * Maps exactly to: POST /sellers/verify/login-top
     */
    const signin = async (req, res) =>
    {
        const { email, otp } = req.body;

        const outcome = await sellerAuthService.verifySellerLoginOtp({ email, otp });

        // 200 OK: Emits standard AuthResponse token payload to React Client
        res.status(200).json(outcome);
    };

    /**
     * Finalizes email verification pipeline to confirm merchant onboarding setups.
     * Maps exactly to: PATCH /sellers/verify/:otp
     */
    const verifyEmail = async (req, res) =>
    {
        // Captures standard dynamic OTP tokens from URL path variables parameters
        const { otp } = req.params;

        // Support email extraction from either body context or optional query string structures
        const email = (req.body && req.body.email) || req.query.email;

        const outcome = await sellerAuthService.verifySellerEmailByOtp({ email, otp });

        res.status(200).json(outcome);
    };

    /**
     * Authorizes existing sellers via email + bcrypt password.
     * Maps exactly to: POST /sellers/password-login
     */
    const passwordSignin = async (req, res) =>
    {
        const { email, password } = req.body;

        if (!email || !password)
        {
            throw createApiError({
                statusCode: 400,
                code: 'MISSING_REQUIRED_FIELDS',
                message: 'Email and password are required.',
            });
        }

        const outcome =
            await sellerAuthService.signinSellerWithPassword({ email, password });

        res.status(200).json(outcome);
    };

    /**
     * Sets a password on an OTP-created Seller account, or changes an
     * existing one after verifying the current password.
     * Maps exactly to: POST /sellers/password (authenticated + ROLE_SELLER)
     */
    const setPassword = async (req, res) =>
    {
        const { password, currentPassword } = req.body;

        if (!password)
        {
            throw createApiError({
                statusCode: 400,
                code: 'MISSING_REQUIRED_FIELDS',
                message: 'A new password is required.',
            });
        }

        const outcome = await sellerAuthService.setSellerPassword({
            sellerId: req.user.id,
            password,
            currentPassword,
        });

        res.status(200).json(outcome);
    };

    /**
     * Initiates the Seller forgot-password workflow generating a temporary
     * secure recovery link.
     * Maps exactly to: POST /sellers/reset-password-request
     */
    const requestPasswordReset = async (req, res) =>
    {
        const { email } = req.body;

        if (!email)
        {
            throw createApiError({
                statusCode: 400,
                code: 'MISSING_REQUIRED_FIELDS',
                message: 'Email is required.',
            });
        }

        const outcome =
            await sellerAuthService.requestSellerPasswordReset({ email });

        res.status(200).json(outcome);
    };

    /**
     * Commits the Seller password modifications after validating the
     * recovery token.
     * Maps exactly to: POST /sellers/reset-password
     */
    const resetPassword = async (req, res) =>
    {
        const { token, password } = req.body;

        if (!token || !password)
        {
            throw createApiError({
                statusCode: 400,
                code: 'MISSING_REQUIRED_FIELDS',
                message: 'Token and new password are required.',
            });
        }

        const outcome = await sellerAuthService.resetSellerPassword({
            token,
            newPassword: password,
        });

        res.status(200).json(outcome);
    };

    /**
 * Verifies merchant email using one-click verification link.
 * Maps exactly to: GET /sellers/verify/:token
 */
    const verifyEmailLink = async (req, res) =>
    {
        const { token } = req.params;

        const result =
            await sellerAuthService.verifySellerEmailByLink({
                token,
            });

        const message = encodeURIComponent("Seller email verified successfully! Please login & continue.");

        res.redirect(
            `${process.env.FRONTEND_URL}/become-seller?verified=true&message=${message}`
        );
    };

    return Object.freeze({
        createSeller,
        sendOTP,
        signin,
        verifyEmail,
        verifyEmailLink,
        passwordSignin,
        setPassword,
        requestPasswordReset,
        resetPassword,
    });
};