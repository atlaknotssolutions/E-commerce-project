import React, { useState, useEffect } from 'react'
import PricingCard from '../Cart/PricingCard'
import { Box, Button, FormControlLabel, IconButton, Modal, Radio, RadioGroup, TextField } from '@mui/material'
import AddressForm from './AddresssForm'
import AddressCard from './AddressCard'
import AddIcon from '@mui/icons-material/Add';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { notification } from '../../../services/notificationService';
import { createOrder } from '../../../Redux Toolkit/Customer/OrderSlice'
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store'
import { applyCoupon, fetchCustomerCoupons, resetCouponApplied } from '../../../Redux Toolkit/Customer/CouponSlice'
import { isAuthenticated } from '../../../util/requireAuth'
import { useNavigate } from 'react-router-dom'

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const paymentGatwayList = [
    {
        value: "RAZORPAY",
        image: "https://razorpay.com/newsroom-content/uploads/2020/12/output-onlinepngtools-1-1.png",
        label: "Razorpay"
    },
    {
        value: "STRIPE",
        image: "/stripe_logo.png",
        label: "Stripe"
    }
]
const AddressPage = () =>
{
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [value, setValue] = useState(0);
    const { user, cart, coupone } = useAppSelector(store => store)
    const [paymentGateway, setPaymentGateway] = useState(paymentGatwayList[0].value);

    const [open, setOpen] = React.useState(false);
    const [couponCode, setCouponCode] = useState('');

    useEffect(() =>
    {
        if (!user.user?.addresses?.length)
        {
            return;
        }

        const defaultIndex = user.user.addresses.findIndex(
            address => address.isDefault
        );

        if (defaultIndex >= 0)
        {
            setValue(defaultIndex);
        }
    }, [user.user]);

    useEffect(() => {
        if (!coupone.customerCouponsLoaded) {
            dispatch(fetchCustomerCoupons());
        }
    }, [dispatch, coupone.customerCouponsLoaded]);

    useEffect(() => {
        if (coupone.couponApplied) {
            notification.success('Coupon applied successfully!');
            dispatch(resetCouponApplied());
        } else if (coupone.error) {
            notification.error(coupone.error);
            dispatch(resetCouponApplied());
        }
    }, [coupone.couponApplied, coupone.error, dispatch]);

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return;
        dispatch(
            applyCoupon({
                apply: 'true',
                code: couponCode.trim(),
                orderValue: cart.cart?.totalSellingPrice || 0,
                jwt: localStorage.getItem('jwt') || '',
            })
        );
    };

    const handleRemoveCoupon = () => {
        const currentCode = cart.cart?.couponCode || couponCode;
        dispatch(
            applyCoupon({
                apply: 'false',
                code: currentCode,
                orderValue: cart.cart?.totalSellingPrice || 0,
                jwt: localStorage.getItem('jwt') || '',
            })
        );
        setCouponCode('');
        dispatch(resetCouponApplied());
    };

    const handleAutoFillCoupon = (code: string) => {
        setCouponCode(code);
    };

    const handleCopyCoupon = (code: string) => {
        navigator.clipboard.writeText(code);
        setCouponCode(code);
    };




    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        setValue(Number(event.target.value));
    };

    const handleCreateOrder = () =>
    {
        if (!isAuthenticated()) {
            notification.warning("Please login to place an order");
            navigate("/login", { state: { from: `${window.location.pathname}${window.location.search}` } });
            return;
        }

        const selectedAddress = user.user?.addresses?.[value];

        if (!selectedAddress)
        {
            return;
        }

        dispatch(
            createOrder({
                paymentGateway,
                address: selectedAddress,
                jwt: localStorage.getItem("jwt") || "",
            })
        );
    };

    const handlePaymentChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        setPaymentGateway((event.target as HTMLInputElement).value);
    };

    return (
        <div className='pt-10 px-5 sm:px-10 md:px-44 lg:px-60 min-h-screen '>
            <div className='space-y-5 lg:space-y-0 lg:grid grid-cols-3 lg:gap-9 '>

                <div className="col-span-2 space-y-5">

                    <div className='flex justify-between items-center'>
                        <span className='font-semibold'>Select Delivery Address</span>
                        <Button onClick={handleOpen} variant='outlined'>Add New Address</Button>

                    </div>
                    <div className='text-xs font-medium space-y-5'>
                        <p>Saved Addresses</p>
                        <div className='space-y-3'>
                            {user.user?.addresses?.map((item, index) => <AddressCard
                                key={item.id}
                                item={item}
                                selectedValue={value} value={index}
                                handleChange={handleChange} />)}
                        </div>
                    </div>
                    <div className='py-4 px-5 rounded-md border'>

                        <Button onClick={handleOpen} startIcon={<AddIcon />}>Add New Address</Button>

                    </div>
                </div>
                <div className="col-span-1 text-sm space-y-3 ">
                    <section className='space-y-3 border p-5 rounded-md'>
                        <div className='flex gap-2 items-center'>
                            <LocalOfferIcon sx={{ color: '#00927c', fontSize: 18 }} />
                            <h1 className='text-primary-color font-medium text-sm'>Apply Coupons</h1>
                        </div>

                        {!cart.cart?.couponCode ? (
                            <>
                                <div className='flex justify-between items-center gap-2'>
                                    <TextField
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Enter coupon code"
                                        size="small"
                                        fullWidth
                                    />
                                    <Button
                                        onClick={handleApplyCoupon}
                                        disabled={!couponCode.trim()}
                                        variant="contained"
                                        size="small"
                                        sx={{ backgroundColor: '#00927c', minWidth: 70, '&:hover': { backgroundColor: '#007a6a' } }}
                                    >
                                        Apply
                                    </Button>
                                </div>

                                {coupone.availableCoupons && coupone.availableCoupons.length > 0 && (
                                    <div className='space-y-2 mt-2'>
                                        <p className='text-xs text-gray-500'>Available coupons:</p>
                                        <div className='space-y-2 max-h-40 overflow-y-auto'>
                                            {coupone.availableCoupons.map((coupon) => (
                                                <div
                                                    key={coupon._id}
                                                    className='flex items-center justify-between border border-dashed border-teal-300 bg-teal-50 rounded-md px-3 py-2 cursor-pointer hover:bg-teal-100 transition-colors'
                                                    onClick={() => handleAutoFillCoupon(coupon.code)}
                                                >
                                                    <div className='flex-1 min-w-0'>
                                                        <div className='flex items-center gap-2'>
                                                            <span className='font-mono font-bold text-teal-700 text-xs'>{coupon.code}</span>
                                                            <span className='text-xs font-medium text-teal-600'>
                                                                {coupon.discountType === 'PERCENTAGE'
                                                                    ? `${coupon.discountPercentage}% OFF`
                                                                    : `₹${coupon.discountValue} OFF`}
                                                            </span>
                                                        </div>
                                                        <p className='text-[11px] text-gray-400'>Min. ₹{coupon.minimumOrderValue}</p>
                                                    </div>
                                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCopyCoupon(coupon.code); }}>
                                                        <ContentCopyIcon sx={{ fontSize: 14, color: '#00927c' }} />
                                                    </IconButton>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className='flex items-center gap-2 bg-green-50 border border-green-200 rounded-md px-3 py-2'>
                                <LocalOfferIcon sx={{ color: '#00927c', fontSize: 16 }} />
                                <span className='text-sm font-medium text-green-700 flex-1'>{cart.cart.couponCode} Applied</span>
                                <IconButton onClick={handleRemoveCoupon} size="small">
                                    <CloseIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                                </IconButton>
                            </div>
                        )}
                    </section>
                    <section className='space-y-3 border p-5 rounded-md'>
                        <h1 className='text-primary-color font-medium pb-2 text-center'>Choose Payment Gateway</h1>

                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            className='flex justify-between pr-0'
                            onChange={handlePaymentChange}
                            value={paymentGateway}
                        >
                            {(paymentGatwayList || []).map((item) => (
                                item && <FormControlLabel
                                    key={item.value}
                                    className={`border w-[48%] flex justify-center rounded-md p-2 hover:border-primary-color transition-colors ${paymentGateway === item.value ? "border-primary-color bg-gray-50" : ""}`}
                                    value={item.value}
                                    control={<Radio />}
                                    label={
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={item.image}
                                                alt={item.label}
                                                className="h-3 w-auto object-contain"
                                            />
                                            {/* <span>{item.label}</span> */}
                                        </div>
                                    }
                                />
                            ))}


                        </RadioGroup>

                    </section>
                    <section className='border rounded-md'>
                        <PricingCard />
                        <div className='p-5'>
                            <Button
                                onClick={handleCreateOrder}
                                disabled={!user.user?.addresses?.length}
                                sx={{ py: "11px" }}
                                variant="contained"
                                fullWidth
                            >
                                Checkout
                            </Button>

                            {!user.user?.addresses?.length && (
                                <p className="mt-2 text-sm text-red-500 text-center">
                                    Please add a delivery address to continue.
                                </p>
                            )}
                        </div>
                    </section>

                </div>

            </div>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <AddressForm paymentGateway={paymentGateway} handleClose={handleClose} />
                </Box>
            </Modal>

        </div>
    )
}

export default AddressPage