import Razorpay from "razorpay";
import { env } from "../../config/env.js";

const razorpay = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
});

const createPaymentLink = async ({ amount, paymentOrderId, customer }) =>
{
    try
    {
        // Razorpay requires a customer contact/email before SMS/email
        // notifications can be enabled. Only enable a notify channel when we
        // actually have the destination data, otherwise Razorpay rejects the
        // request with a 4xx error.
        const notify = {};
        if (customer?.contact)
        {
            notify.sms = true;
        }
        if (customer?.email)
        {
            notify.email = true;
        }

        const payload = {
            amount: Math.round(Number(amount) * 100),
            currency: "INR",
            description: `Order ${paymentOrderId}`,
            reference_id: paymentOrderId.toString(),
            reminder_enable: true,

            callback_url: `${env.frontendUrl}/payment-success`,
            callback_method: "get",
        };

        if (customer)
        {
            payload.customer = customer;
        }
        if (Object.keys(notify).length > 0)
        {
            payload.notify = notify;
        }

        const response = await razorpay.paymentLink.create(payload);

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