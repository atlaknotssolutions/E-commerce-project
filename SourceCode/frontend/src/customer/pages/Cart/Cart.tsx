import {
  Button,
  IconButton,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import { notification } from "../../../services/notificationService";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { teal } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CartItemCard from "./CartItemCard";
import { useNavigate } from "react-router-dom";
import PricingCard from "./PricingCard";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchUserCart } from "../../../Redux Toolkit/Customer/CartSlice";
import { CartItem } from "../../../types/cartTypes";
import { applyCoupon, resetCouponApplied } from "../../../Redux Toolkit/Customer/CouponSlice";
import { Close } from "@mui/icons-material";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, auth, coupone } = useAppSelector((store) => store);
  const [couponCode, setCouponCode] = useState("");
  useEffect(() => {
    dispatch(fetchUserCart(localStorage.getItem("jwt") || ""));
  }, [auth.jwt, dispatch]);

  const handleChange = (e: any) => {
    setCouponCode(e.target.value);
  };

  const handleApllyCoupon = (apply: string) => {
    // console.log(couponCode,apply)

    var code = couponCode;

    if (apply === "false") {
      code = cart.cart?.couponCode || "";
    }

    dispatch(
      applyCoupon({
        apply,
        code,
        orderValue: cart.cart?.totalSellingPrice || 0,
        jwt: localStorage.getItem("jwt") || "",
      })
    );
  };
  useEffect(() => {
    if (coupone.couponApplied) {
      notification.success("Coupon Applied successfully");
      setCouponCode("");
      dispatch(resetCouponApplied());
    } else if (coupone.error) {
      notification.error(coupone.error);
      setCouponCode("");
      dispatch(resetCouponApplied());
    }
  }, [coupone.couponApplied, coupone.error, dispatch]);

  return (
    <>
      {cart.cart && cart.cart?.cartItems.length !== 0 ? (
        <div className="pt-10 px-5 sm:px-10 md:px-60 lg:px-60 min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 ">
            <div className="lg:col-span-2 space-y-3 ">
              {cart.cart?.cartItems.map((item: CartItem) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>

            <div className="col-span-1  text-sm space-y-3">
              <div className="border rounded-md px-5 py-3 space-y-5">
                <div className="">
                  <div className="flex gap-3 text-sm items-center">
                    <LocalOfferIcon
                      sx={{ color: teal[600], fontSize: "17px" }}
                    />
                    <span>Apply Coupons</span>
                  </div>
                </div>
                {!cart.cart?.couponCode ? (
                  <div className="flex justify-between items-center">
                    <TextField
                      value={couponCode}
                      onChange={handleChange}
                      placeholder="coupon code"
                      className=""
                      size="small"
                    />
                    <Button
                      onClick={() => handleApllyCoupon("true")}
                      disabled={couponCode ? false : true}
                      size="small"
                    >
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="flex">
                    <div className="p-1 pl-5 pr-3 border rounded-full flex gap-2 items-center">
                      <span className="">{cart.cart.couponCode} Applied</span>
                      <IconButton
                        onClick={() => handleApllyCoupon("false")}
                        size="small"
                      >
                        <Close className="text-red-600" />
                      </IconButton>
                    </div>
                  </div>
                )}
              </div>

              <section className="border rounded-md">
                <PricingCard />
                <div className="p-5">
                  <Button
                    onClick={() => navigate("/checkout/address")}
                    sx={{ py: "11px" }}
                    variant="contained"
                    fullWidth
                  >
                    BUY NOW
                  </Button>
                </div>
              </section>

              <div onClick={() => navigate("/account/wishlist")} className="border rounded-md px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                <span>Add From Wishlist</span>
                <FavoriteIcon sx={{ color: teal[600], fontSize: "21px" }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[85vh] flex justify-center items-center flex-col">
          <div className="text-center py-5">
            <h1 className="text-lg font-medium">Your cart is empty</h1>
            <p className="text-gray-500 text-sm">
              Looks like you haven't added anything yet. Start shopping to fill your bag!
            </p>
          </div>
          <Button variant="outlined" sx={{ py: "11px" }} onClick={() => navigate("/account/wishlist")}>
            Add From Wishlist
          </Button>
        </div>
      )}
    </>
  );
};

export default Cart;
