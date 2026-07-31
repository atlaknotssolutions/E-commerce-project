import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Order } from '../../../../types/orderTypes';

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  packed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

function computeStats(orders: Order[]): Stats {
  const stats: Stats = { total: 0, pending: 0, confirmed: 0, packed: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0 };
  for (const o of orders) {
    stats.total++;
    const status: string = o.orderStatus;
    switch (status) {
      case 'PENDING':           stats.pending++; break;
      case 'PLACED':
      case 'CONFIRMED':         stats.confirmed++; break;
      case 'PACKED':            stats.packed++; break;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':  stats.shipped++; break;
      case 'DELIVERED':         stats.delivered++; break;
      case 'CANCELLED':         stats.cancelled++; break;
      case 'RETURNED':          stats.returned++; break;
    }
  }
  return stats;
}

const CARD_CONFIG = [
  { key: 'total',     label: 'Total Orders',    color: '#1976D2', bg: '#E3F2FD' },
  { key: 'pending',   label: 'Pending',         color: '#F57F17', bg: '#FFF8E1' },
  { key: 'confirmed', label: 'Confirmed',       color: '#1565C0', bg: '#E3F2FD' },
  { key: 'packed',    label: 'Packed',          color: '#4527A0', bg: '#EDE7F6' },
  { key: 'shipped',   label: 'Shipped/Out',     color: '#0277BD', bg: '#E1F5FE' },
  { key: 'delivered', label: 'Delivered',       color: '#2E7D32', bg: '#E8F5E9' },
  { key: 'cancelled', label: 'Cancelled',       color: '#C62828', bg: '#FFEBEE' },
  { key: 'returned',  label: 'Returned',        color: '#AD1457', bg: '#FCE4EC' },
];

interface Props {
  orders: Order[];
}

const SummaryCards: React.FC<Props> = ({ orders }) => {
  const stats = computeStats(orders);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 2,
        mb: 3,
      }}
    >
      {CARD_CONFIG.map(({ key, label, color, bg }) => {
        const value = stats[key as keyof Stats];
        return (
          <Paper
            key={key}
            elevation={0}
            aria-label={`${label}: ${value}`}
            sx={{
              p: 2,
              borderRadius: 2,
              bg,
              border: `1px solid ${color}22`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${color}33`,
              },
            }}
          >
            <Typography variant="h5" fontWeight={700} color={color} sx={{ lineHeight: 1.2 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mt: 0.3 }}>
              {label}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
};

export default React.memo(SummaryCards);
