import Razorpay from "razorpay";
import { env } from "../../config/env.js";

const razorpay = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
});

const createPaymentLink = async ({ amount, paymentOrderId }) =>
{
    try
    {
        console.log("RAZORPAY KEY =>", process.env.RAZORPAY_KEY_ID);

        const response = await razorpay.paymentLink.create({
            amount: amount * 100,
            currency: "INR",
            description: `Order ${paymentOrderId}`,
            reference_id: paymentOrderId.toString(),
            notify: {
                sms: true,
                email: true,
            },
            reminder_enable: true,

            callback_url: `${env.frontendUrl}/payment-success`,
            callback_method: "get",
        });

        console.log("RAZORPAY RESPONSE =>", response);

        return {
            id: response.id,
            payment_link_url: response.short_url,
        };
    } catch (error)
    {
        console.error("========== RAZORPAY ERROR ==========");
        console.error(error);

        if (error.error)
        {
            console.error("Status:", error.statusCode);
            console.error("Error Body:", error.error);
        }

        throw error;
    }
};

/**
 * Fetch payment details
 */
const fetchPaymentDetails = async (paymentId) =>
{
    const payment = await razorpay.payments.fetch(paymentId);

    return payment;
};

export default Object.freeze({
    createPaymentLink,
    fetchPaymentDetails,
});