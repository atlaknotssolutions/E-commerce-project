import { Button, CircularProgress, Step, StepLabel, Stepper } from "@mui/material";
import React, { useState } from "react";
import BecomeSellerFormStep1 from "./BecomeSellerFormStep1";
import BecomeSellerFormStep3 from "./BecomeSellerFormStep3";
import BecomeSellerFormStep2 from "./BecomeSellerFormStep2";
import { useFormik } from "formik";
import * as Yup from "yup";
import BecomeSellerFormStep4 from "./BecomeSellerFormStep4";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { createSeller } from "../../../Redux Toolkit/Seller/sellerAuthenticationSlice";
// import { notification } from "../../../services/notificationService";

const steps = [
    "Tax Details & Mobile",
    "Pickup Address",
    "Bank Details",
    "Supplier Details",
];

const step0Schema = Yup.object({
    mobile: Yup.string()
        .trim()
        .matches(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
        .required("Mobile number is required"),
    gstin: Yup.string()
        .trim()
        .matches(/^[0-9A-Za-z]{15}$/, "GSTIN must be 15 characters")
        .required("GSTIN is required"),
});

const step1Schema = Yup.object({
    pickupAddress: Yup.object({
        address: Yup.string().trim().required("Street address is required"),
        city: Yup.string().trim().required("City is required"),
        state: Yup.string().trim().required("State is required"),
        pincode: Yup.string()
            .trim()
            .matches(/^\d{6}$/, "Pincode must be exactly 6 digits")
            .required("Pincode is required"),
    }),
});

const step2Schema = Yup.object({
    bankDetails: Yup.object({
        accountNumber: Yup.string().trim().required("Account number is required"),
        accountHolderName: Yup.string().trim().required("Account holder name is required"),
        ifscCode: Yup.string()
            .trim()
            .matches(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, "Please enter a valid IFSC code")
            .required("IFSC code is required"),
    }),
});

const step3Schema = Yup.object({
    businessDetails: Yup.object({
        businessName: Yup.string().trim().required("Business name is required"),
    }),
    sellerName: Yup.string().trim().required("Seller name is required"),
    email: Yup.string()
        .trim()
        .email("Please enter a valid email address")
        .required("Email is required"),
    password: Yup.string().test(
        "optional-min-length",
        "Password must be at least 6 characters",
        (value) => !value || value.length >= 6
    ),
});

const stepSchemas = [step0Schema, step1Schema, step2Schema, step3Schema];

const fullSchema = Yup.object({
    mobile: Yup.string()
        .trim()
        .matches(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
        .required("Mobile number is required"),
    gstin: Yup.string()
        .trim()
        .matches(/^[0-9A-Za-z]{15}$/, "GSTIN must be 15 characters")
        .required("GSTIN is required"),
    pickupAddress: Yup.object({
        address: Yup.string().trim().required("Street address is required"),
        city: Yup.string().trim().required("City is required"),
        state: Yup.string().trim().required("State is required"),
        pincode: Yup.string()
            .trim()
            .matches(/^\d{6}$/, "Pincode must be exactly 6 digits")
            .required("Pincode is required"),
    }),
    bankDetails: Yup.object({
        accountNumber: Yup.string().trim().required("Account number is required"),
        accountHolderName: Yup.string().trim().required("Account holder name is required"),
        ifscCode: Yup.string()
            .trim()
            .matches(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, "Please enter a valid IFSC code")
            .required("IFSC code is required"),
    }),
    businessDetails: Yup.object({
        businessName: Yup.string().trim().required("Business name is required"),
    }),
    sellerName: Yup.string().trim().required("Seller name is required"),
    email: Yup.string()
        .trim()
        .email("Please enter a valid email address")
        .required("Email is required"),
    password: Yup.string().test(
        "optional-min-length",
        "Password must be at least 6 characters",
        (value) => !value || value.length >= 6
    ),
});

const stepFieldPaths = [
    ["mobile", "gstin"],
    ["pickupAddress.address", "pickupAddress.city", "pickupAddress.state", "pickupAddress.pincode"],
    ["bankDetails.accountNumber", "bankDetails.accountHolderName", "bankDetails.ifscCode"],
    ["businessDetails.businessName", "sellerName", "email", "password"],
];

const SellerAccountForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    const dispatch = useAppDispatch();
    const { sellerAuth } = useAppSelector((store) => store);

    const formik = useFormik({
        initialValues: {
            mobile: "",
            otp: "",
            gstin: "",
            pickupAddress: {
                name: "",
                mobile: "",
                pincode: "",
                address: "",
                locality: "",
                city: "",
                state: "",
            },
            bankDetails: {
                accountNumber: "",
                ifscCode: "",
                accountHolderName: "",
            },
            sellerName: "",
            email: "",
            businessDetails: {
                businessName: "",
                businessEmail: "",
                businessMobile: "",
                logo: "",
                banner: "",
                businessAddress: "",
            },
            password: "",
        },
        validationSchema: activeStep === steps.length - 1 ? fullSchema : stepSchemas[activeStep],
        onSubmit: (values) => {
            dispatch(createSeller(values));
        },
    });

    const markStepTouched = () => {
        stepFieldPaths[activeStep].forEach((path) => formik.setFieldTouched(path, true, false));
    };

    const handleStep = async (value: number) => {
        if (value > 0) {
            const errors = await formik.validateForm();

            if (Object.keys(errors).length > 0) {
                markStepTouched();
                return;
            }
        }

        setActiveStep(activeStep + value);
    };

    const handleSubmit = () => {
        if (sellerAuth.loading) return;

        formik.handleSubmit();
    };

    const handleStepContinue = async () => {
        if (activeStep === steps.length - 1) {
            handleSubmit();
            return;
        }

        await handleStep(1);
    };

    return (
        <div>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <div className="mt-20 space-y-10">
                <div>
                    {activeStep === 0 ? (
                        <BecomeSellerFormStep1 formik={formik} />
                    ) : activeStep === 1 ? (
                        <BecomeSellerFormStep2 formik={formik} />
                    ) : activeStep === 2 ? (
                        <BecomeSellerFormStep3 formik={formik} />
                    ) : (
                        <BecomeSellerFormStep4 formik={formik} />
                    )}
                </div>

                <div className="flex items-center justify-between ">
                    <Button
                        disabled={activeStep === 0 || sellerAuth.loading}
                        onClick={() => handleStep(-1)}
                        variant="contained"
                    >
                        Back
                    </Button>
                    <Button
                        disabled={sellerAuth.loading}
                        onClick={handleStepContinue}
                        variant="contained"
                    >
                        {activeStep === steps.length - 1
                            ? sellerAuth.loading
                                ? <CircularProgress size="small"
                                    sx={{ width: "27px", height: "27px" }} />
                                : "create account"
                            : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SellerAccountForm
