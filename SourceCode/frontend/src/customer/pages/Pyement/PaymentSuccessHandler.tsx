import { Backdrop, CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { useAppDispatch } from "../../../Redux Toolkit/Store";
import { paymentSuccess } from "../../../Redux Toolkit/Customer/OrderSlice";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccessHandler = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);

    // Razorpay
    const razorpayPaymentId = params.get("razorpay_payment_id");
    const razorpayPaymentLinkId = params.get("razorpay_payment_link_id");

    // Stripe
    const stripeSessionId = params.get("session_id");

    useEffect(() => {
        const verify = async () => {
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

                navigate("/account/orders", {
                    replace: true,
                });

            } catch (err) {
                console.error(err);
                navigate("/");
            }
        };

        verify();
    }, [
        dispatch,
        navigate,
        razorpayPaymentId,
        razorpayPaymentLinkId,
        stripeSessionId,
    ]);

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
};

export default PaymentSuccessHandler;







// import { Backdrop, Button, CircularProgress } from "@mui/material";
// import React, { useEffect } from "react";
// import store, { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
// import { paymentSuccess } from "../../../Redux Toolkit/Customer/OrderSlice";
// import { useLocation, useNavigate } from "react-router-dom";

// const PaymentSuccessHandler = () => {
//     const dispatch = useAppDispatch();
//     const location = useLocation();
//     const { orders } = useAppSelector(store => store)
//     const navigate=useNavigate();

//     const getQueryParam = (key: string): string | null => {
//         const params = new URLSearchParams(location.search);
//         return params.get(key);
//     };
//     const paymentId = getQueryParam("razorpay_payment_id");
//     const paymentLinkId = getQueryParam("razorpay_payment_link_id");
//     // const paymentId="cs_test_a1eU8pFuXZJlg3tiahN153QykvQl6LI5hLgSnUUh01alidIPrMU8KyDx67"

//     // useEffect(() => {
//     //     if (paymentId) {
//     //         dispatch(
//     //             paymentSuccess({
//     //                 paymentId,
//     //                 paymentLinkId: paymentLinkId || "",
//     //                 jwt: localStorage.getItem("jwt") || "",
//     //             })
//     //         );
//     //     }
//     // }, [paymentId]);


//     useEffect(() => {
//     if (!paymentId) return;

//     dispatch(
//         paymentSuccess({
//             paymentId,
//             paymentLinkId: paymentLinkId || "",
//             jwt: localStorage.getItem("jwt") || "",
//         })
//     )
//         .unwrap()
//         .then(() => {
//             navigate("/account/orders");
//         })
//         .catch((err) => {
//             console.error(err);
//         });

// }, [dispatch, navigate, paymentId, paymentLinkId]);


//     return (
//         <div className="min-h-[90vh] flex justify-center items-center">
//             {orders ? <div className="bg-primary-color text-white p-8 w-[90%] lg:w-[25%] border rounded-md h-[40vh] flex flex-col gap-7 items-center justify-center">
//                 <h1 className="text-3xl font-semibold">Congratulations!</h1>
//                 <h1 className="text-2xl font-semibold">Your Order Get Success</h1>
//                 <div>
//                     <Button onClick={()=>navigate("/")} color="secondary" variant="contained">Shopping More</Button>
//                 </div>

//             </div> : <Backdrop
//                 sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
//                 open={true}
//             //   onClick={handleClose}
//             >
//                 <CircularProgress color="inherit" />
//             </Backdrop>}
           
//         </div>
//     );
// };

// export default PaymentSuccessHandler;
