import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import { notification } from '../../../../services/notificationService';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Order, OrderItem } from '../../../../types/orderTypes';
import OrderStatusChip from './OrderStatusChip';
import PaymentChip from './PaymentChip';
import OrderTimeline from './OrderTimeline';

interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

function fmt(n: number) {
  return '₹' + n.toFixed(2);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
    {children}
  </Typography>
);

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{label}</Typography>
    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem', textAlign: 'right' }}>{value}</Typography>
  </Box>
);

const OrderDetailDrawer: React.FC<Props> = ({ order, open, onClose }) => {
  if (!order) return null;

  const firstItem: OrderItem | undefined = order.orderItems?.[0];

  const handleCopyAddress = () => {
    const addr = order.shippingAddress;
    if (!addr) return;
    const parts = [addr.name, addr.address, addr.locality].filter(Boolean);
    parts.push(`${addr.city}, ${addr.state} - ${addr.pinCode}`);
    const text = parts.join(', ') + `. Mobile: ${addr.mobile}`;
    navigator.clipboard.writeText(text).then(() => {
      notification.info("Address copied");
    });
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 460, md: 520 },
            borderRadius: 0,
          },
        }}
        aria-label="Order details drawer"
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.3 }}>
              {order.orderId}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(order.orderDate)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="Close drawer">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1, px: 2.5, py: 2 }}>
          {/* Overview */}
          <Box sx={{ mb: 2.5 }}>
            <SectionTitle>Overview</SectionTitle>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <OrderStatusChip status={order.orderStatus} size="medium" />
              {order.paymentStatus && <PaymentChip status={order.paymentStatus} size="medium" />}
            </Box>
            <InfoRow label="Order ID" value={order.orderId} />
            <InfoRow label="Order Date" value={formatDate(order.orderDate)} />
            <InfoRow label="Expected Delivery" value={formatDate(order.estimatedDelivery || order.deliverDate)} />
            <InfoRow label="Total Items" value={order.totalItem ?? order.orderItems?.length ?? 0} />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Product */}
          {firstItem?.product && (
            <Box sx={{ mb: 2.5 }}>
              <SectionTitle>Product</SectionTitle>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  component="img"
                  src={firstItem.product.images?.[0]?.url || '/logo192.png'}
                  alt={firstItem.product.title}
                  sx={{ width: 72, height: 72, borderRadius: 1.5, objectFit: 'cover', border: '1px solid', borderColor: 'divider', bg: '#FAFAFA', flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem', lineHeight: 1.3, mb: 0.3 }}>
                    {firstItem.product.title}
                  </Typography>
                  {firstItem.variantAttributes && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                      {Object.entries(firstItem.variantAttributes).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </Typography>
                  )}
                  <InfoRow label="Qty" value={firstItem.quantity ?? 1} />
                  <InfoRow label="MRP" value={<span style={{ textDecoration: 'line-through', color: '#9E9E9E' }}>{fmt(firstItem.mrpPrice)}</span>} />
                  <InfoRow label="Selling Price" value={fmt(firstItem.sellingPrice)} />
                </Box>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 1.5 }} />

          {/* Financial Summary */}
          <Box sx={{ mb: 2.5 }}>
            <SectionTitle>Financial Summary</SectionTitle>
            <InfoRow label="Total MRP" value={fmt(order.totalMrpPrice)} />
            <InfoRow label="Selling Price" value={fmt(order.totalSellingPrice ?? 0)} />
            {order.couponDiscount != null && order.couponDiscount > 0 && (
              <InfoRow label="Coupon Discount" value={<Typography variant="body2" color="success.main" fontWeight={600} sx={{ fontSize: '0.8rem' }}>-{fmt(order.couponDiscount)}</Typography>} />
            )}
            <Box sx={{ borderTop: '1px dashed', borderColor: 'divider', mt: 0.5, pt: 0.5 }}>
              <InfoRow label="Amount Paid" value={<Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontSize: '0.85rem' }}>{fmt(order.payment?.amount ?? order.totalSellingPrice ?? 0)}</Typography>} />
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Customer */}
          <Box sx={{ mb: 2.5 }}>
            <SectionTitle>Customer</SectionTitle>
            <InfoRow label="Name" value={order.user?.fullName || order.shippingAddress?.name || '—'} />
            <InfoRow label="Phone" value={order.user?.mobile || order.shippingAddress?.mobile || '—'} />
            <InfoRow label="Email" value={order.user?.email || '—'} />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Shipping */}
          {order.shippingAddress && (
            <Box sx={{ mb: 2.5 }}>
              <SectionTitle>Shipping Address</SectionTitle>
              <Box sx={{ bg: '#FAFAFA', borderRadius: 1.5, p: 1.5, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={600}>{order.shippingAddress.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', mt: 0.3 }}>
                  {order.shippingAddress.address}{order.shippingAddress.locality ? `, ${order.shippingAddress.locality}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', mt: 0.3 }}>
                  📞 {order.shippingAddress.mobile}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyAddress}
                  sx={{ mt: 1, textTransform: 'none', fontSize: '0.75rem' }}
                  aria-label="Copy shipping address"
                >
                  Copy Address
                </Button>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 1.5 }} />

          {/* Payment */}
          <Box sx={{ mb: 2.5 }}>
            <SectionTitle>Payment</SectionTitle>
            {order.payment ? (
              <>
                <InfoRow label="Gateway" value={order.payment.method || '—'} />
                <InfoRow label="Status" value={<PaymentChip status={order.payment.status} />} />
                <InfoRow label="Transaction ID" value={order.payment.transactionId ? (
                  <Tooltip title={order.payment.transactionId}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.payment.transactionId}
                    </Typography>
                  </Tooltip>
                ) : '—'} />
                <InfoRow label="Amount Paid" value={<Typography fontWeight={700}>{fmt(order.payment.amount)}</Typography>} />
              </>
            ) : (
              <InfoRow label="Status" value={order.paymentStatus || 'Pending'} />
            )}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Timeline */}
          <Box sx={{ mb: 2.5 }}>
            <SectionTitle>Order Timeline</SectionTitle>
            <Box sx={{ pl: 1 }}>
              <OrderTimeline currentStatus={order.orderStatus} />
            </Box>
          </Box>
        </Box>
      </Drawer>

    </>
  );
};

export default React.memo(OrderDetailDrawer);
