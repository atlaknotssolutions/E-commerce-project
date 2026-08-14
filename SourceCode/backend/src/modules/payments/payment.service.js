import mongoose from 'mongoose';
import
{
    PAYMENT_STATUS,
    PAYMENT_METHODS,
    ORDER_STATUS,
    ROLES,
    STATUS_HISTORY_ACTOR,
} from '../../constants/enums.js';
import { createInventoryHelper } from '../orders/orderInventoryHelper.js';
import { createCouponFacade } from '../../utils/couponEngine/CouponFacade.js';

/**
 * Pure function-based factory representing the Payment Verification & Settlements Business Service.
 * Orchestrates high-stakes checkout payments and manages multi-vendor cash-flow reconciliations.
 */
export const createPaymentService = ({
    paymentOrderRepository,
    orderRepository,
    transactionRepository,
    sellerReportRepository,
    cartRepository,
    productRepository,
    couponRepository,
    userRepository,
    razorpayClient,
    stripeClient,
    createApiError,
}) =>
{
    const inventory = createInventoryHelper({ productRepository, createApiError });

    const hashString = (data) =>
    {
        return crypto.createHash('sha256').update(data).digest('hex');
    };

    /**
     * Normalizes a stored mobile number into Razorpay E.164 contact format.
     * Accepts raw 10-digit Indian numbers and numbers with a country code.
     */
    const normalizeRazorpayContact = (mobile) =>
    {
        if (!mobile) return undefined;
        const digits = String(mobile).replace(/[^\d]/g, '');
        if (digits.length === 10) return `+91${digits}`;
        if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
        if (digits.length > 10) return `+${digits}`;
        return undefined;
    };

    /**
     * Builds the Razorpay `customer` object from the paying user's profile.
     * Returns undefined when no usable data exists (gateway then skips notify).
     */
    const buildRazorpayCustomer = async (userId) =>
    {
        const user = userId
            ? await userRepository.findById(userId).catch(() => null)
            : null;

        if (!user)
        {
            return undefined;
        }

        const customer = { name: user.fullName || undefined };
        if (user.email)
        {
            customer.email = user.email;
        }
        const contact = normalizeRazorpayContact(user.mobile);
        if (contact)
        {
            customer.contact = contact;
        }

        if (!customer.name && !customer.email && !customer.contact)
        {
            return undefined;
        }

        return customer;
    };

    /**
     * Creates the payment record in the database.
     * NOTE: In the new transactional checkout flow, this is called inside createOrdersFromCart's
     * MongoDB transaction. This method remains for backward compatibility (reissue flow).
     */
    const createPaymentOrder = async ({
        userId,
        amount,
        orders,
        paymentMethod
    }) =>
    {
        const paymentOrder =
            await paymentOrderRepository.createPaymentOrder({
                amount,
                status: PAYMENT_STATUS.PENDING,
                paymentMethod,
                user: userId,
                orders,
            });

        let paymentLinkUrl = '';
        let providerLinkId = null;

        if (paymentMethod === PAYMENT_METHODS.RAZORPAY)
        {
            try
            {
                const customer = await buildRazorpayCustomer(userId);

                const rzpResponse = await razorpayClient.createPaymentLink({
                    amount,
                    paymentOrderId: paymentOrder._id,
                    customer,
                });

                paymentLinkUrl = rzpResponse.payment_link_url;
                providerLinkId = rzpResponse.id;

            } catch (err)
            {
                if (err.error)
                {
                    console.error("Razorpay API Error =>", err.error);
                }

                throw err;
            }
        }
        else if (paymentMethod === PAYMENT_METHODS.STRIPE)
        {
            const stripeResponse =
                await stripeClient.createCheckoutSession({
                    amount,
                    paymentOrderId: paymentOrder._id,
                });

            paymentLinkUrl = stripeResponse.url;
            providerLinkId = stripeResponse.id;
        }

        if (providerLinkId)
        {
            await paymentOrderRepository.updatePaymentLinkId({
                paymentOrderId: paymentOrder._id,
                paymentLinkId: providerLinkId,
            });
        }

        return {
            payment_link_url: paymentLinkUrl
        };
    };

    /**
     * Gateway-only payment initiation.
     * Assumes the payment record already exists in the DB (created inside the order transaction).
     * Calls the external gateway (Razorpay / Stripe) and updates the payment link ID.
     */
    const initiateGatewayPayment = async ({ paymentOrderId, amount, paymentMethod }) =>
    {
        let paymentLinkUrl = '';
        let providerLinkId = null;

        if (paymentMethod === PAYMENT_METHODS.RAZORPAY)
        {
            try
            {
                const paymentOrder =
                    await paymentOrderRepository.findById(paymentOrderId);
                const customer =
                    await buildRazorpayCustomer(paymentOrder?.user);

                const rzpResponse = await razorpayClient.createPaymentLink({
                    amount,
                    paymentOrderId,
                    customer,
                });

                paymentLinkUrl = rzpResponse.payment_link_url;
                providerLinkId = rzpResponse.id;
            }
            catch (err)
            {
                if (err.error)
                {
                    console.error("Razorpay API Error =>", err.error);
                }
                throw err;
            }
        }
        else if (paymentMethod === PAYMENT_METHODS.STRIPE)
        {
            const stripeResponse =
                await stripeClient.createCheckoutSession({
                    amount,
                    paymentOrderId,
                });

            paymentLinkUrl = stripeResponse.url;
            providerLinkId = stripeResponse.id;
        }

        if (providerLinkId)
        {
            await paymentOrderRepository.updatePaymentLinkId({
                paymentOrderId,
                paymentLinkId: providerLinkId,
            });
        }

        return { payment_link_url: paymentLinkUrl };
    };

    /**
     * Payment Failure Handler.
     * Centralized handler for any payment failure (gateway, verification, timeout).
     * Marks the payment record as FAILED, cancels linked orders, and releases inventory.
     * Fully idempotent: safe to call multiple times (webhook retries, duplicate requests).
     */
    const handlePaymentFailure = async ({ paymentOrderId, reason }) =>
    {
        const paymentOrder = await paymentOrderRepository.findById(paymentOrderId);
        if (!paymentOrder)
        {
            return;
        }

        if (paymentOrder.status === PAYMENT_STATUS.FAILED)
        {
            return;
        }

        const cancelledOrderItems = [];
        const session = await mongoose.startSession();

        try
        {
            await session.withTransaction(async () =>
            {
                await paymentOrderRepository.updateStatus({
                    paymentOrderId,
                    status: PAYMENT_STATUS.FAILED,
                }, { session });

                for (const order of paymentOrder.orders)
                {
                    const currentOrder = await orderRepository.findById(order._id);

                    if (currentOrder && currentOrder.orderStatus !== ORDER_STATUS.CANCELLED)
                    {
                        await orderRepository.updateStatusWithHistory({
                            orderId: order._id,
                            orderStatus: ORDER_STATUS.CANCELLED,
                            historyEntry: {
                                fromStatus: currentOrder.orderStatus,
                                toStatus: ORDER_STATUS.CANCELLED,
                                changedBy: currentOrder.user,
                                changedByModel: STATUS_HISTORY_ACTOR.SYSTEM,
                                changedByRole: ROLES.ADMIN,
                                changedAt: new Date(),
                                note: reason || 'Payment failed: automatic cancellation',
                            },
                        }, { session });

                        cancelledOrderItems.push(...currentOrder.orderItems);
                    }
                }
            });
        }
        finally
        {
            await session.endSession();
        }

        // Release inventory OUTSIDE transaction — only for orders actually cancelled in this call.
        for (const item of cancelledOrderItems)
        {
            await inventory.releaseOrderInventory([item]);
        }

        // Coupon rollback via CouponRollbackService (single source of truth)
        const couponFacade = createCouponFacade();
        const cart = await cartRepository.findByUserId({ userId: paymentOrder.user });
        await couponFacade.rollbackByCart({
            cart,
            userId: paymentOrder.user,
            couponRepository,
            userRepository,
        });
    };

    /**
     * Idempotent Payment Verification & Settlements Engine.
     */
    const verifyRazorpayPayment = async ({ paymentId, paymentLinkId, userId }) =>
    {
        const paymentOrder = await paymentOrderRepository.findByPaymentLinkId(paymentLinkId);
        if (!paymentOrder)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PAYMENT_RECORD_NOT_FOUND',
                message: 'Payment verification failed. No transaction record matches the provided link ID.'
            });
        }

        // Ownership enforcement when the caller is authenticated.
        // Unauthenticated callers are authorized by possession of the
        // high-entropy gateway payment link id (capability credential) plus
        // the server-side gateway status verification below.
        if (userId && paymentOrder.user?.toString() !== userId.toString())
        {
            throw createApiError({
                statusCode: 403,
                code: 'PAYMENT_SESSION_ACCESS_FORBIDDEN',
                message: 'Verification rejected: This payment session does not belong to your account.'
            });
        }

        if (paymentOrder.status === PAYMENT_STATUS.COMPLETED)
        {
            return { success: true, message: 'This transaction has already been successfully verified and settled.' };
        }

        const paymentDetails = await razorpayClient.fetchPaymentDetails(paymentId);
        if (paymentDetails.status !== 'captured')
        {
            await handlePaymentFailure({
                paymentOrderId: paymentOrder._id,
                reason: `Payment not captured: gateway status is '${paymentDetails.status}'`,
            });

            throw createApiError({
                statusCode: 400,
                code: 'PAYMENT_NOT_CAPTURED',
                message: `Verification rejected: Payment state is currently reported as '${paymentDetails.status}' by gateway. Your order has been cancelled.`
            });
        }

        const session = await mongoose.startSession();

        try
        {
            await session.withTransaction(async () =>
            {
                await paymentOrderRepository.updateStatus({
                    paymentOrderId: paymentOrder._id,
                    status: PAYMENT_STATUS.COMPLETED,
                    providerPaymentId: paymentId,
                }, { session });

                for (const order of paymentOrder.orders)
                {
                    await orderRepository.updatePaymentStatus({
                        orderId: order._id,
                        paymentStatus: PAYMENT_STATUS.COMPLETED,
                    }, { session });

                    await orderRepository.updateStatus({
                        orderId: order._id,
                        orderStatus: ORDER_STATUS.PLACED,
                    }, { session });

                    const existingTransaction =
                        await transactionRepository.findByOrderId(
                            order._id,
                            { session }
                        );

                    if (!existingTransaction)
                    {
                        await transactionRepository.createTransaction({
                            customer: paymentOrder.user,
                            seller: order.seller,
                            order: order._id,
                        }, { session });
                    }

                    // Idempotent: only update seller report once per order
                    if (!existingTransaction)
                    {
                        const sellerEarnings = order.couponSnapshot?.ownerType === 'PLATFORM'
                            ? order.totalSellingPrice
                            : (order.totalSellingPrice - (order.couponPrice || 0));
                        await sellerReportRepository.applyPaymentSuccess({
                            sellerId: order.seller,
                            earnings: Math.max(0, sellerEarnings),
                            sales: order.totalSellingPrice,
                        }, { session });
                    }
                }

                await cartRepository.updateCart({
                    userId: paymentOrder.user,
                    cartData: {
                        items: [],
                        totalSellingPrice: 0,
                        totalItem: 0,
                        totalMrpPrice: 0,
                        discount: 0,
                        couponCode: null,
                        couponPrice: 0,
                    }
                }, { session });
            });
        } finally
        {
            await session.endSession();
        }

        return { success: true, message: 'Payment successfully captured and all merchant accounts settled.' };
    };


    const verifyStripePayment = async ({ sessionId, userId }) =>
    {
        const paymentOrder =
            await paymentOrderRepository.findByPaymentLinkId(sessionId);

        if (!paymentOrder)
        {
            throw createApiError({
                statusCode: 404,
                code: 'PAYMENT_RECORD_NOT_FOUND',
                message: 'Stripe payment session was not found in our records.'
            });
        }

        // Ownership enforcement when the caller is authenticated.
        // Unauthenticated callers are authorized by possession of the
        // high-entropy Stripe checkout session id (capability credential,
        // delivered only to the paying browser via the success_url redirect)
        // plus the server-side Stripe `payment_status === 'paid'` check below.
        if (userId && paymentOrder.user?.toString() !== userId.toString())
        {
            throw createApiError({
                statusCode: 403,
                code: 'PAYMENT_SESSION_ACCESS_FORBIDDEN',
                message: 'Verification rejected: This payment session does not belong to your account.'
            });
        }

        if (paymentOrder.status === PAYMENT_STATUS.COMPLETED)
        {
            return {
                success: true,
                message: 'Payment already verified.'
            };
        }

        const sessionData =
            await stripeClient.fetchCheckoutSession(sessionId);

        if (sessionData.payment_status !== 'paid')
        {
            await handlePaymentFailure({
                paymentOrderId: paymentOrder._id,
                reason: `Stripe payment not completed: status is '${sessionData.payment_status}'`,
            });

            throw createApiError({
                statusCode: 400,
                code: 'STRIPE_PAYMENT_NOT_COMPLETED',
                message: `Stripe session is currently '${sessionData.payment_status}'. Your order has been cancelled.`
            });
        }

        const session = await mongoose.startSession();

        try
        {
            await session.withTransaction(async () =>
            {
                await paymentOrderRepository.updateStatus({
                    paymentOrderId: paymentOrder._id,
                    status: PAYMENT_STATUS.COMPLETED,
                    providerPaymentId: sessionData.payment_intent,
                }, { session });

                for (const order of paymentOrder.orders)
                {
                    await orderRepository.updatePaymentStatus({
                        orderId: order._id,
                        paymentStatus: PAYMENT_STATUS.COMPLETED,
                    }, { session });

                    await orderRepository.updateStatus({
                        orderId: order._id,
                        orderStatus: ORDER_STATUS.PLACED,
                    }, { session });

                    const existingTransaction =
                        await transactionRepository.findByOrderId(
                            order._id,
                            { session }
                        );

                    if (!existingTransaction)
                    {
                        await transactionRepository.createTransaction({
                            customer: paymentOrder.user,
                            seller: order.seller,
                            order: order._id,
                        }, { session });
                    }

                    // Idempotent: only update seller report once per order
                    if (!existingTransaction)
                    {
                        const sellerEarnings = order.couponSnapshot?.ownerType === 'PLATFORM'
                            ? order.totalSellingPrice
                            : (order.totalSellingPrice - (order.couponPrice || 0));
                        await sellerReportRepository.applyPaymentSuccess({
                            sellerId: order.seller,
                            earnings: Math.max(0, sellerEarnings),
                            sales: order.totalSellingPrice,
                        }, { session });
                    }
                }

                await cartRepository.updateCart({
                    userId: paymentOrder.user,
                    cartData: {
                        items: [],
                        totalSellingPrice: 0,
                        totalItem: 0,
                        totalMrpPrice: 0,
                        discount: 0,
                        couponCode: null,
                        couponPrice: 0,
                    }
                }, { session });
            });
        }
        finally
        {
            await session.endSession();
        }

        return {
            success: true,
            message: 'Stripe payment verified successfully.'
        };
    };

    /**
     * Payment Re-issuance Engine.
     * Generates a brand-new, active checkout payment link URL for a pending split order.
     * Maps exactly to: POST /api/payment/:paymentMethod/order/:orderId
     */
    const reissuePaymentLink = async ({ orderId, paymentMethod, userId }) =>
    {
        const order = await orderRepository.findById(orderId);
        if (!order)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'Reissue failed: Targeted sales order does not exist.'
            });
        }

        if (order.user._id.toString() !== userId.toString())
        {
            throw createApiError({
                statusCode: 403,
                code: 'ACCESS_FORBIDDEN',
                message: 'Reissue rejected: You can only request payment links for your own orders.'
            });
        }

        if (order.paymentStatus === PAYMENT_STATUS.COMPLETED || order.orderStatus === ORDER_STATUS.CANCELLED)
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_ORDER_STATE_FOR_REISSUE',
                message: `Reissue rejected: Orders marked as ${order.paymentStatus} cannot be re-paid.`
            });
        }

        const couponFacade = createCouponFacade();
        const amount = couponFacade.computeSellerEarnings(order.totalSellingPrice, order.couponPrice);

        const { payment_link_url } = await createPaymentOrder({
            userId,
            amount,
            orders: [order._id],
            paymentMethod,
        });

        return { payment_link_url };
    };

    return Object.freeze({
        createPaymentOrder,
        initiateGatewayPayment,
        handlePaymentFailure,
        verifyRazorpayPayment,
        verifyStripePayment,
        reissuePaymentLink,
    });
};
