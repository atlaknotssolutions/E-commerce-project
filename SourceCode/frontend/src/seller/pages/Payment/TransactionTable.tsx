import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchTransactionsBySeller } from "../../../Redux Toolkit/Seller/transactionSlice";
import { Transaction } from "../../../types/Transaction";
import { redableDateTime } from "../../../util/redableDateTime";

const statusColor: Record<
  string,
  "success" | "warning" | "error" | "info" | "default"
> = {
  PLACED: "info",
  CONFIRMED: "success",
  SHIPPED: "warning",
  DELIVERED: "success",
  CANCELLED: "error",
};

const TransactionTable = () => {
  const dispatch = useAppDispatch();

  const { transaction } = useAppSelector((store) => store);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (transaction.sellerTransactionsLoaded) return;
    dispatch(fetchTransactionsBySeller(localStorage.getItem("jwt") || ""));
  }, [dispatch, transaction.sellerTransactionsLoaded]);

  const handleChangePage = (
    event: unknown,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTransactions = transaction.transactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (transaction.loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        py={6}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (transaction.error) {
    return (
      <Alert severity="error">
        {transaction.error}
      </Alert>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 1100 }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Transaction</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Order</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={6}
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((item: Transaction) => (
                <TableRow key={item.id} hover>
                  {/* Date */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {redableDateTime(item.date).split("at")[0]}
                      </p>

                      <p className="text-xs text-gray-500">
                        {redableDateTime(item.date).split("at")[1]}
                      </p>
                    </div>
                  </TableCell>

                  {/* Transaction ID */}
                  <TableCell>
                    <Chip
                      color="primary"
                      size="small"
                      label={`TXN-${item.id.slice(-8).toUpperCase()}`}
                    />
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {item.customer?.fullName
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </Avatar>

                      <div>
                        <p className="font-semibold">
                          {item.customer?.fullName}
                        </p>

                        <p className="text-sm text-gray-600">
                          {item.customer?.email}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item.customer?.mobile}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Order */}
                  <TableCell>
                    <div className="space-y-2">
                      <Chip
                        variant="outlined"
                        size="small"
                        label={`#${item.order?.orderId}`}
                      />

                      <div className="text-xs text-gray-500">
                        Order Transaction
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={item.order?.orderStatus}
                      color={
                        statusColor[item.order?.orderStatus] ??
                        "default"
                      }
                    />
                  </TableCell>

                  {/* Amount */}
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 600,
                      color: "success.main",
                    }}
                  >
                    ₹
                    {item.order?.totalSellingPrice?.toLocaleString(
                      "en-IN"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={transaction.transactions.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </>
  );
};

export default TransactionTable;


// import React, { useEffect } from "react";
// import {
//   Alert,
//   Box,
//   Chip,
//   CircularProgress,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
// } from "@mui/material";

// import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
// import { fetchTransactionsBySeller } from "../../../Redux Toolkit/Seller/transactionSlice";
// import { Transaction } from "../../../types/Transaction";
// import { redableDateTime } from "../../../util/redableDateTime";

// const statusColor: Record<
//   string,
//   "success" | "warning" | "error" | "info" | "default"
// > = {
//   PLACED: "info",
//   CONFIRMED: "success",
//   SHIPPED: "warning",
//   DELIVERED: "success",
//   CANCELLED: "error",
// };

// const TransactionTable = () => {
//   const dispatch = useAppDispatch();

//   const { transaction } = useAppSelector((store) => store);

//   useEffect(() => {
//     dispatch(fetchTransactionsBySeller(localStorage.getItem("jwt") || ""));
//   }, [dispatch]);

//   if (transaction.loading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         py={5}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (transaction.error) {
//     return (
//       <Alert severity="error">
//         {transaction.error}
//       </Alert>
//     );
//   }

//   return (
//     <TableContainer component={Paper}>
//       <Table sx={{ minWidth: 850 }}>
//         <TableHead>
//           <TableRow>
//             <TableCell>Date</TableCell>
//             <TableCell>Customer</TableCell>
//             <TableCell>Order</TableCell>
//             <TableCell>Status</TableCell>
//             <TableCell align="right">Amount</TableCell>
//           </TableRow>
//         </TableHead>

//         <TableBody>
//           {transaction.transactions.length === 0 ? (
//             <TableRow>
//               <TableCell
//                 align="center"
//                 colSpan={5}
//               >
//                 No transactions found.
//               </TableCell>
//             </TableRow>
//           ) : (
//             transaction.transactions.map((item: Transaction) => (
//               <TableRow key={item.id}>
//                 <TableCell>
//                   <div className="space-y-1">
//                     <div className="font-medium">
//                       {redableDateTime(item.date).split("at")[0]}
//                     </div>

//                     <div className="text-xs text-gray-500">
//                       {redableDateTime(item.date).split("at")[1]}
//                     </div>
//                   </div>
//                 </TableCell>

//                 <TableCell>
//                   <div className="space-y-1">
//                     <div className="font-medium">
//                       {item.customer?.fullName}
//                     </div>

//                     <div className="text-sm text-gray-600">
//                       {item.customer?.email}
//                     </div>

//                     <div className="text-sm text-gray-500">
//                       {item.customer?.mobile}
//                     </div>
//                   </div>
//                 </TableCell>

//                 <TableCell>
//                   <div className="space-y-1">
//                     <div className="font-semibold">
//                       {item.order?.orderId}
//                     </div>

//                     <div className="text-xs text-gray-500">
//                       Order Transaction
//                     </div>
//                   </div>
//                 </TableCell>

//                 <TableCell>
//                   <Chip
//                     label={item.order?.orderStatus}
//                     size="small"
//                     color={
//                       statusColor[item.order?.orderStatus] ?? "default"
//                     }
//                   />
//                 </TableCell>

//                 <TableCell align="right">
//                   ₹
//                   {item.order?.totalSellingPrice?.toLocaleString("en-IN")}
//                 </TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// export default TransactionTable;