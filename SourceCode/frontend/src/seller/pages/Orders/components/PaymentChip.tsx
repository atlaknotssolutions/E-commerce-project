import React from 'react';
import Chip from '@mui/material/Chip';

const PAYMENT_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PAID:       { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7', label: 'Paid' },
  COMPLETED:  { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9', label: 'Completed' },
  FAILED:     { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A', label: 'Failed' },
  REFUNDED:   { bg: '#F3E5F5', text: '#6A1B9A', border: '#CE93D8', label: 'Refunded' },
  PENDING:    { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082', label: 'Pending' },
};

interface Props {
  status: string;
  size?: 'small' | 'medium';
}

const PaymentChip: React.FC<Props> = ({ status, size = 'small' }) => {
  const config = PAYMENT_CONFIG[status] || { bg: '#F5F5F5', text: '#616161', border: '#BDBDBD', label: status };
  return (
    <Chip
      label={config.label}
      size={size}
      aria-label={`Payment status: ${config.label}`}
      sx={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
        border: '1px solid',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.75rem',
        height: size === 'small' ? 22 : 28,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
};

export default React.memo(PaymentChip);
