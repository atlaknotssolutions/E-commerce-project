import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
  totalMrpPrice: number;
  totalSellingPrice: number;
  couponDiscount?: number;
  netAmount?: number;
}

function fmt(n: number) {
  return '₹' + n.toFixed(2);
}

const AmountDisplay: React.FC<Props> = ({ totalMrpPrice, totalSellingPrice, couponDiscount, netAmount }) => {
  return (
    <Box sx={{ lineHeight: 1.6 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
        MRP <span style={{ textDecoration: 'line-through', color: '#9E9E9E' }}>{fmt(totalMrpPrice)}</span>
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8125rem' }}>
        {fmt(totalSellingPrice)}
      </Typography>
      {couponDiscount != null && couponDiscount > 0 && (
        <Typography variant="caption" color="success.main" sx={{ display: 'block', fontSize: '0.7rem', fontWeight: 500 }}>
          -{fmt(couponDiscount)}
        </Typography>
      )}
      {netAmount != null ? (
        <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontSize: '0.8125rem', mt: 0.3 }}>
          {fmt(netAmount)}
        </Typography>
      ) : (
        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8125rem', mt: 0.3 }}>
          {fmt(totalSellingPrice)}
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(AmountDisplay);
