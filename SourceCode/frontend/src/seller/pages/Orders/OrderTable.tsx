import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";

import
{
  fetchSellerOrders,
  updateOrderStatus,
  assignTracking,
} from "../../../Redux Toolkit/Seller/sellerOrderSlice";

import { Order, OrderItem } from "../../../types/orderTypes";
import { StyledTableCell, StyledTableRow } from '../../../components/shared/Table';

const orderStatus = [
  { color: '#FFA500', label: 'PENDING' },
  { color: '#F5BCBA', label: 'PLACED' },
  { color: '#F5BCBA', label: 'CONFIRMED' },
  { color: '#9370DB', label: 'PACKED' },
  { color: '#1E90FF', label: 'SHIPPED' },
  { color: '#20B2AA', label: 'OUT_FOR_DELIVERY' },
  { color: '#32CD32', label: 'DELIVERED' },
  { color: '#FF0000', label: 'CANCELLED' },
];
const orderStatusColor = {
  PENDING: { color: '#FFA500', label: 'PENDING' },
  CONFIRMED: { color: '#F5BCBA', label: 'CONFIRMED' },
  PLACED: { color: '#F5BCBA', label: 'PLACED' },
  PACKED: { color: '#9370DB', label: 'PACKED' },
  SHIPPED: { color: '#1E90FF', label: 'SHIPPED' },
  OUT_FOR_DELIVERY: { color: '#20B2AA', label: 'OUT_FOR_DELIVERY' },
  DELIVERED: { color: '#32CD32', label: 'DELIVERED' },
  CANCELLED: { color: '#FF0000', label: 'CANCELLED' },
};

