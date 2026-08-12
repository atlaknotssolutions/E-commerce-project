/**
 * Pure function-based routing factory representing the Payment Verification API gateways.
 * Binds payment paths directly to authenticators filters using dependency injection.
 */
export const createPaymentRoutes = ({
    router,
    paymentController,
    authenticate,
    authenticateOptional,
    asyncHandler
}) =>
{

    // ==========================================
    // SECURED PAYMENTS GATEWAYS (/api/payment/*)
    // ==========================================

    // Stripe Checkout Session Verification
    // Stripe (Specific)
    // Auth-optional: accepts a valid Bearer JWT OR the Stripe checkout
    // session id itself as the capability credential (only the browser that
    // completed checkout receives it via the success_url redirect).
    router.get(
        '/api/payment/stripe/:sessionId',
        authenticateOptional,
        asyncHandler(paymentController.verifyStripePayment)
    );

    // Customer Endpoint: Validates captured transaction success, running atomic double-entry accounting ledgers inside razorpay transaction sessions
    // Razorpay (Generic)
    // Auth-optional: same capability model as the Stripe verification route.
    router.get(
        '/api/payment/:paymentId',
        authenticateOptional,
        asyncHandler(paymentController.verifyPayment)
    );



    // Customer Endpoint: Re-issues a brand-new, active checkout payment link URL for a pending split order
    router.post(
        '/api/payment/:paymentMethod/order/:orderId',
        authenticate,
        asyncHandler(paymentController.reissuePaymentLink)
    );

    return router;
};