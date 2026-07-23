import { Box, Button, Divider } from '@mui/material'
import React, { useEffect, useState } from 'react'
import PaymentsIcon from '@mui/icons-material/Payments';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import OrderStepper from './OrderStepper';
import ReturnRequestDialog from './ReturnRequestDialog';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { cancelOrder, fetchMyReturns, fetchOrderById, fetchOrderItemById } from '../../../Redux Toolkit/Customer/OrderSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../../util/fomateDate';
import { ReturnStatus } from '../../../types/orderTypes';

const OrderDetails = () =>
{
  const dispatch = useAppDispatch()
  const { orders } = useAppSelector(store => store);
  const { orderItemId, orderId } = useParams()
  const navigate = useNavigate();
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  const jwt = localStorage.getItem("jwt") || "";

  useEffect(() =>
  {
    if (orderItemId && orderId)
    {
      dispatch(fetchOrderItemById({
        orderItemId,
        jwt
      }))

      dispatch(fetchOrderById({
        orderId,
        jwt
      }))
    }

    if (orders.returns.length === 0 && !orders.returnsLoaded) {
      dispatch(fetchMyReturns(jwt));
    }
  }, [dispatch, orderItemId, orderId, orders.returns.length, orders.returnsLoaded, jwt])

  if (!orders.orders || !orders.orderItem)
  {
    return <div className='h-[80vh] flex justify-center items-center'>
      No order found
    </div>;
  }

  const existingReturn = orders.returns.find(r => r.orderItemId === orderItemId);
  const isDelivered = orders.currentOrder?.orderStatus === "DELIVERED";
  const isWithinReturnWindow = (() => {
    const deliveredAt = orders.currentOrder?.deliveredAt;
    if (!deliveredAt) return false;
    const deliveredDate = new Date(deliveredAt);
    const now = new Date();
    const diffMs = now.getTime() - deliveredDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  })();
  const canRequestReturn = isDelivered && isWithinReturnWindow && !existingReturn;
  const isReturnTerminal = existingReturn?.returnStatus === ReturnStatus.REFUND_COMPLETED
    || existingReturn?.returnStatus === ReturnStatus.REJECTED;

  const handleCancelOrder = () =>
  {
    if (orderId)
    {
      dispatch(cancelOrder(orderId))
    }
  }

  return (
    <Box className='space-y-5 '>

      <section className='flex flex-col gap-5 justify-center items-center'>
        {/* <img className='w-[100px]' src={orders.orderItem?.product.images[0]} alt="" /> */}
        <img
          className="w-[100px]"
          src={
            orders.orderItem?.product.images?.[0]?.url ||
            "/logo192.png"
          }
          alt={orders.orderItem?.product.title}
        />
        <div className='text-sm space-y-1 text-center'>
          <h1 className='font-bold'>{orders.orderItem?.product.seller?.businessDetails.businessName}
          </h1>
          <p>{orders.orderItem?.product.title}</p>
          <p>
            <strong>Variant:</strong>{" "}
            {orders.orderItem?.variantAttributes
              ? (() => {
                  const va = orders.orderItem.variantAttributes;
                  const parts: string[] = [];
                  if (va.color) parts.push(va.color);
                  if (va.size) parts.push(va.size);
                  if (va.storage) parts.push(va.storage);
                  if (va.ram) parts.push(va.ram);
                  return parts.length > 0 ? parts.join(" / ") : orders.orderItem?.size || "N/A";
                })()
              : orders.orderItem?.size || "FREE"
            }
          </p>
        </div>
        <div>
          {isDelivered ? (
            <Button 
              onClick={() => navigate(`/reviews/${orders.orderItem?.product.id}/create`)}
              variant="contained"
              color="primary"
            >
              Write Review
            </Button>
          ) : (
            <Button disabled>
              Write Review
            </Button>
          )}
        </div>
      </section>

      <section className='border p-5'>
        <OrderStepper orderStatus={orders.currentOrder?.orderStatus} />

      </section>

      {orders.currentOrder?.trackingNumber && (
        <div className='border p-5'>
          <div className='flex items-center gap-2 pb-3'>
            <LocalShippingIcon className='text-teal-600' />
            <h1 className='font-bold'>Shipment Tracking</h1>
          </div>
          <div className='text-sm space-y-2'>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Carrier</span>
              <span className='font-medium'>{orders.currentOrder.carrier || '-'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Tracking Number</span>
              <span className='font-medium font-mono text-xs'>{orders.currentOrder.trackingNumber}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Shipment Status</span>
              <span className={`font-medium px-2 py-0.5 rounded text-xs ${
                orders.currentOrder.shipmentStatus === 'DELIVERED'
                  ? 'bg-green-50 text-green-700'
                  : orders.currentOrder.shipmentStatus === 'SHIPPED' || orders.currentOrder.shipmentStatus === 'OUT_FOR_DELIVERY'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {orders.currentOrder.shipmentStatus?.replace(/_/g, ' ')}
              </span>
            </div>
            {orders.currentOrder.shippedAt && (
              <div className='flex justify-between'>
                <span className='text-gray-500'>Shipped On</span>
                <span className='font-medium'>{formatDate(orders.currentOrder.shippedAt)}</span>
              </div>
            )}
            {orders.currentOrder.estimatedDelivery && (
              <div className='flex justify-between'>
                <span className='text-gray-500'>Estimated Delivery</span>
                <span className='font-medium'>{formatDate(orders.currentOrder.estimatedDelivery)}</span>
              </div>
            )}
            {orders.currentOrder.deliveredAt && (
              <div className='flex justify-between'>
                <span className='text-gray-500'>Delivered On</span>
                <span className='font-medium text-green-600'>{formatDate(orders.currentOrder.deliveredAt)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className='border p-5'>
        <h1 className='font-bold pb-3'>Delivery Address</h1>
        <div className='text-sm space-y-2'>
          <div className='flex gap-5 font-medium'>
            <p> {orders.currentOrder?.shippingAddress.name}</p>
            <Divider flexItem orientation='vertical' />
            <p>{orders.currentOrder?.shippingAddress.mobile}</p>
          </div>

          <p>
            {orders.currentOrder?.shippingAddress.address},
            {" "}
            {orders.currentOrder?.shippingAddress.locality},
            {" "}
            {orders.currentOrder?.shippingAddress.city},
            {" "}
            {orders.currentOrder?.shippingAddress.state}
            {" - "}
            {orders.currentOrder?.shippingAddress.pinCode}
          </p>
        </div>
      </div>

      <div className='border  space-y-4'>

        <div className='flex justify-between text-sm pt-5 px-5'>
          <div className='space-y-1'>
            <p className='font-bold'>Total Item Price</p>
            {/* <p>You saved <span className='text-green-500 font-medium text-xs'>₹
              {orders.orderItem?.mrpPrice - orders.orderItem?.sellingPrice}.00</span> on this item</p> */}
            <p>You saved <span className='text-green-500 font-medium text-xs'>
              ₹ {orders.currentOrder?.discount}.00</span> on this item</p>
          </div>

          <p className='font-medium'>
            ₹ {orders.currentOrder?.totalSellingPrice}.00
          </p>
        </div>

        <div className='px-5 '>
          <div className='bg-teal-50 px-5 py-2 text-xs font-medium flex items-center gap-3 '>
            <PaymentsIcon />
            <p>
              {orders.currentOrder?.payment?.method === "RAZORPAY"
                ? "Razorpay"
                : orders.currentOrder?.payment?.method === "STRIPE"
                  ? "Stripe"
                  : "Cash On Delivery"}
            </p>


          </div>
        </div>


        <Divider />
        <div className='px-5 pb-3 space-y-2 text-sm'>
          <p className='text-xs'><strong>Sold by : </strong>{orders.orderItem.product.seller?.businessDetails.businessName}</p>
        </div>
        <Divider />

        <div className="px-5 py-4 space-y-2 text-sm">
          <h2 className="font-bold">Payment Details</h2>

          <div className="flex justify-between">
            <span>Method</span>
            <span>{orders.currentOrder?.payment?.method || "-"}</span>
          </div>

          <div className="flex justify-between">
            <span>Status</span>
            <span>{orders.currentOrder?.payment?.status || "-"}</span>
          </div>

          <div className="flex justify-between">
            <span>Amount</span>
            <span>
              ₹ {orders.currentOrder?.payment?.amount ?? orders.currentOrder?.totalSellingPrice}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Transaction ID</span>
            <span
              className="text-xs truncate max-w-[220px]"
              title={orders.currentOrder?.payment?.transactionId ?? undefined}
            >
              {orders.currentOrder?.payment?.transactionId ?? "-"}
            </span>
          </div>
        </div>

        <Divider />

        <div className="p-5">
          <h2 className="font-semibold text-sm mb-4">
            Order Actions
          </h2>

          {existingReturn && !isReturnTerminal && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
              <p className="font-medium text-amber-800">
                Return Status: <span className="font-bold">{existingReturn.returnStatus.replace(/_/g, ' ')}</span>
              </p>
              <p className="text-amber-600 text-xs mt-1">
                Requested on {formatDate(existingReturn.requestedAt)}
              </p>
            </div>
          )}

          {existingReturn && existingReturn.returnStatus === ReturnStatus.REFUND_COMPLETED && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
              <p className="font-medium text-green-800">
                Refund Completed — ₹{existingReturn.refundAmount}.00
              </p>
            </div>
          )}

          {existingReturn && existingReturn.returnStatus === ReturnStatus.REJECTED && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
              <p className="font-medium text-red-800">Return Rejected</p>
              {existingReturn.sellerNote && (
                <p className="text-red-600 text-xs mt-1">{existingReturn.sellerNote}</p>
              )}
            </div>
          )}

          <div className="p-5 space-y-3">

            {orders.currentOrder?.payment?.status === "PENDING" && (
              <Button
                fullWidth
                variant="contained"
                // color="success"
                sx={{ py: "0.8rem" }}
                onClick={() =>
                {
                  // Reissue Payment API call
                }}
              >
                Pay Now
              </Button>
            )}

            <Button
              fullWidth
              variant="outlined"
              color="error"
              sx={{ py: "0.8rem" }}
              disabled={orders.currentOrder?.orderStatus === "CANCELLED"}
              onClick={handleCancelOrder}
            >
              {orders.currentOrder?.orderStatus === "CANCELLED"
                ? "Order Cancelled"
                : "Cancel Order"}
            </Button>

            {canRequestReturn && (
              <Button
                fullWidth
                variant="contained"
                color="warning"
                sx={{ py: "0.8rem" }}
                onClick={() => setReturnDialogOpen(true)}
              >
                Request Return
              </Button>
            )}

            {!isDelivered && orders.currentOrder?.orderStatus !== "CANCELLED" && (
              <p className="text-xs text-gray-400 text-center">
                Return available after delivery
              </p>
            )}

            {isDelivered && !isWithinReturnWindow && !existingReturn && (
              <p className="text-xs text-gray-400 text-center">
                Return window (7 days) has expired
              </p>
            )}

          </div>
        </div>

        {orderId && orderItemId && orders.orderItem && (
          <ReturnRequestDialog
            open={returnDialogOpen}
            onClose={() => setReturnDialogOpen(false)}
            orderId={orderId}
            orderItemId={orderItemId}
            productId={orders.orderItem.product.id || ""}
          />
        )}
      </div>
    </Box>
  )
}

export default OrderDetails