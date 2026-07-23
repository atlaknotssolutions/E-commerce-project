/**
 * Pure function-based routing factory representing the Payment Verification API gateways.
 * Binds payment paths directly to authenticators filters using dependency injection.
 */
export const createPaymentRoutes = ({
    router,
    paymentController,
    authenticate,
    asyncHandler
}) =>
{

    // ==========================================
    // SECURED PAYMENTS GATEWAYS (/api/payment/*)
    // ==========================================

    // Stripe Checkout Session Verification
    // Stripe (Specific)
    router.get(
        '/api/payment/stripe/:sessionId',
        authenticate,
        asyncHandler(paymentController.verifyStripePayment)
    );

    // Customer Endpoint: Validates captured transaction success, running atomic double-entry accounting ledgers inside razorpay transaction sessions
    // Razorpay (Generic)
    router.get(
        '/api/payment/:paymentId',
        authenticate,
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