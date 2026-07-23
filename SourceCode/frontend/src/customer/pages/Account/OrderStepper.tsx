import React from "react";
import { Box } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { OrderStatus } from "../../../types/orderTypes";

interface OrderStepperProps {
    orderStatus?: OrderStatus;
}

const ORDER_STEPS = [
    {
        value: OrderStatus.PLACED,
        name: "Order Placed",
        description: "Your order has been placed."
    },
    {
        value: OrderStatus.CONFIRMED,
        name: "Confirmed",
        description: "Your order has been confirmed."
    },
    {
        value: OrderStatus.PACKED,
        name: "Packed",
        description: "Your order has been packed."
    },
    {
        value: OrderStatus.SHIPPED,
        name: "Shipped",
        description: "Your order is on the way."
    },
    {
        value: OrderStatus.OUT_FOR_DELIVERY,
        name: "Out for Delivery",
        description: "Your order is out for delivery."
    },
    {
        value: OrderStatus.DELIVERED,
        name: "Delivered",
        description: "Order delivered successfully."
    }
];

const CANCELLED_STEPS = [
    {
        value: OrderStatus.PLACED,
        name: "Order Placed",
        description: "Your order was placed."
    },
    {
        value: OrderStatus.CANCELLED,
        name: "Order Cancelled",
        description: "Your order has been cancelled."
    }
];

const OrderStepper = ({ orderStatus }: OrderStepperProps) => {
    const statusSteps =
        orderStatus === OrderStatus.CANCELLED
            ? CANCELLED_STEPS
            : ORDER_STEPS;

    const currentStep = statusSteps.findIndex(
        (step) => step.value === orderStatus
    );

    return (
        <Box className="mx-auto my-10">
            {statusSteps.map((step, index) => (
                <div key={step.value} className="flex px-4">
                    <div className="flex flex-col items-center">
                        <Box
                            sx={{ zIndex: 1 }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center
                                ${
                                    index <= currentStep
                                        ? "bg-gray-200 text-teal-500"
                                        : "bg-gray-300 text-gray-600"
                                }`}
                        >
                            {step.value === orderStatus ? (
                                <CheckCircleIcon />
                            ) : (
                                <FiberManualRecordIcon />
                            )}
                        </Box>

                        {index < statusSteps.length - 1 && (
                            <div
                                className={`w-[2px] h-20 ${
                                    index < currentStep
                                        ? "bg-teal-500"
                                        : "bg-gray-300"
                                }`}
                            />
                        )}
                    </div>

                    <div className="ml-2 w-full">
                        <div
                            className={`
                                ${
                                    step.value === orderStatus
                                        ? "bg-primary-color text-white font-medium rounded-md p-2 -translate-y-3"
                                        : ""
                                }
                                ${
                                    orderStatus === OrderStatus.CANCELLED &&
                                    step.value === OrderStatus.CANCELLED
                                        ? "bg-red-500"
                                        : ""
                                }
                                w-full
                            `}
                        >
                            <p>{step.name}</p>

                            <p
                                className={`text-xs ${
                                    step.value === orderStatus
                                        ? "text-gray-200"
                                        : "text-gray-500"
                                }`}
                            >
                                {step.description}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </Box>
    );
};

export default OrderStepper;