import React, { useCallback, useMemo, useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../Redux Toolkit/Store';
import {
  fetchSellerOrders,
  updateOrderStatus,
  assignTracking,
  fetchTransitionRules,
  exportSellerOrders,
  downloadCustomerInvoice,
  downloadSellerInvoice,
  downloadPackingSlip,
  bulkDownloadDocuments,
} from '../../../Redux Toolkit/Seller/sellerOrderSlice';
import { Order, OrderItem } from '../../../types/orderTypes';
import { StyledTableCell, StyledTableRow } from '../../../components/shared/Table';
import OrderStatusChip from './components/OrderStatusChip';
import PaymentChip from './components/PaymentChip';
import AmountDisplay from './components/AmountDisplay';
import FilterBar, { Filters } from './components/FilterBar';
import OrderDetailDrawer from './components/OrderDetailDrawer';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const defaultFilters: Filters = {
  search: '',
  orderStatus: '',
  paymentStatus: '',
  paymentMethod: '',
};

const OrderTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sellerOrder } = useAppSelector((s) => s);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  // Menu state per order
  const [menuAnchor, setMenuAnchor] = useState<Record<string, HTMLElement | null>>({});
  const [docsMenuAnchor, setDocsMenuAnchor] = useState<Record<string, HTMLElement | null>>({});

  // Tracking dialog
  const [trackingDlg, setTrackingDlg] = useState({ open: false, orderId: '', trackingNumber: '', carrier: 'DELHIVERY' });

  // Detail drawer
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);

  const hasFilters = filters.search || filters.orderStatus || filters.paymentStatus || filters.paymentMethod;

  useEffect(() => {
    const jwt = localStorage.getItem('jwt') || '';
    if (!sellerOrder.ordersLoaded) {
      dispatch(fetchSellerOrders(jwt));
    }
    if (!sellerOrder.transitionRules) {
      dispatch(fetchTransitionRules(jwt));
    }
  }, [dispatch, sellerOrder.ordersLoaded, sellerOrder.transitionRules]);

  // Derived filtered + paginated data
  const filteredOrders = useMemo(() => {
    let list = sellerOrder.orders;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderId?.toLowerCase().includes(q) ||
          o.user?.fullName?.toLowerCase().includes(q) ||
          o.shippingAddress?.name?.toLowerCase().includes(q) ||
          o.orderItems?.some((i) => i.product?.title?.toLowerCase().includes(q))
      );
    }
    if (filters.orderStatus) {
      list = list.filter((o) => o.orderStatus === filters.orderStatus);
    }
    if (filters.paymentStatus) {
      list = list.filter((o) => (o.payment?.status || o.paymentStatus) === filters.paymentStatus);
    }
    if (filters.paymentMethod) {
      list = list.filter((o) => o.payment?.method === filters.paymentMethod);
    }
    return list;
  }, [sellerOrder.orders, filters]);

  const paginatedOrders = useMemo(
    () => filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredOrders, page, rowsPerPage]
  );

  const totalCount = filteredOrders.length;

  const handleChangePage = useCallback((_: unknown, newPage: number) => setPage(newPage), []);
  const handleChangeRowsPerPage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const handleMenuOpen = useCallback((e: React.MouseEvent<HTMLElement>, orderId: string) => {
    setMenuAnchor((prev) => ({ ...prev, [orderId]: e.currentTarget }));
  }, []);
  const handleMenuClose = useCallback((orderId: string) => {
    setMenuAnchor((prev) => ({ ...prev, [orderId]: null }));
  }, []);

  const handleUpdateStatus = useCallback(
    (orderId: string, status: string) => {
      dispatch(updateOrderStatus({ jwt: localStorage.getItem('jwt') || '', orderId, orderStatus: status as any }));
      handleMenuClose(orderId);
    },
    [dispatch, handleMenuClose]
  );

  const handleAssignTracking = useCallback(() => {
    if (!trackingDlg.trackingNumber.trim() || !trackingDlg.orderId) return;
    dispatch(
      assignTracking({
        jwt: localStorage.getItem('jwt') || '',
        orderId: trackingDlg.orderId,
        trackingNumber: trackingDlg.trackingNumber.trim(),
        carrier: trackingDlg.carrier,
      })
    );
    setTrackingDlg({ open: false, orderId: '', trackingNumber: '', carrier: 'DELHIVERY' });
  }, [dispatch, trackingDlg]);

  const handleViewOrder = useCallback((o: Order) => setDrawerOrder(o), []);

  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async (format: 'csv' | 'xlsx') => {
    const jwt = localStorage.getItem('jwt') || '';
    setExporting(true);
    try {
      await dispatch(exportSellerOrders({ jwt, format, filters })).unwrap();
    } catch (err: any) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [dispatch, filters]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(0);
  }, []);

  return (
    <>
      <FilterBar filters={filters} onFilterChange={setFilters} onReset={handleResetFilters} onExport={handleExport} onBulkDownload={(documentType) => dispatch(bulkDownloadDocuments({ orderIds: filteredOrders.map((o) => o.id), documentType }))} exporting={exporting} />

      {sellerOrder.loading && paginatedOrders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">Loading orders...</Typography>
        </Box>
      ) : paginatedOrders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">{hasFilters ? 'No orders match the current filters.' : 'No orders yet.'}</Typography>
        </Box>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)' }}>
            <Table stickyHeader sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <StyledTableCell sx={{ fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Order</StyledTableCell>
                  <StyledTableCell sx={{ fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Customer</StyledTableCell>
                  <StyledTableCell sx={{ fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Product</StyledTableCell>
                  <StyledTableCell sx={{ fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Amount</StyledTableCell>
                  <StyledTableCell sx={{ fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Payment</StyledTableCell>
                  <StyledTableCell sx={{ fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Status</StyledTableCell>
                  <StyledTableCell sx={{ fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap' }} align="right">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order: Order) => {
                  const firstItem: OrderItem | undefined = order.orderItems?.[0];
                  const secondItem: OrderItem | undefined = order.orderItems?.[1];
                  const extraCount = (order.orderItems?.length ?? 0) - 1;
                  const netAmount = order.payment?.amount ?? order.totalSellingPrice ?? 0;

                  return (
                    <StyledTableRow key={order.id} hover sx={{ cursor: 'default' }}>
                      {/* Order */}
                      <StyledTableCell sx={{ verticalAlign: 'top' }}>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          {order.orderId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.3 }}>
                          {formatDate(order.orderDate)}
                        </Typography>
                      </StyledTableCell>

                      {/* Customer */}
                      <StyledTableCell sx={{ verticalAlign: 'top' }}>
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                          {order.shippingAddress?.name || order.user?.fullName || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                          {order.shippingAddress?.mobile || order.user?.mobile || ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                          {order.shippingAddress?.city || ''}
                        </Typography>
                      </StyledTableCell>

                      {/* Product */}
                      <StyledTableCell sx={{ verticalAlign: 'top', maxWidth: 220 }}>
                        {firstItem?.product && (
                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                            <Box
                              component="img"
                              src={firstItem.product.images?.[0]?.url || '/logo192.png'}
                              alt=""
                              sx={{ width: 44, height: 44, borderRadius: 1, objectFit: 'cover', border: '1px solid', borderColor: 'divider', flexShrink: 0, bg: '#FAFAFA' }}
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Tooltip title={firstItem.product.title || ''}>
                                <Typography
                                  variant="body2"
                                  fontWeight={500}
                                  sx={{
                                    fontSize: '0.78rem',
                                    lineHeight: 1.3,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {firstItem.product.title}
                                </Typography>
                              </Tooltip>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block', mt: 0.2 }}>
                                {firstItem.variantAttributes
                                  ? Object.entries(firstItem.variantAttributes)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(' | ')
                                  : `Qty: ${firstItem.quantity ?? 1}`}
                              </Typography>
                              <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.7rem', display: 'block', mt: 0.1 }}>
                                Qty: {firstItem.quantity ?? 1}
                              </Typography>
                              {secondItem && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 0.5, display: 'block' }}>
                                  +{extraCount} more item{extraCount > 1 ? 's' : ''}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                      </StyledTableCell>

                      {/* Amount */}
                      <StyledTableCell sx={{ verticalAlign: 'top' }}>
                        <AmountDisplay
                          totalMrpPrice={order.totalMrpPrice}
                          totalSellingPrice={order.totalSellingPrice ?? 0}
                          couponDiscount={order.couponDiscount}
                          netAmount={netAmount !== order.totalSellingPrice ? netAmount : undefined}
                        />
                      </StyledTableCell>

                      {/* Payment */}
                      <StyledTableCell sx={{ verticalAlign: 'top' }}>
                        {order.payment ? (
                          <>
                            <PaymentChip status={order.payment.status} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block', mt: 0.5 }}>
                              {order.payment.method || ''}
                            </Typography>
                            {order.payment.transactionId && (
                              <Tooltip title={order.payment.transactionId}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: '0.62rem', display: 'block', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                  TXN: {order.payment.transactionId}
                                </Typography>
                              </Tooltip>
                            )}
                          </>
                        ) : (
                          <PaymentChip status={order.paymentStatus || 'PENDING'} />
                        )}
                      </StyledTableCell>

                      {/* Order Status */}
                      <StyledTableCell sx={{ verticalAlign: 'top' }}>
                        <OrderStatusChip status={order.orderStatus} />
                        {order.trackingNumber && (
                          <Tooltip title={`${order.carrier || ''}: ${order.trackingNumber}`}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: '0.62rem', display: 'block', mt: 0.5, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {order.trackingNumber}
                            </Typography>
                          </Tooltip>
                        )}
                      </StyledTableCell>

                      {/* Actions */}
                      <StyledTableCell align="right" sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <Tooltip title="View details">
                          <IconButton size="small" onClick={() => handleViewOrder(order)} aria-label={`View order ${order.orderId}`} sx={{ mr: 0.3 }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Download documents">
                          <span>
                            <IconButton
                              size="small"
                              disabled={order.orderStatus !== 'DELIVERED'}
                              onClick={(e) => setDocsMenuAnchor((prev) => ({ ...prev, [order.id]: e.currentTarget }))}
                              aria-label="Download documents"
                              sx={{ mr: 0.3 }}
                            >
                              <FileDownloadOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Menu
                          anchorEl={docsMenuAnchor[order.id]}
                          open={Boolean(docsMenuAnchor[order.id])}
                          onClose={() => setDocsMenuAnchor((prev) => ({ ...prev, [order.id]: null }))}
                          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                          slotProps={{ paper: { sx: { minWidth: 200, borderRadius: 2 } } }}
                        >
                          <MenuItem onClick={() => { setDocsMenuAnchor((prev) => ({ ...prev, [order.id]: null })); dispatch(downloadCustomerInvoice(order.id)); }}>
                            <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Customer Invoice" />
                          </MenuItem>
                          <MenuItem onClick={() => { setDocsMenuAnchor((prev) => ({ ...prev, [order.id]: null })); dispatch(downloadSellerInvoice(order.id)); }}>
                            <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Seller Settlement" />
                          </MenuItem>
                          <MenuItem onClick={() => { setDocsMenuAnchor((prev) => ({ ...prev, [order.id]: null })); dispatch(downloadPackingSlip(order.id)); }}>
                            <ListItemIcon><Inventory2Icon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Packing Slip" />
                          </MenuItem>
                        </Menu>

                        {(() => {
                          const validTransitions = sellerOrder.transitionRules?.[order.orderStatus] ?? [];
                          const showMoreActions = validTransitions.length > 0 || (order.orderStatus === 'PACKED' && !order.trackingNumber);
                          if (!showMoreActions) return null;
                          return (
                            <>
                              <Tooltip title="More actions">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, order.id)}
                                  aria-label={`More actions for ${order.orderId}`}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Menu
                                anchorEl={menuAnchor[order.id]}
                                open={Boolean(menuAnchor[order.id])}
                                onClose={() => handleMenuClose(order.id)}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                slotProps={{ paper: { sx: { minWidth: 180, borderRadius: 2 } } }}
                              >
                                {order.orderStatus === 'PACKED' && !order.trackingNumber && (
                                  <MenuItem
                                    onClick={() => {
                                      handleMenuClose(order.id);
                                      setTrackingDlg({ open: true, orderId: order.id, trackingNumber: '', carrier: 'DELHIVERY' });
                                    }}
                                  >
                                    <ListItemIcon><LocalShippingOutlinedIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText primary="Assign Tracking" />
                                  </MenuItem>
                                )}
                                {validTransitions.map((status) => (
                                  <MenuItem key={status} onClick={() => handleUpdateStatus(order.id, status)}>
                                    <ListItemText
                                      primary={status.replace(/_/g, ' ')}
                                      primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                  </MenuItem>
                                ))}
                              </Menu>
                            </>
                          );
                        })()}
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}

      {/* Tracking Dialog */}
      <Dialog open={trackingDlg.open} onClose={() => setTrackingDlg((p) => ({ ...p, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Assign Shipment Tracking</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Tracking Number"
              value={trackingDlg.trackingNumber}
              onChange={(e) => setTrackingDlg((p) => ({ ...p, trackingNumber: e.target.value }))}
              placeholder="e.g. 1234567890"
              size="small"
            />
            <TextField
              fullWidth
              select
              label="Carrier"
              value={trackingDlg.carrier}
              onChange={(e) => setTrackingDlg((p) => ({ ...p, carrier: e.target.value }))}
              size="small"
              SelectProps={{ native: true }}
            >
              <option value="DELHIVERY">Delhivery</option>
              <option value="BLUE_DART">Blue Dart</option>
              <option value="DTDC">DTDC</option>
              <option value="INDIA_POST">India Post</option>
              <option value="XPRESS_BEES">Xpress Bees</option>
              <option value="EKART">Ekart</option>
              <option value="SHADOWFAX">Shadowfax</option>
              <option value="OTHER">Other</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTrackingDlg((p) => ({ ...p, open: false }))} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAssignTracking} variant="contained" disabled={!trackingDlg.trackingNumber.trim()}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer order={drawerOrder} open={Boolean(drawerOrder)} onClose={() => setDrawerOrder(null)} />
    </>
  );
};

export default OrderTable;
