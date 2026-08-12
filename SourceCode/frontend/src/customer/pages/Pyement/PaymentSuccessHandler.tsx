import { Alert, Backdrop, Button, CircularProgress, Paper } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../../Redux Toolkit/Store";
import { paymentSuccess } from "../../../Redux Toolkit/Customer/OrderSlice";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccessHandler = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const autoVerifiedRef = useRef(false);

    const params = new URLSearchParams(location.search);

    // Razorpay
    const razorpayPaymentId = params.get("razorpay_payment_id");
    const razorpayPaymentLinkId = params.get("razorpay_payment_link_id");

    // Stripe
    const stripeSessionId = params.get("session_id");

    const hasPaymentParam = Boolean(razorpayPaymentId || stripeSessionId);

    const runVerification = async () => {
        setVerifying(true);
        setError(null);

        try {
            // Razorpay
            if (razorpayPaymentId) {
                await dispatch(
                    paymentSuccess({
                        paymentId: razorpayPaymentId,
                        paymentLinkId: razorpayPaymentLinkId || "",
                        paymentMethod: "RAZORPAY",
                        jwt: localStorage.getItem("jwt") || "",
                    })
                ).unwrap();
            }

            // Stripe
            else if (stripeSessionId) {
                await dispatch(
                    paymentSuccess({
                        paymentId: stripeSessionId,
                        paymentLinkId: "",
                        paymentMethod: "STRIPE",
                        jwt: localStorage.getItem("jwt") || "",
                    })
                ).unwrap();
            }

            // Only reached after the backend confirms successful payment/order processing.
            navigate("/account/orders", {
                replace: true,
            });
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Payment verification failed. Please try again.");
            setVerifying(false);
        }
    };

    useEffect(() => {
        if (!hasPaymentParam) {
            setVerifying(false);
            setError("No payment reference was found in the URL.");
            return;
        }

        if (autoVerifiedRef.current) return;
        autoVerifiedRef.current = true;

        runVerification();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasPaymentParam, dispatch, navigate, razorpayPaymentId, razorpayPaymentLinkId, stripeSessionId]);

    if (verifying) {
        return (
            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        );
    }

    return (
        <div className="min-h-[90vh] flex justify-center items-center px-5">
            <Paper className="p-8 w-full max-w-md rounded-md border shadow-lg space-y-5">
                <Alert severity="error">
                    {error || "Payment verification failed. Please try again."}
                </Alert>
                <div className="flex flex-col gap-3">
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => runVerification()}
                    >
                        Try Again
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate("/account/orders", { replace: true })}
                    >
                        Go to Orders
                    </Button>
                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => navigate("/", { replace: true })}
                    >
                        Go to Home
                    </Button>
                </div>
            </Paper>
        </div>
    );
};

export default PaymentSuccessHandler;
