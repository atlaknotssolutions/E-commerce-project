import { Paper, Table, TableBody, TableContainer, TableHead, TableRow, Chip, Box, Button, Typography } from '@mui/material';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { fetchPayoutsBySeller, fetchPayoutBalance, requestPayout } from '../../../Redux Toolkit/Seller/payoutSlice';
import { StyledTableCell, StyledTableRow } from '../../../components/shared/Table';

const statusColor: Record<string, "warning" | "success" | "error" | "info" | "default"> = {
  PENDING: "warning",
  APPROVED: "info",
  REJECTED: "error",
  COMPLETED: "success",
};

const PayoutsTable = () => {
  const { payouts } = useAppSelector(store => store);
  const dispatch = useAppDispatch();
  const jwt = localStorage.getItem("jwt") || "";

  React.useEffect(() => {
    if (!payouts.payoutsLoaded) {
      dispatch(fetchPayoutsBySeller(jwt));
    }
    dispatch(fetchPayoutBalance(jwt));
  }, [dispatch, payouts.payoutsLoaded, jwt]);

  const handleRequestPayout = () => {
    if (!payouts.balance) return;
    const amount = prompt(`Available balance: ₹${payouts.balance.availableBalance}\nEnter amount to withdraw:`);
    if (amount) {
      const parsed = parseFloat(amount);
      if (!isNaN(parsed) && parsed > 0) {
        dispatch(requestPayout({ jwt, data: { amount: parsed } }));
      }
    }
  };

  return (
    <div className="space-y-4">
      {payouts.balance && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Available Balance</Typography>
            <Typography variant="h6" color="primary">₹{payouts.balance.availableBalance.toLocaleString()}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Net Earnings</Typography>
            <Typography variant="h6">₹{payouts.balance.netEarnings.toLocaleString()}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Active Commissions</Typography>
            <Typography variant="h6">₹{payouts.balance.activeCommissions.toLocaleString()}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Button
              variant="contained"
              fullWidth
              disabled={payouts.loading || !payouts.balance || payouts.balance.availableBalance <= 0}
              onClick={handleRequestPayout}
            >
              Request Payout
            </Button>
          </Paper>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 400px)" }}>
        <Table stickyHeader sx={{ minWidth: 700 }} aria-label="payouts table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Requested Date</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="right">Processed Date</StyledTableCell>
              <StyledTableCell align="right">Rejection Reason</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payouts.error && (
              <StyledTableRow>
                <StyledTableCell colSpan={5} align="center" sx={{ color: 'error.main' }}>
                  {payouts.error}
                </StyledTableCell>
              </StyledTableRow>
            )}
            {!payouts.error && payouts.loading && payouts.payouts.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={5} align="center">Loading...</StyledTableCell>
              </StyledTableRow>
            ) : payouts.payouts.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={5} align="center">No payout records found</StyledTableCell>
              </StyledTableRow>
            ) : (
              payouts.payouts.map((payout) => (
                <StyledTableRow key={payout.id}>
                  <StyledTableCell>{new Date(payout.requestedAt).toLocaleDateString()}</StyledTableCell>
                  <StyledTableCell>₹{payout.amount.toLocaleString()}</StyledTableCell>
                  <StyledTableCell>
                    <Chip label={payout.status} color={statusColor[payout.status] || "default"} size="small" />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : "—"}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {payout.rejectionReason || "—"}
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default PayoutsTable;
