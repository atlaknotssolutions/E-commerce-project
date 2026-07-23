/**
 * Pure function-based factory representing the Payment Verification HTTP API Controllers.
 * Strictly enforces thin controller design principles, avoiding classes and context leaks.
 */
export const createPaymentController = ({ paymentService }) =>
{

    /**
     * Universal Payment Verification Controller.
     * Supports both Razorpay and Stripe payment verification.
     * Maps exactly to: GET /api/payment/:paymentId
     */
    const verifyPayment = async (req, res) =>
    {
        const { paymentId } = req.params;
        const { paymentMethod, paymentLinkId } = req.query;

        let outcome;

        if (paymentMethod === "STRIPE")
        {
            outcome = await paymentService.verifyStripePayment({
                sessionId: paymentId,
            });
        }
        else
        {
            outcome = await paymentService.verifyRazorpayPayment({
                paymentId,
                paymentLinkId,
            });
        }

        res.status(200).json({
            status: true,
            message: outcome.message,
        });
    };

    /**
     * Re-issues a brand-new, active checkout payment link URL
     * for a pending split order.
     * Maps exactly to:
     * POST /api/payment/:paymentMethod/order/:orderId
     */
    const reissuePaymentLink = async (req, res) =>
    {
        const userId = req.user.id;
        const { paymentMethod, orderId } = req.params;

        const outcome = await paymentService.reissuePaymentLink({
            orderId,
            paymentMethod: paymentMethod.toUpperCase().trim(),
            userId,
        });

        res.status(200).json(outcome);
    };

    return Object.freeze({
        verifyPayment,
        reissuePaymentLink,
    });
};



// /**
//  * Pure function-based factory representing the Payment Verification HTTP API Controllers.
//  * Strictly enforces thin controller design principles, avoiding classes and context leaks.
//  */
// export const createPaymentController = ({ paymentService }) =>
// {

//     /**
//      * Payment Verification & Settlement Controller.
//      * Validates Razorpay captured payment success and triggers atomic accounting adjustments.
//      * Maps exactly to: GET /api/payment/:paymentId
//      */
//     const verifyPayment = async (req, res) =>
//     {
//         // Captures standard dynamic payment ID from URL path variables parameters
//         const { paymentId } = req.params;

//         // Captures unique aggregate parent link ID from query string parameters: ?paymentLinkId=...
//         const { paymentMethod, paymentLinkId } = req.query;

//         const outcome = await paymentService.verifyRazorpayPayment({
//             paymentId,
//             paymentMethod,
//             paymentLinkId,
//         });

//         // 201 Created: Matches expected e-commerce return code for successful payment captures
//         res.status(200).json({
//             message: outcome.message || 'Payment successfully captured and settled.',
//             status: true,
//         });
//     };

//     /**
//  * Stripe Checkout Session Verification Controller.
//  * Validates Stripe checkout session and triggers atomic accounting adjustments.
//  * Maps exactly to: GET /api/payment/stripe/:sessionId
//  */
//     const verifyStripePayment = async (req, res) =>
//     {
//         const { sessionId } = req.params;

//         const outcome = await paymentService.verifyStripePayment({
//             sessionId,
//         });

//         res.status(200).json({
//             message: outcome.message || 'Stripe payment successfully verified and settled.',
//             status: true,
//         });
//     };

//     /**
//      * Re-issues a brand-new, active checkout payment link URL for a pending split order.
//      * Maps exactly to: POST /api/payment/:paymentMethod/order/:orderId (Authentication required)
//      */
//     const reissuePaymentLink = async (req, res) =>
//     {
//         const userId = req.user.id;
//         const { paymentMethod, orderId } = req.params; // Captures path parameters from URL

//         const outcome = await paymentService.reissuePaymentLink({
//             orderId,
//             paymentMethod: paymentMethod.toUpperCase().trim(),
//             userId,
//         });

//         // 201 Created: Matches expected e-commerce return code for successful payment link re-issuances
//         res.status(200).json(outcome);
//     };

//     return Object.freeze({
//         verifyPayment,
//         verifyStripePayment,
//         reissuePaymentLink, // Added payment link reissue controller method
//     });
// };