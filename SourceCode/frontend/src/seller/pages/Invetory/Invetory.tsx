import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchProductAnalytics } from "../../../Redux Toolkit/Seller/sellerDashboardSlice";
import {
  LowStockProduct,
  OutOfStockProduct,
} from "../../../types/sellerDashboardTypes";

const Invetory = () => {
  const dispatch = useAppDispatch();
  const { sellerDashboard } = useAppSelector((store) => store);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!sellerDashboard.products) {
      dispatch(fetchProductAnalytics());
    }
  }, [dispatch, sellerDashboard.products]);

  if (sellerDashboard.loading && !sellerDashboard.products) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!sellerDashboard.products) {
    return (
      <Box py={4}>
        <Alert severity="info">No inventory data available.</Alert>
      </Box>
    );
  }

  const { overview, lowStock, outOfStock } = sellerDashboard.products;

  return (
    <div className="space-y-6">
      <h1 className="font-bold text-xl">Inventory Management</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Products", value: overview.totalProducts, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Active", value: overview.activeProducts, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          { label: "Inactive", value: overview.inactiveProducts, color: "bg-gray-50 text-gray-700 border-gray-200" },
          { label: "Low Stock", value: overview.lowStockProducts, color: "bg-amber-50 text-amber-700 border-amber-200" },
          { label: "Out of Stock", value: overview.outOfStockProducts, color: "bg-rose-50 text-rose-700 border-rose-200" },
        ].map((item) => (
          <div
            key={item.label}
            className={`border rounded-lg p-4 ${item.color}`}
          >
            <p className="text-sm font-medium opacity-80">{item.label}</p>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Low Stock (${lowStock.length})`} />
          <Tab label={`Out of Stock (${outOfStock.length})`} />
        </Tabs>

        {tab === 0 && (
          <TableContainer sx={{ maxHeight: "calc(100vh - 340px)" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Stock</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      No low stock products
                    </TableCell>
                  </TableRow>
                ) : (
                  lowStock.map((item: LowStockProduct) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <p className="font-medium">{item.title}</p>
                      </TableCell>
                      <TableCell align="center">
                        <span className="font-bold text-amber-600">{item.stock}</span>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={item.status || "LOW STOCK"}
                          color="warning"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer sx={{ maxHeight: "calc(100vh - 340px)" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outOfStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      No out of stock products
                    </TableCell>
                  </TableRow>
                ) : (
                  outOfStock.map((item: OutOfStockProduct) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.thumbnail && (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <p className="font-medium">{item.title}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label="OUT OF STOCK" color="error" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </div>
  );
};

export default Invetory;
