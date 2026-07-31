import React, { useEffect, useState } from "react";
import {
  Box, Paper, Table, TableBody, TableContainer, TableHead, TableRow,
  Chip, Button, Typography, Grid, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress,
} from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LockIcon from '@mui/icons-material/Lock';
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import {
  fetchPayoutsBySeller, fetchPayoutBalance, requestPayout,
} from "../../../../Redux Toolkit/Seller/payoutSlice";
import { StyledTableCell, StyledTableRow } from "../../../../components/shared/Table";
const statusColor: Record<string, "warning" | "success" | "error" | "info" | "default"> = {
  PENDING: "warning",
  APPROVED: "info",
  REJECTED: "error",
  COMPLETED: "success",
};

const PayoutsTab = () => {
  const dispatch = useAppDispatch();
  const { payouts } = useAppSelector((store) => store);
  const jwt = localStorage.getItem("jwt") || "";
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!payouts.payoutsLoaded) dispatch(fetchPayoutsBySeller(jwt));
    dispatch(fetchPayoutBalance(jwt));
  }, [dispatch, payouts.payoutsLoaded, jwt]);

  useEffect(() => {
    if (snackbar) {
      const timer = setTimeout(() => setSnackbar(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  const handleOpenRequest = () => {
    setWithdrawAmount("");
    setRequestDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;
    setRequesting(true);
    const result = await dispatch(requestPayout({ jwt, data: { amount } }));
    setRequesting(false);
    setRequestDialogOpen(false);
    if (requestPayout.fulfilled.match(result)) {
      setSnackbar({ message: "Payout requested successfully", severity: "success" });
      dispatch(fetchPayoutBalance(jwt));
    } else {
      setSnackbar({ message: (result.payload as string) || "Failed to request payout", severity: "error" });
    }
  };

  const balance = payouts.balance;

  return (
    <Box>
      {/* Balance Cards */}
      {balance && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AccountBalanceIcon color="primary" />
                  <Typography variant="caption" color="text.secondary">Available Balance</Typography>
                </Box>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  ₹{balance.availableBalance.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <TrendingUpIcon color="success" />
                  <Typography variant="caption" color="text.secondary">Net Earnings</Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  ₹{balance.netEarnings.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LockIcon color="warning" />
                  <Typography variant="caption" color="text.secondary">Active Commissions</Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  ₹{balance.activeCommissions.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardContent>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={balance.availableBalance <= 0}
                  onClick={handleOpenRequest}
                >
                  Request Payout
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                  Min: ₹1
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Previous Requests */}
      <Typography variant="h6" fontWeight={600} mb={2}>Payout History</Typography>
      <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 500px)" }}>
        <Table stickyHeader sx={{ minWidth: 700 }}>
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
            {payouts.loading && payouts.payouts.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={5} align="center"><CircularProgress size={24} /></StyledTableCell>
              </StyledTableRow>
            ) : payouts.payouts.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={5} align="center">No payout records found</StyledTableCell>
              </StyledTableRow>
            ) : (
              payouts.payouts.map((payout) => (
                <StyledTableRow key={payout.id}>
                  <StyledTableCell>{new Date(payout.requestedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</StyledTableCell>
                  <StyledTableCell sx={{ fontWeight: 600 }}>₹{payout.amount.toLocaleString()}</StyledTableCell>
                  <StyledTableCell>
                    <Chip label={payout.status} color={statusColor[payout.status] || "default"} size="small" />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
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

      {snackbar && (
        <Alert severity={snackbar.severity} sx={{ mb: 2 }} onClose={() => setSnackbar(null)}>
          {snackbar.message}
        </Alert>
      )}

      {/* Request Payout Dialog */}
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Request Payout</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Available Balance: <strong>₹{balance?.availableBalance?.toLocaleString() ?? 0}</strong>
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Amount (₹)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            inputProps={{ min: 1, max: balance?.availableBalance || 0 }}
            helperText={`Enter amount between ₹1 and ₹${balance?.availableBalance?.toLocaleString() ?? 0}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitRequest}
            disabled={requesting || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (balance?.availableBalance || 0)}
          >
            {requesting ? "Requesting..." : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayoutsTab;
