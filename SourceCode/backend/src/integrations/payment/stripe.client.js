import Stripe from "stripe";
import { env } from "../../config/env.js";

const stripe = new Stripe(env.stripe.secretKey, {
    apiVersion: "2025-06-30.basil",
});

const createCheckoutSession = async ({ amount, paymentOrderId }) =>
{
    try
    {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",

            payment_method_types: ["card"],

            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `Order ${paymentOrderId}`,
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],

            success_url: `${env.frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${env.frontendUrl}/payment-cancel`,

            metadata: {
                paymentOrderId: paymentOrderId.toString(),
            },
        });

        return {
            id: session.id,
            url: session.url,
        };
    } catch (error)
    {
        console.error("========== STRIPE ERROR ==========");
        console.error(error);
        throw error;
    }
};

const fetchCheckoutSession = async (sessionId) =>
{
    return await stripe.checkout.sessions.retrieve(sessionId);
};

export default {
    createCheckoutSession,
    fetchCheckoutSession,
};



// const testStripeConnection = async () => {
//     try {
//         const balance = await stripe.balance.retrieve();
//         console.log("✅ Stripe Connected");
//         console.log(balance);
//     } catch (err) {
//         console.error("❌ Stripe Connection Failed");
//         console.error(err);
//     }
// };

// await testStripeConnection();