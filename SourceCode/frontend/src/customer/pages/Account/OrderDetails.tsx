import { Box, Button, Divider, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import React, { useEffect, useState } from 'react'
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OrderStepper from './OrderStepper';
import ReturnRequestDialog from './ReturnRequestDialog';
import OrderStatusBadge from './OrderStatusBadge';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { cancelOrder, clearOrderCanceled, clearOrderError, downloadInvoice, fetchMyReturns, fetchOrderById, fetchOrderItemById } from '../../../Redux Toolkit/Customer/OrderSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { notification } from '../../../services/notificationService';
import { formatDate } from '../../util/fomateDate';
import { OrderStatus, ReturnStatus } from '../../../types/orderTypes';

const OrderDetails = () =>
{
  const dispatch = useAppDispatch()
  const { orders } = useAppSelector(store => store);
  const { orderItemId, orderId } = useParams()
  const navigate = useNavigate();
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const jwt = localStorage.getItem("jwt") || "";

  useEffect(() =>
  {
    if (orderItemId && orderId)
    {
      dispatch(fetchOrderItemById({ orderItemId, jwt }))
      dispatch(fetchOrderById({ orderId, jwt }))
    }

    if (orders.returns.length === 0 && !orders.returnsLoaded) {
      dispatch(fetchMyReturns(jwt));
    }
  }, [dispatch, orderItemId, orderId, orders.returns.length, orders.returnsLoaded, jwt])

  useEffect(() => {
    if (orders.orderCanceled) {
      notification.success('Order cancelled successfully');
      dispatch(clearOrderCanceled());
    }
  }, [orders.orderCanceled, dispatch]);

  useEffect(() => {
    if (orders.error) {
      notification.error(orders.error);
      dispatch(clearOrderError());
    }
  }, [orders.error, dispatch]);

  if (!orders.currentOrder || !orders.orderItem)
  {
    return <div className='h-[80vh] flex justify-center items-center text-gray-500'>
      No order found
    </div>;
  }

  const existingReturn = orders.returns.find(r => r.orderItemId === orderItemId);
  const currentStatus = orders.currentOrder?.orderStatus;
  const isDelivered = currentStatus === OrderStatus.DELIVERED;
  const isCancelled = currentStatus === OrderStatus.CANCELLED;
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

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orders.currentOrder?.orderId || orders.currentOrder?.id || '').then(() => {
      notification.info('Order ID copied');
    });
  };

  const handleCancelOrder = () =>
  {
    setCancelDialogOpen(false);
    if (orderId)
    {
      dispatch(cancelOrder(orderId))
    }
  }

  const getCancelButton = () => {
    switch (currentStatus) {
      case OrderStatus.PLACED:
        return (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            size="large"
            sx={{ py: "0.8rem", borderWidth: 2, '&:hover': { borderWidth: 2 } }}
            onClick={() => setCancelDialogOpen(true)}
          >
            Cancel Order
          </Button>
        );
      case OrderStatus.CONFIRMED:
        return (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            size="large"
            sx={{ py: "0.8rem" }}
            onClick={() => setCancelDialogOpen(true)}
          >
            Cancel Order
          </Button>
        );
      case OrderStatus.PACKED:
        return (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm">
            <p className="text-amber-800 font-medium">This order has already been packed and can no longer be cancelled.</p>
          </div>
        );
      case OrderStatus.SHIPPED:
      case OrderStatus.OUT_FOR_DELIVERY:
        return (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="text-blue-800 font-medium">Order has been shipped. Cancellation is no longer available.</p>
          </div>
        );
      case OrderStatus.DELIVERED:
        if (canRequestReturn) {
          return (
            <Button
              fullWidth
              variant="contained"
              color="warning"
              size="large"
              sx={{ py: "0.8rem" }}
              onClick={() => setReturnDialogOpen(true)}
            >
              Return / Replace
            </Button>
          );
        }
        return (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm">
            <p className="text-gray-600 font-medium">Return period expired</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Box className='space-y-5'>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="primary">
            Keep Order
          </Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained">
            Cancel Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Summary Header — Task 2, 5 */}
      <section className='border rounded-lg p-5 bg-white shadow-sm'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
          <div>
            <div className='flex items-center gap-1'>
              <span className='text-gray-500 text-xs'>Order ID</span>
            </div>
            <div className='flex items-center gap-1 mt-0.5'>
              <span className='font-mono font-medium'>{orders.currentOrder?.orderId || orders.currentOrder?.id}</span>
              <Tooltip title="Copy Order ID">
                <ContentCopyIcon
                  onClick={handleCopyOrderId}
                  sx={{ fontSize: 14, color: 'text.secondary', cursor: 'pointer', '&:hover': { color: '#00927c' } }}
                />
              </Tooltip>
            </div>
          </div>
          <div>
            <span className='text-gray-500 text-xs'>Placed On</span>
            <p className='font-medium mt-0.5'>
              {orders.currentOrder?.orderDate
                ? new Date(orders.currentOrder.orderDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                : '-'}
            </p>
          </div>
          <div>
            <span className='text-gray-500 text-xs'>Status</span>
            <div className='mt-0.5'>
              <OrderStatusBadge status={currentStatus || ''} size="small" />
            </div>
          </div>
          <div>
            <span className='text-gray-500 text-xs'>Payment</span>
            <p className='font-medium mt-0.5'>
              {orders.currentOrder?.payment?.method === "RAZORPAY"
                ? "Razorpay"
                : orders.currentOrder?.payment?.method === "STRIPE"
                  ? "Stripe"
                  : "Cash On Delivery"}
            </p>
          </div>
          <div>
            <span className='text-gray-500 text-xs'>Payment Status</span>
            <div className='mt-0.5'>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                orders.currentOrder?.payment?.status === "COMPLETED"
                  ? 'bg-green-50 text-green-700'
                  : orders.currentOrder?.payment?.status === "PENDING"
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {orders.currentOrder?.payment?.status || '-'}
              </span>
            </div>
          </div>
          <div>
            <span className='text-gray-500 text-xs'>Seller</span>
            <p className='font-medium mt-0.5 truncate' title={orders.orderItem?.product?.seller?.businessDetails?.businessName}>
              {orders.orderItem?.product?.seller?.businessDetails?.businessName || '-'}
            </p>
          </div>
          {orders.currentOrder?.estimatedDelivery && (
            <div>
              <span className='text-gray-500 text-xs'>Estimated Delivery</span>
              <p className='font-medium mt-0.5'>{formatDate(orders.currentOrder.estimatedDelivery)}</p>
            </div>
          )}
          {orders.currentOrder?.deliveredAt && (
            <div>
              <span className='text-gray-500 text-xs'>Delivered On</span>
              <p className='font-medium text-green-600 mt-0.5'>{formatDate(orders.currentOrder.deliveredAt)}</p>
            </div>
          )}
        </div>
      </section>

      {/* Product & Review Section */}
      <section className='border rounded-lg p-5 bg-white shadow-sm'>
        <div className='flex flex-col sm:flex-row gap-5 items-center sm:items-start'>
          <img
            className="w-[90px] h-[90px] object-cover rounded-lg"
            src={
              orders.orderItem?.product.images?.[0]?.url ||
              "/logo192.png"
            }
            alt={orders.orderItem?.product.title}
          />
          <div className='flex-1 text-sm space-y-1 text-center sm:text-left'>
            <h1 className='font-bold text-base'>{orders.orderItem?.product.seller?.businessDetails.businessName}</h1>
            <p className='text-gray-700'>{orders.orderItem?.product.title}</p>
            <p className='text-gray-500'>
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
          <div className='shrink-0'>
            {isDelivered ? (
              <Button
                onClick={() => navigate(`/reviews/${orders.orderItem?.product.id}/create`)}
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Write Review
              </Button>
            ) : (
              <Button disabled sx={{ textTransform: 'none' }}>
                Write Review
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Order Stepper */}
      <section className='border rounded-lg p-5 bg-white shadow-sm'>
        <h2 className='font-semibold text-sm mb-2'>Order Progress</h2>
        <OrderStepper orderStatus={orders.currentOrder?.orderStatus} />
      </section>

      {/* Shipment Tracking */}
      {orders.currentOrder?.trackingNumber && (
        <section className='border rounded-lg p-5 bg-white shadow-sm'>
          <div className='flex items-center gap-2 pb-3'>
            <LocalShippingIcon sx={{ color: '#00927c' }} />
            <h2 className='font-bold text-sm'>Shipment Tracking</h2>
          </div>
          <div className='text-sm space-y-2'>
            <div className='flex justify-between border-b border-gray-50 pb-2'>
              <span className='text-gray-500'>Carrier</span>
              <span className='font-medium'>{orders.currentOrder.carrier || '-'}</span>
            </div>
            <div className='flex justify-between border-b border-gray-50 pb-2'>
              <span className='text-gray-500'>Tracking Number</span>
              <span className='font-medium font-mono text-xs'>{orders.currentOrder.trackingNumber}</span>
            </div>
            <div className='flex justify-between border-b border-gray-50 pb-2'>
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
              <div className='flex justify-between border-b border-gray-50 pb-2'>
                <span className='text-gray-500'>Shipped On</span>
                <span className='font-medium'>{formatDate(orders.currentOrder.shippedAt)}</span>
              </div>
            )}
            {orders.currentOrder.estimatedDelivery && (
              <div className='flex justify-between border-b border-gray-50 pb-2'>
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
        </section>
      )}

      {/* Delivery Address */}
      <section className='border rounded-lg p-5 bg-white shadow-sm'>
        <h2 className='font-bold text-sm pb-3'>Delivery Address</h2>
        <div className='text-sm space-y-2'>
          <div className='flex gap-3 font-medium'>
            <p>{orders.currentOrder?.shippingAddress.name}</p>
            <span className='text-gray-300'>|</span>
            <p>{orders.currentOrder?.shippingAddress.mobile}</p>
          </div>
          <p className='text-gray-600'>
            {orders.currentOrder?.shippingAddress.address},
            {orders.currentOrder?.shippingAddress.locality && ` ${orders.currentOrder?.shippingAddress.locality},`}
            {" "}
            {orders.currentOrder?.shippingAddress.city},
            {" "}
            {orders.currentOrder?.shippingAddress.state}
            {" - "}
            {orders.currentOrder?.shippingAddress.pinCode}
          </p>
        </div>
      </section>

      {/* Price Breakdown */}
      <section className='border rounded-lg bg-white shadow-sm'>
        <h2 className='font-bold text-sm px-5 pt-5 pb-2'>Price Breakdown</h2>
        <div className='px-5 pb-3 space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span>MRP</span>
            <span>₹ {(orders.currentOrder?.totalMrpPrice ?? 0).toFixed(2)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Product Discount</span>
            <span className='text-green-600'>
              - ₹ {((orders.currentOrder?.discount ?? 0)).toFixed(2)}
            </span>
          </div>
          <Divider />
          <div className='flex justify-between font-medium'>
            <span>Selling Price</span>
            <span>₹ {(orders.orderItem?.sellingPrice ?? 0).toFixed(2)}</span>
          </div>

          {(orders.currentOrder?.couponDiscount ?? 0) > 0 && (
            <div className='flex justify-between'>
              <span>Coupon Discount</span>
              <span className='text-green-600'>
                - ₹ {(orders.currentOrder?.couponDiscount ?? 0).toFixed(2)}
              </span>
            </div>
          )}

          <div className='flex justify-between'>
            <span>Shipping Charges</span>
            <span className='text-green-600'>Free</span>
          </div>
          <div className='flex justify-between'>
            <span>Tax</span>
            <span>Included</span>
          </div>
          <Divider />
          <div className='flex justify-between font-bold text-base'>
            <span>Amount Paid</span>
            <span>₹ {(orders.currentOrder?.payment?.amount ?? orders.currentOrder?.totalSellingPrice ?? 0).toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Payment Information */}
      <section className='border rounded-lg bg-white shadow-sm'>
        <h2 className='font-bold text-sm px-5 pt-5 pb-2'>Payment Information</h2>
        <div className='px-5 pb-3 space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Payment Method</span>
            <span className='font-medium'>
              {orders.currentOrder?.payment?.method === "RAZORPAY"
                ? "Razorpay"
                : orders.currentOrder?.payment?.method === "STRIPE"
                  ? "Stripe"
                  : "Cash On Delivery"}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Payment Status</span>
            <span className={`font-medium px-2 py-0.5 rounded text-xs ${
              orders.currentOrder?.payment?.status === "COMPLETED"
                ? 'bg-green-50 text-green-700'
                : orders.currentOrder?.payment?.status === "PENDING"
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {orders.currentOrder?.payment?.status || "-"}
            </span>
          </div>
          {orders.currentOrder?.payment?.transactionId && (
            <div className='flex justify-between'>
              <span className='text-gray-500'>Transaction ID</span>
              <span
                className='font-medium text-xs truncate max-w-[220px]'
                title={orders.currentOrder.payment.transactionId}
              >
                {orders.currentOrder.payment.transactionId}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Seller Info */}
      <section className='border rounded-lg bg-white shadow-sm px-5 py-4'>
        <p className='text-sm'><strong>Sold by:</strong> {orders.orderItem?.product?.seller?.businessDetails?.businessName}</p>
      </section>

      {/* Download Invoice */}
      <section className='border rounded-lg bg-white shadow-sm px-5 py-4'>
        {isDelivered ? (
          <Button
            fullWidth
            variant="outlined"
            sx={{ py: "0.6rem", textTransform: 'none' }}
            disabled={orders.loading}
            onClick={async () => {
              try {
                await dispatch(downloadInvoice({ orderId: orders.currentOrder?.id || orderId || '', jwt })).unwrap();
                notification.success('Invoice downloaded successfully');
              } catch (err: any) {
                notification.error(err || 'Failed to download invoice');
              }
            }}
          >
            {orders.loading ? 'Downloading...' : 'Download Invoice'}
          </Button>
        ) : (
          <Tooltip title="Invoice will be available after successful delivery." arrow>
            <span>
              <Button
                fullWidth
                variant="outlined"
                sx={{ py: "0.6rem", textTransform: 'none' }}
                disabled
              >
                Download Invoice
              </Button>
            </span>
          </Tooltip>
        )}
        {!isDelivered && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Invoice will be available after successful delivery.
          </p>
        )}
      </section>

      {/* Order Actions — Task 4 */}
      <section className='border rounded-lg bg-white shadow-sm'>
        <h2 className='font-bold text-sm px-5 pt-5 pb-2'>Order Actions</h2>

        {existingReturn && !isReturnTerminal && (
          <div className="mx-5 mb-3 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
            <p className="font-medium text-amber-800">
              Return Status: <span className="font-bold">{existingReturn.returnStatus.replace(/_/g, ' ')}</span>
            </p>
            <p className="text-amber-600 text-xs mt-1">
              Requested on {formatDate(existingReturn.requestedAt)}
            </p>
          </div>
        )}

        {existingReturn && existingReturn.returnStatus === ReturnStatus.REFUND_COMPLETED && (
          <div className="mx-5 mb-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
            <p className="font-medium text-green-800">
              Refund Completed — ₹{existingReturn.refundAmount}.00
            </p>
          </div>
        )}

        {existingReturn && existingReturn.returnStatus === ReturnStatus.REJECTED && (
          <div className="mx-5 mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
            <p className="font-medium text-red-800">Return Rejected</p>
            {existingReturn.sellerNote && (
              <p className="text-red-600 text-xs mt-1">{existingReturn.sellerNote}</p>
            )}
          </div>
        )}

        <div className="px-5 pb-5 space-y-3">

          {orders.currentOrder?.payment?.status === "PENDING" && (
            <Button
              fullWidth
              variant="contained"
              sx={{ py: "0.8rem", textTransform: 'none' }}
              onClick={() => {}}
            >
              Pay Now
            </Button>
          )}

          {!isCancelled && !isDelivered && (
            <div className="text-xs text-gray-400 text-center mb-2">
              Return available after delivery
            </div>
          )}

          {getCancelButton()}

          {isDelivered && !isWithinReturnWindow && !existingReturn && !isCancelled && (
            <p className="text-xs text-gray-400 text-center">
              Return window (7 days) has expired
            </p>
          )}

        </div>
      </section>

      {orderId && orderItemId && orders.orderItem && (
        <ReturnRequestDialog
          open={returnDialogOpen}
          onClose={() => setReturnDialogOpen(false)}
          orderId={orderId}
          orderItemId={orderItemId}
          productId={orders.orderItem.product.id || ""}
        />
      )}
    </Box>
  )
}

export default OrderDetails