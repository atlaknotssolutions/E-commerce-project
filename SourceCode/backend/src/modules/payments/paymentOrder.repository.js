/**
 * Pure function-based factory representing the PaymentOrder Persistence database interface.
 * Decouples database collections lookup pipelines using Dependency Injection.
 */
export const createPaymentOrderRepository = ({ PaymentOrder }) =>
{

    /**
     * Commits a new parent payment order document directly into database.
     * Supports array-wrap configurations to run smoothly inside transactions.
     */
    const createPaymentOrder = async (paymentOrderData, options = {}) =>
    {
        const [newPaymentOrder] = await PaymentOrder.create([paymentOrderData], options);
        return newPaymentOrder ? newPaymentOrder.toObject() : null;
    };

    /**
* Retrieves a payment order using its MongoDB identifier.
* Populates child orders for downstream settlement processing.
*/
    const findById = async (
        paymentOrderId,
        options = {}
    ) =>
    {
        return PaymentOrder.findById(
            paymentOrderId,
            null,
            options
        )
            .populate("orders")
            .lean();
    };

    /**
     * Locates a payment order container using unique sparse provider link ID.
     * Populates linked split child orders cleanly to allow inline atomic updates.
     */
    const findByPaymentLinkId = async (paymentLinkId, options = {}) =>
    {
        return PaymentOrder.findOne({ paymentLinkId }, null, options)
            .populate('orders') // Populates split child orders list to enable mass updates
            .lean(); // Returns plain lightweight JS objects for fast memory rendering
    };

    /**
     * Commits final transaction status (e.g., SUCCESS, FAILED) and attaches gateway payment ID.
     */
    const updateStatus = async ({ paymentOrderId, status, providerPaymentId }, options = {}) =>
    {
        return PaymentOrder.findByIdAndUpdate(
            paymentOrderId,
            {
                status,
                providerPaymentId
            },
            { ...options, new: true, runValidators: true } // Returns updated record enforcing schema validations
        ).lean();
    };


    /**
 * Retrieves payment information for a specific order.
 * Since one PaymentOrder can contain multiple split orders,
 * we search by the embedded order ObjectId.
 */
    const findByOrderId = async (orderId, options = {}) =>
    {
        return PaymentOrder.findOne(
            { orders: orderId },
            null,
            options
        ).lean();
    };

    /**
 * Updates gateway payment link ID after successful payment link creation.
 */
    const updatePaymentLinkId = async ({
        paymentOrderId,
        paymentLinkId
    }, options = {}) =>
    {
        return PaymentOrder.findByIdAndUpdate(
            paymentOrderId,
            {
                paymentLinkId
            },
            {
                ...options,
                new: true,
                runValidators: true
            }
        ).lean();
    };



    return Object.freeze({
        createPaymentOrder,
        findById,
        findByOrderId,
        findByPaymentLinkId,
        updateStatus,
        updatePaymentLinkId,
    });
};