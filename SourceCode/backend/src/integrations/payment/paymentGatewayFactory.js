/**
 * Payment Gateway Factory — central resolution point for all gateway operations.
 *
 * Uses a registration pattern instead of switch statements.
 * Services never import gateway implementations directly.
 *
 * Usage:
 *   factory.register('RAZORPAY', razorpayGateway);
 *   factory.register('STRIPE', stripeGateway);
 *   factory.register('RAZORPAYX', razorpayXGateway);
 *
 *   const gateway = factory.get('RAZORPAY');
 *   await gateway.createRefund({ ... });
 *
 * When switching to production, change which implementation is registered —
 * services, controllers, and routes remain unchanged.
 */
export const createPaymentGatewayFactory = () => {
    const gateways = new Map();

    /**
     * Registers a gateway implementation for a given provider key.
     * @param {string} key     - Provider identifier (e.g., "RAZORPAY", "STRIPE", "RAZORPAYX")
     * @param {Object} gateway - Implementation exposing createPayout/createRefund/etc.
     */
    const register = (key, gateway) => {
        gateways.set(key, gateway);
    };

    /**
     * Retrieves a registered gateway by provider key.
     * @param {string} key     - Provider identifier
     * @returns {Object}       - Gateway implementation
     * @throws {Error}         - If no gateway is registered for the key
     */
    const get = (key) => {
        const gateway = gateways.get(key);
        if (!gateway) {
            throw new Error(`No gateway registered for provider: ${key}`);
        }
        return gateway;
    };

    /**
     * Returns the appropriate refund gateway based on the original payment method.
     * @param {string} paymentMethod - "RAZORPAY" | "STRIPE"
     * @returns {Object}             - Gateway implementation
     */
    const getRefundGateway = (paymentMethod) => {
        return get(paymentMethod);
    };

    /**
     * Returns the payout gateway. Currently only RazorpayX.
     * @param {string} [provider] - Optional provider override (default: "RAZORPAYX")
     * @returns {Object}          - Gateway implementation
     */
    const getPayoutGateway = (provider = 'RAZORPAYX') => {
        return get(provider);
    };

    /**
     * Returns all registered provider keys (for dashboard/debugging).
     * @returns {string[]}
     */
    const getRegisteredProviders = () => {
        return Array.from(gateways.keys());
    };

    return Object.freeze({
        register,
        get,
        getRefundGateway,
        getPayoutGateway,
        getRegisteredProviders,
    });
};
