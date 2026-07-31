import React, { useEffect, useState } from "react";
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, Alert, CircularProgress, Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { fetchSellerLedger } from "../../../../Redux Toolkit/Seller/walletSlice";
import { StyledTableCell, StyledTableRow, EmptyRow } from "../../../../components/shared/Table";
import { LedgerEntry } from "../../../../types/walletTypes";

const ledgerTypeLabels: Record<string, string> = {
  ORDER_PLACED: "Sale Credit",
  COMMISSION_CALCULATED: "Commission Deduction",
  SETTLEMENT_COMPLETED: "Settlement",
  PAYOUT_INITIATED: "Settlement",
  PAYOUT_COMPLETED: "Settlement",
  REFUND_PROCESSED: "Refund Adjustment",
  CANCELLATION: "Refund Adjustment",
  ADJUSTMENT: "Manual Adjustment",
};

const TransactionsTab = () => {
  const dispatch = useAppDispatch();
  const { wallet } = useAppSelector((store) => store);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    dispatch(fetchSellerLedger({ page: page + 1, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (wallet.ledgerLoading && wallet.ledgerEntries.length === 0) {
    return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
  }

  if (wallet.ledgerError) {
    return <Alert severity="error">{wallet.ledgerError}</Alert>;
  }

  return (
    <Box>
      <TableContainer component={Paper} elevation={2} sx={{ maxHeight: "calc(100vh - 280px)" }}>
        <Table stickyHeader sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Reference</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell align="right">Credit</StyledTableCell>
              <StyledTableCell align="right">Debit</StyledTableCell>
              <StyledTableCell align="right">Running Balance</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wallet.ledgerEntries.length === 0 ? (
              <EmptyRow colSpan={7} message="No ledger entries found." />
            ) : (
              wallet.ledgerEntries.map((entry: LedgerEntry) => (
                <StyledTableRow key={entry._id} hover>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip color="primary" size="small" label={entry.order?.orderId ? `#${entry.order.orderId}` : entry.referenceId || "—"} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{ledgerTypeLabels[entry.type] || entry.type}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ color: "success.main", fontWeight: 600 }}>
                    {entry.direction === "CREDIT" ? `₹${entry.amount.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "error.main", fontWeight: 600 }}>
                    {entry.direction === "DEBIT" ? `₹${entry.amount.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    ₹{entry.runningBalance?.toLocaleString() ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={entry.direction === "CREDIT" ? "Completed" : "Processed"}
                      color={entry.direction === "CREDIT" ? "success" : "info"}
                    />
                  </TableCell>
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

export default TransactionsTab;
