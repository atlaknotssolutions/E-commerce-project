import { Divider } from "@mui/material";
import React from "react";
import {
  sumCartItemMrpPrice,
  sumCartItemSellingPrice,
} from "../../../util/cartCalculator";
import { useAppSelector } from "../../../Redux Toolkit/Store";

const PricingCard = () => {
  const { cart } = useAppSelector((store) => store);
  const cartData = cart.cart;

  if (!cartData) return null;

  const totalMrp = cartData.totalMrpPrice || sumCartItemMrpPrice(cartData.cartItems || []);
  const totalSelling = cartData.totalSellingPrice || sumCartItemSellingPrice(cartData.cartItems || []);
  const productDiscount = totalMrp - totalSelling;
  const couponDiscount = cartData.couponPrice || 0;
  const shipping = totalSelling >= 1500 ? 0 : 79;
  const amountPaid = totalSelling - couponDiscount + shipping;

  return (
    <div>
      <div className="space-y-3 p-5">
        <h3 className="font-semibold text-sm text-gray-700">Price Details</h3>

        <div className="flex justify-between items-center text-sm">
          <span>Price ({cartData.totalItem || cartData.cartItems?.length} item{(cartData.totalItem || 0) > 1 ? 's' : ''})</span>
          <span>₹{totalMrp.toFixed(2)}</span>
        </div>

        {productDiscount > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span>Product Discount</span>
            <span className="text-green-600">- ₹{productDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm">
          <span>Delivery</span>
          <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
            {shipping === 0 ? "Free" : `₹${shipping}`}
          </span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span>Coupon Discount</span>
            <span className="text-green-600">- ₹{couponDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm">
          <span>Platform Fee</span>
          <span className="text-green-600">Free</span>
        </div>
      </div>
      <Divider />

      <div className="font-semibold px-5 py-3 flex justify-between items-center">
        <span>Total Amount</span>
        <span>₹{amountPaid.toFixed(2)}</span>
      </div>

      {productDiscount > 0 && (
        <div className="px-5 pb-3">
          <p className="text-green-600 text-sm font-medium">
            You will save ₹{(productDiscount + couponDiscount).toFixed(2)} on this order
          </p>
        </div>
      )}
    </div>
  );
};

export default PricingCard;