export default function OrderTable()
{
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const { sellerOrder } = useAppSelector(store => store);
  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = React.useState<Record<string, HTMLElement | null>>({});
  const [trackingDialog, setTrackingDialog] = React.useState<{ open: boolean; orderId: string; trackingNumber: string; carrier: string }>({
    open: false,
    orderId: '',
    trackingNumber: '',
    carrier: 'DELHIVERY',
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>, orderId: string) =>
  {
    setAnchorEl((prev) => ({ ...prev, [orderId]: event.currentTarget }));
  };

  const handleClose = (orderId: string) =>
  {
    setAnchorEl((prev) => ({ ...prev, [orderId]: null }));
  };

  React.useEffect(() =>
  {
    if (sellerOrder.ordersLoaded) return;
    dispatch(fetchSellerOrders(localStorage.getItem("jwt") || ""));
  }, [dispatch, sellerOrder.ordersLoaded]);

  const handleUpdateOrder = (orderId: string, orderStatus: any) =>
  {
    dispatch(updateOrderStatus({
      jwt: localStorage.getItem("jwt") || "",
      orderId,
      orderStatus,
    }));
    handleClose(orderId);
  };

  const handleAssignTracking = () =>
  {
    if (!trackingDialog.trackingNumber.trim() || !trackingDialog.orderId) return;

    dispatch(assignTracking({
      jwt: localStorage.getItem("jwt") || "",
      orderId: trackingDialog.orderId,
      trackingNumber: trackingDialog.trackingNumber.trim(),
      carrier: trackingDialog.carrier,
    }));
    setTrackingDialog({ open: false, orderId: '', trackingNumber: '', carrier: 'DELHIVERY' });
  };

  return (
    <>
      <h1 className='pb-5 font-bold text-xl'>All Orders</h1>

      <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 290px)" }}>
        <Table stickyHeader sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Order Id</StyledTableCell>
              <StyledTableCell>Products</StyledTableCell>
              <StyledTableCell>Shipping Address</StyledTableCell>
              <StyledTableCell align="right">Order Status</StyledTableCell>
              <StyledTableCell align="right">Update</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sellerOrder.orders.map((item: Order) => (
              <StyledTableRow key={item.id}>
                {/* <StyledTableCell align="left">{item.orderId}</StyledTableCell> */}
                <StyledTableCell align="left" className="align-top">
                  <span className="font-semibold text-gray-900">{item.orderId}</span>
                  <div className="mt-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded border ${item.paymentStatus === 'PAID'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                      PAYMENT: {item.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                </StyledTableCell>
                {/* <StyledTableCell component="th" scope="row">
                  <div className='flex gap-1 flex-wrap'>
                    {item.orderItems.map((orderItem: OrderItem) =>
                      <div key={orderItem.id} className='flex gap-5'>
                        <img className='w-20 rounded-md' src={orderItem.product?.images?.[0]?.url || "/logo192.png"} alt="" />
                        <div className='flex flex-col justify-between py-2'>
                          <h1>Title: {orderItem.product?.title}</h1>
                          <h1>Price: Rs.{orderItem.product?.sellingPrice}</h1>
                          <h1>Color: {orderItem.product?.color}</h1>
                          <h1>Size: {orderItem.size}</h1>
                        </div>
                      </div>
                    )}
                  </div>
                </StyledTableCell> */}

                <StyledTableCell component="th" scope="row" className="align-top">
                  <div className='flex flex-col gap-3'>
                    {item.orderItems.map((orderItem: OrderItem) => (
                      <div key={orderItem.id} className='flex gap-4 items-center bg-gray-50/60 p-2 rounded-md border border-gray-100'>
                        <img className='w-16 h-16 object-cover rounded-md border bg-white' src={orderItem.product?.images?.[0]?.url || "/logo192.png"} alt="" />
                        <div className='flex flex-col text-xs text-gray-600 space-y-0.5'>
                          <h2 className='font-bold text-gray-800 text-sm'>{orderItem.product?.title}</h2>
                          <p>
                            {orderItem.variantAttributes
                              ? (() => {
                                  const parts: string[] = [];
                                  const va = orderItem.variantAttributes;
                                  if (va.color) parts.push(`Color: ${va.color}`);
                                  if (va.size) parts.push(`Size: ${va.size}`);
                                  if (va.storage) parts.push(`Storage: ${va.storage}`);
                                  if (va.ram) parts.push(`RAM: ${va.ram}`);
                                  return parts.length > 0 ? parts.join(" | ") : `Size: ${orderItem.size}`;
                                })()
                              : `Color: ${orderItem.product?.color} | Size: ${orderItem.size || 'FREE'}`
                            }
                          </p>
                          <p className="text-gray-900 font-medium">
                            Price: Rs.{orderItem.product?.sellingPrice} × <span className="text-blue-600 font-bold text-sm">{orderItem.quantity || 1}</span>
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Financial Summary Breakdown */}
                    <div className="border-t border-dashed pt-2 mt-1 flex justify-between items-center px-1">
                      <span className="text-xs text-gray-400 font-medium">Total Items: {item.totalItem}</span>
                      <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Payout: Rs.{item.totalSellingPrice}
                      </span>
                    </div>
                  </div>
                </StyledTableCell>
                {/* <StyledTableCell>
                  <div className='flex flex-col gap-y-2'>
                    <h1>{item.shippingAddress.name}</h1>
                    <h1>{item.shippingAddress.address}, {item.shippingAddress.city}</h1>
                    <h1>{item.shippingAddress.state} - {item.shippingAddress.pinCode}</h1>
                    <h1><strong>Mobile:</strong> {item.shippingAddress.mobile}</h1>
                  </div>
                </StyledTableCell> */}

                <StyledTableCell className="align-top">
                  <div className='flex flex-col text-xs text-gray-600 space-y-1 max-w-[220px]'>
                    <h1 className='font-bold text-gray-900 text-sm'>{item.shippingAddress.name}</h1>
                    <h1 className='leading-relaxed'>{item.shippingAddress.address}</h1>
                    <h1 className='font-semibold text-gray-800 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded w-fit text-[11px] mt-0.5'>
                      {item.shippingAddress.city}, {item.shippingAddress.state} - <span className='underline font-bold text-gray-950'>{item.shippingAddress.pinCode}</span>
                    </h1>
                    <h1 className='pt-1 text-gray-700'><strong>Mobile:</strong> <span className="font-medium">{item.shippingAddress.mobile}</span></h1>
                  </div>
                </StyledTableCell>
                <StyledTableCell
                  sx={{ color: orderStatusColor[item.orderStatus].color }}
                  align="center"> <Box sx={{ borderColor: orderStatusColor[item.orderStatus].color }} className={`border px-2 py-1 rounded-full text-xs`}>
                    {item.orderStatus}</Box>
                    {item.trackingNumber && (
                      <div className="mt-1 text-[10px] text-gray-500 truncate max-w-[120px] mx-auto" title={item.trackingNumber}>
                        {item.carrier}: {item.trackingNumber}
                      </div>
                    )}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {item.orderStatus === 'PACKED' && !item.trackingNumber && (
                    <Button
                      size='small'
                      onClick={() => setTrackingDialog({ open: true, orderId: item.id, trackingNumber: '', carrier: 'DELHIVERY' })}
                      color='secondary'
                      className='mb-1'
                      variant='outlined'>
                      Track
                    </Button>
                  )}
                  <Button
                    size='small'
                    onClick={(e) => handleClick(e, item.id)}
                    color='primary'
                    className='bg-primary-color'>
                    Status
                  </Button>
                  <Menu
                    id={`status-menu ${item.id}`}
                    anchorEl={anchorEl[item.id]}
                    open={Boolean(anchorEl[item.id])}
                    onClose={() => handleClose(item.id)}
                    MenuListProps={{
                      'aria-labelledby': `status-menu ${item.id}`,
                    }}
                  >
                    {orderStatus.map((status) =>
                      <MenuItem
                        key={status.label}
                        onClick={() => handleUpdateOrder(item.id, status.label)}>
                        {status.label}</MenuItem>
                    )}
                  </Menu>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={trackingDialog.open}
        onClose={() => setTrackingDialog(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Shipment Tracking</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Tracking Number"
              value={trackingDialog.trackingNumber}
              onChange={(e) => setTrackingDialog(prev => ({ ...prev, trackingNumber: e.target.value }))}
              placeholder="e.g. 1234567890"
              size="small"
            />
            <TextField
              fullWidth
              select
              label="Carrier"
              value={trackingDialog.carrier}
              onChange={(e) => setTrackingDialog(prev => ({ ...prev, carrier: e.target.value }))}
              size="small"
              SelectProps={{ native: true }}
            >
              <option value="DELHIVERY">Delhivery</option>
              <option value="BLUE_DART">Blue Dart</option>
              <option value="DTDC">DTDC</option>
              <option value="INDIA_POST">India Post</option>
              <option value="XPRESS_BEES">Xpress Bees</option>
              <option value="EKART">Ekart</option>
              <option value="SHADOWFAX">Shadowfax</option>
              <option value="OTHER">Other</option>
            </TextField>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackingDialog(prev => ({ ...prev, open: false }))} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleAssignTracking}
            variant="contained"
            color="primary"
            disabled={!trackingDialog.trackingNumber.trim()}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
