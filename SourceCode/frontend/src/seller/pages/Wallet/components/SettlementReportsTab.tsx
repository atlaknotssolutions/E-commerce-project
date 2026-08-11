import React, { useEffect, useState } from "react";
import {
  Box, Paper, Table, TableBody, TableContainer, TableHead, TableRow,
  Chip, Typography, Grid, Card, CardContent, Alert, CircularProgress,
  TablePagination,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { fetchSellerSettlements, fetchSellerSettlementStats } from "../../../../Redux Toolkit/Seller/walletSlice";
import { StyledTableCell, StyledTableRow, EmptyRow } from "../../../../components/shared/Table";
import { SellerSettlement } from "../../../../types/walletTypes";

const statusColor: Record<string, "warning" | "success" | "error" | "info" | "default"> = {
  PENDING: "warning",
  PROCESSING: "info",
  COMPLETED: "success",
  FAILED: "error",
  REVERSED: "default",
};

const SettlementReportsTab = () => {
  const dispatch = useAppDispatch();
  const { wallet } = useAppSelector((store) => store);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const requestKey = `${page + 1}:${rowsPerPage}`;

  useEffect(() => {
    if (!wallet.settlementStatsLoaded) dispatch(fetchSellerSettlementStats());
    if (wallet.settlementRequestKey === requestKey) return;
    dispatch(fetchSellerSettlements({ page: page + 1, limit: rowsPerPage }));
  }, [dispatch, wallet.settlementRequestKey, wallet.settlementStatsLoaded, page, rowsPerPage, requestKey]);

  const stats = wallet.settlementStats;

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (wallet.settlementLoading && wallet.settlements.length === 0) {
    return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
  }

  if (wallet.settlementError) {
    return <Alert severity="error">{wallet.settlementError}</Alert>;
  }

  return (
    <Box>
      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">Total Settlements</Typography>
                <Typography variant="h6" fontWeight={700}>{stats.totalSettlements}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">Total Amount</Typography>
                <Typography variant="h6" fontWeight={700}>₹{stats.totalAmount.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">Completed</Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">{stats.totalCompleted}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">Pending</Typography>
                <Typography variant="h6" fontWeight={700} color="warning.main">{stats.totalPending}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Table */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>Settlement Records</Typography>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 420px)" }}>
        <Table stickyHeader sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>UTR</StyledTableCell>
              <StyledTableCell>Reference</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wallet.settlements.length === 0 ? (
              <EmptyRow colSpan={6} message="No settlement records found." />
            ) : (
              wallet.settlements.map((settlement: SellerSettlement) => (
                <StyledTableRow key={settlement._id} hover>
                  <StyledTableCell>
                    {new Date(settlement.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </StyledTableCell>
                  <StyledTableCell>
                    <Chip label={settlement.type} size="small" color={settlement.type === "PAYOUT" ? "primary" : "default"} />
                  </StyledTableCell>
                  <StyledTableCell sx={{ fontWeight: 600 }}>
                    ₹{settlement.amount.toLocaleString()}
                  </StyledTableCell>
                  <StyledTableCell>
                    <Chip label={settlement.status} color={statusColor[settlement.status] || "default"} size="small" />
                  </StyledTableCell>
                  <StyledTableCell>{settlement.utr || "—"}</StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="caption" color="text.secondary">
                      {settlement.referenceId || "—"}
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={wallet.pagination?.total ?? 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[20, 50, 100]}
      />
    </Box>
  );
};

export default SettlementReportsTab;
