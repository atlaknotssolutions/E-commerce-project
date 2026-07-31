import React from 'react';
import Chip from '@mui/material/Chip';

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PENDING:           { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082', label: 'Pending' },
  PLACED:            { bg: '#E8EAF6', text: '#283593', border: '#9FA8DA', label: 'Placed' },
  CONFIRMED:         { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9', label: 'Confirmed' },
  PACKED:            { bg: '#EDE7F6', text: '#4527A0', border: '#B39DDB', label: 'Packed' },
  SHIPPED:           { bg: '#E1F5FE', text: '#0277BD', border: '#81D4FA', label: 'Shipped' },
  OUT_FOR_DELIVERY:  { bg: '#E0F7FA', text: '#00695C', border: '#80DEEA', label: 'Out for Delivery' },
  DELIVERED:         { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7', label: 'Delivered' },
  CANCELLED:         { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A', label: 'Cancelled' },
  RETURNED:          { bg: '#FCE4EC', text: '#AD1457', border: '#F48FB1', label: 'Returned' },
};

interface Props {
  status: string;
  size?: 'small' | 'medium';
}

const OrderStatusChip: React.FC<Props> = ({ status, size = 'small' }) => {
  const config = STATUS_CONFIG[status] || { bg: '#F5F5F5', text: '#616161', border: '#BDBDBD', label: status };
  return (
    <Chip
      label={config.label}
      size={size}
      aria-label={`Order status: ${config.label}`}
      sx={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
        border: '1px solid',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        height: size === 'small' ? 24 : 32,
        '& .MuiChip-label': { px: 1.2 },
      }}
    />
  );
};

export default React.memo(OrderStatusChip);
