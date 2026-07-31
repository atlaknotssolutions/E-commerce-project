import crypto from 'crypto';

const verifyWebhookSignature = (webhookSecret) => (req, res, next) => {
    if (!webhookSecret) {
        return next();
    }

    const signature = req.headers['x-razorpay-signature'] || req.headers['x-webhook-signature'];
    if (!signature) {
        return res.status(401).json({ success: false, message: 'Missing webhook signature' });
    }

    try {
        const body = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        const sigBuf = Buffer.from(signature, 'hex');
        const expBuf = Buffer.from(expectedSignature, 'hex');

        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
            return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
        }
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Webhook signature verification failed' });
    }

    next();
};

const validatePayoutWebhook = (req, res, next) => {
    const { payout_id, status } = req.body;
    if (!payout_id || typeof payout_id !== 'string') {
        return res.status(400).json({ success: false, message: 'payout_id is required and must be a string' });
    }
    if (!status || typeof status !== 'string') {
        return res.status(400).json({ success: false, message: 'status is required and must be a string' });
    }
    next();
};

const validateRefundWebhook = (req, res, next) => {
    const { refund_id, status } = req.body;
    if (!refund_id || typeof refund_id !== 'string') {
        return res.status(400).json({ success: false, message: 'refund_id is required and must be a string' });
    }
    if (!status || typeof status !== 'string') {
        return res.status(400).json({ success: false, message: 'status is required and must be a string' });
    }
    next();
};

export const createGatewayRoutes = ({
    router,
    controller,
    authenticate,
    authorizeRoles,
    asyncHandler,
    webhookSecret,
    razorpayXWebhookSecret,
}) => {

    const verifyMockSignature = verifyWebhookSignature(webhookSecret);
    const verifyRazorpayXSignature = verifyWebhookSignature(razorpayXWebhookSecret || webhookSecret);

    // Webhook endpoints — HMAC verified, no auth required
    // Mock webhook endpoints
    router.post(
        '/webhooks/mock/razorpayx',
        verifyMockSignature,
        validatePayoutWebhook,
        asyncHandler(controller.handlePayoutWebhook)
    );

    router.post(
        '/webhooks/mock/razorpay',
        verifyMockSignature,
        validateRefundWebhook,
        asyncHandler(controller.handleRefundWebhook)
    );

    // Real RazorpayX webhook endpoint
    router.post(
        '/webhooks/razorpayx',
        verifyRazorpayXSignature,
        asyncHandler(controller.handleRazorpayXWebhook)
    );

    // Admin gateway dashboard
    router.get(
        '/admin/gateway/dashboard',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getDashboard)
    );

    // Admin gateway events log
    router.get(
        '/admin/gateway/events',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getEvents)
    );

    // Admin gateway event timeline
    router.get(
        '/admin/gateway/timeline/:entityType/:entityId',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getTimeline)
    );

    // TASK 5: Admin retry failed payout
    router.patch(
        '/admin/payouts/:id/retry',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.retryPayout)
    );

    // TASK 7: Gateway health endpoint
    router.get(
        '/admin/gateway/health',
        authenticate,
        authorizeRoles('ROLE_ADMIN'),
        asyncHandler(controller.getHealth)
    );

    return Object.freeze(router);
};
