import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { OrderStatus } from '../../../../types/orderTypes';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: OrderStatus.PLACED, label: 'Order Placed' },
  { status: OrderStatus.CONFIRMED, label: 'Confirmed' },
  { status: OrderStatus.PACKED, label: 'Packed' },
  { status: OrderStatus.SHIPPED, label: 'Shipped' },
  { status: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery' },
  { status: OrderStatus.DELIVERED, label: 'Delivered' },
];

const STATUS_RANK: Record<string, number> = {
  PENDING: 0,
  PLACED: 1,
  CONFIRMED: 2,
  PACKED: 3,
  SHIPPED: 4,
  OUT_FOR_DELIVERY: 5,
  DELIVERED: 6,
  CANCELLED: -1,
  RETURNED: 7,
};

interface Props {
  currentStatus: OrderStatus;
}

const OrderTimeline: React.FC<Props> = ({ currentStatus }) => {
  const rank = STATUS_RANK[currentStatus] ?? -2;
  const isCancelled = currentStatus === OrderStatus.CANCELLED;

  return (
    <Box sx={{ position: 'relative', pl: 3 }}>
      {isCancelled ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main', py: 0.8 }}>
          <CancelIcon fontSize="small" />
          <Typography variant="body2" fontWeight={600}>Order Cancelled</Typography>
        </Box>
      ) : (
        STEPS.map((step, idx) => {
          const completed = idx < rank;
          const active = idx === rank;
          const lineVisible = idx < STEPS.length - 1;

          return (
            <Box key={step.status} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, minHeight: 48 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                {completed ? (
                  <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                ) : active ? (
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bg: 'primary.main',
                      border: '3px solid',
                      borderColor: 'primary.light',
                      boxShadow: '0 0 0 3px rgba(25,118,210,0.2)',
                    }}
                  />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: '#E0E0E0' }} />
                )}
                {lineVisible && (
                  <Box
                    sx={{
                      width: 2,
                      flex: 1,
                      minHeight: 24,
                      bg: completed || (active && idx < STEPS.length - 1) ? 'success.light' : '#E0E0E0',
                      mt: 0.3,
                    }}
                  />
                )}
              </Box>
              <Box sx={{ pb: 0.8, mt: -0.2 }}>
                <Typography
                  variant="body2"
                  fontWeight={active ? 700 : completed ? 500 : 400}
                  color={active ? 'primary.main' : completed ? 'text.primary' : 'text.disabled'}
                >
                  {step.label}
                </Typography>
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default React.memo(OrderTimeline);
