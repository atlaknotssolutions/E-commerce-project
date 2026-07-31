import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '../../../Redux Toolkit/Store';
import SummaryCards from './components/SummaryCards';
import OrderTable from './OrderTable';

const Orders: React.FC = () => {
  const { sellerOrder } = useAppSelector((s) => s);

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, sm: 2.5 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          All Orders
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          Manage and track all customer orders.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <SummaryCards orders={sellerOrder.orders} />

      {/* Orders Table */}
      <OrderTable />
    </Box>
  );
};

export default Orders;
