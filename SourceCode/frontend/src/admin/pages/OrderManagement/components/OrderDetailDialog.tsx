import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    Divider,
    Box,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdminOrder } from '../../../../types/adminOrderTypes';

interface OrderDetailDialogProps {
    open: boolean;
    onClose: () => void;
    order: AdminOrder | null;
    onUpdateStatus?: (order: AdminOrder) => void;
}

const formatDate = (dateStr?: string | null) =>
{
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatDateTime = (dateStr?: string | null) =>
{
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const getOrderStatusChipColor = (status: string): 'warning' | 'success' | 'error' | 'info' | 'default' =>
{
    switch (status)
    {
        case 'PENDING': return 'warning';
        case 'PLACED': return 'info';
        case 'CONFIRMED': return 'success';
        case 'PACKED': return 'info';
        case 'SHIPPED': return 'info';
        case 'OUT_FOR_DELIVERY': return 'info';
        case 'DELIVERED': return 'success';
        case 'CANCELLED': return 'error';
        default: return 'default';
    }
};

const getPaymentStatusChipColor = (status: string): 'success' | 'error' | 'warning' | 'default' =>
{
    switch (status)
    {
        case 'COMPLETED': return 'success';
        case 'FAILED': return 'error';
        case 'PENDING': return 'warning';
        default: return 'default';
    }
};

const FieldRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="p-4 flex items-center bg-slate-50">
        <p className="w-40 pr-4 text-sm text-gray-500">{label}</p>
        <Divider orientation="vertical" flexItem />
        <div className="pl-4 font-medium">{value}</div>
    </div>
);

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pending',
    PLACED: 'Placed',
    CONFIRMED: 'Confirmed',
    PACKED: 'Packed',
    SHIPPED: 'Shipped',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
};

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
    open,
    onClose,
    order,
    onUpdateStatus,
}) =>
{
    if (!order) return null;

    const isTerminal = order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    Order Details — {order.orderId}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* Status Badges */}
                <Box className="flex gap-2 mb-6">
                    <Chip
                        size="small"
                        label={`Order: ${STATUS_LABELS[order.orderStatus] || order.orderStatus}`}
                        color={getOrderStatusChipColor(order.orderStatus)}
                    />
                    <Chip
                        size="small"
                        label={`Payment: ${order.paymentStatus}`}
                        color={getPaymentStatusChipColor(order.paymentStatus)}
                    />
                    <Chip
                        size="small"
                        label={`Shipment: ${order.shipmentStatus.replace(/_/g, ' ')}`}
                        variant="outlined"
                    />
                </Box>

                {/* Order Information */}
                <Box className="space-y-1">
                    <Typography variant="subtitle2" className="px-4 pb-1 text-gray-500">
                        Order Information
                    </Typography>
                    <FieldRow label="Order ID" value={order.orderId} />
                    <FieldRow label="Order Date" value={formatDate(order.orderDate || order.createdAt)} />
                    <FieldRow label="Expected Delivery" value={formatDate(order.deliverDate)} />
                    <FieldRow label="Shipped At" value={order.shippedAt ? formatDateTime(order.shippedAt) : 'N/A'} />
                    <FieldRow label="Delivered At" value={order.deliveredAt ? formatDateTime(order.deliveredAt) : 'N/A'} />
                    <FieldRow label="Tracking Number" value={order.trackingNumber || 'Not assigned'} />
                    <FieldRow label="Carrier" value={order.carrier || 'Not assigned'} />

                    {/* Customer */}
                    <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                        Customer
                    </Typography>
                    <FieldRow
                        label="Name"
                        value={order.user?.fullName || 'N/A'}
                    />
                    <FieldRow
                        label="Email"
                        value={order.user?.email || 'N/A'}
                    />

                    {/* Seller */}
                    <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                        Seller
                    </Typography>
                    <FieldRow
                        label="Business Name"
                        value={order.seller?.businessDetails?.businessName || order.seller?.sellerName || 'N/A'}
                    />
                    <FieldRow
                        label="Seller Email"
                        value={order.seller?.email || 'N/A'}
                    />

                    {/* Shipping Address */}
                    <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                        Shipping Address
                    </Typography>
                    <FieldRow
                        label="Address"
                        value={
                            order.shippingAddress
                                ? `${order.shippingAddress.streetAddress || ''}${order.shippingAddress.locality ? ', ' + order.shippingAddress.locality : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}`
                                : 'N/A'
                        }
                    />

                    {/* Order Items */}
                    <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                        Items ({order.totalItem})
                    </Typography>
                    <TableContainer component={Paper} className="mb-4">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">MRP</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.orderItems?.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell>
                                            <div className="font-medium text-sm">{item.title}</div>
                                        </TableCell>
                                        <TableCell align="right">{item.quantity}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.mrpPrice)}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.sellingPrice)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Price Summary */}
                    <Typography variant="subtitle2" className="px-4 pb-1 text-gray-500">
                        Price Summary
                    </Typography>
                    <FieldRow label="Total MRP" value={formatCurrency(order.totalMrpPrice)} />
                    <FieldRow label="Total Selling Price" value={formatCurrency(order.totalSellingPrice)} />
                    <FieldRow label="Discount" value={formatCurrency(order.discount)} />

                    {/* Payment Info */}
                    {order.payment && (
                        <>
                            <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                                Payment Information
                            </Typography>
                            <FieldRow label="Method" value={order.payment.method} />
                            <FieldRow label="Status" value={order.payment.status} />
                            <FieldRow label="Amount" value={formatCurrency(order.payment.amount)} />
                            <FieldRow label="Transaction ID" value={order.payment.transactionId || 'N/A'} />
                        </>
                    )}

                    {/* Status History */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                        <>
                            <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                                Status History
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>From</TableCell>
                                            <TableCell>To</TableCell>
                                            <TableCell>Changed At</TableCell>
                                            <TableCell>Note</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.statusHistory.map((entry, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{STATUS_LABELS[entry.fromStatus] || entry.fromStatus}</TableCell>
                                                <TableCell>{STATUS_LABELS[entry.toStatus] || entry.toStatus}</TableCell>
                                                <TableCell>{formatDateTime(entry.changedAt)}</TableCell>
                                                <TableCell>{entry.note || '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            </DialogContent>

            <DialogActions className="px-4 py-3">
                {!isTerminal && onUpdateStatus && (
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => onUpdateStatus(order)}
                    >
                        Update Status
                    </Button>
                )}
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(OrderDetailDialog);
