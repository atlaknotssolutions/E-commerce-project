import React, { useEffect, useState, useCallback } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
    Button,
    Chip,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Box,
    TablePagination,
    CircularProgress,
    Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useAppDispatch, useAppSelector } from '../../../../Redux Toolkit/Store';
import {
    fetchAdminOrders,
    fetchAdminOrderDetails,
    updateAdminOrderStatus,
    fetchAdminOrderStats,
    clearAdminOrderError,
    clearAdminOrderActionSuccess,
    clearSelectedOrder,
} from '../../../../Redux Toolkit/Admin/adminOrderSlice';
import { AdminOrder } from '../../../../types/adminOrderTypes';
import { StyledTableCell, StyledTableRow, LoadingRow, EmptyRow } from '../../../../components/shared/Table';
import OrderDetailDialog from './OrderDetailDialog';
import UpdateStatusDialog from './UpdateStatusDialog';

const STATUS_TABS = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Placed', value: 'PLACED' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Packed', value: 'PACKED' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
];

const getOrderChipColor = (status: string): 'warning' | 'success' | 'error' | 'info' | 'default' =>
{
    switch (status)
    {
        case 'PENDING': return 'warning';
        case 'PLACED': return 'info';
        case 'CONFIRMED': return 'success';
        case 'PACKED': return 'info';
        case 'SHIPPED': return 'info';
        case 'OUT_FOR_DELIVERY': return 'info';
        case 'DELIVERED': return 'success';
        case 'CANCELLED': return 'error';
        default: return 'default';
    }
};

const getPaymentChipColor = (status: string): 'success' | 'error' | 'warning' | 'default' =>
{
    switch (status)
    {
        case 'COMPLETED': return 'success';
        case 'FAILED': return 'error';
        case 'PENDING': return 'warning';
        default: return 'default';
    }
};

const formatDate = (dateStr?: string | null) =>
{
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const OrderTable: React.FC = () =>
{
    const dispatch = useAppDispatch();
    const {
        orders,
        selectedOrder,
        pagination,
        loading,
        error,
        actionSuccess,
    } = useAppSelector((store) => store.adminOrder);

    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

    // Dialog states
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusUpdateOrder, setStatusUpdateOrder] = useState<AdminOrder | null>(null);

    const fetchOrders = useCallback((p: number, limit: number, search: string, orderStatus: string) =>
    {
        dispatch(fetchAdminOrders({
            page: p + 1,
            limit,
            search: search || undefined,
            orderStatus: orderStatus || undefined,
        }));
    }, [dispatch]);

    useEffect(() =>
    {
        const timer = setTimeout(() => setSearchDebounce(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() =>
    {
        fetchOrders(page, rowsPerPage, searchDebounce, STATUS_TABS[activeTab].value);
    }, [fetchOrders, page, rowsPerPage, searchDebounce, activeTab]);

    useEffect(() =>
    {
        if (actionSuccess)
        {
            dispatch(fetchAdminOrderStats());
            fetchOrders(page, rowsPerPage, searchDebounce, STATUS_TABS[activeTab].value);
            dispatch(clearAdminOrderActionSuccess());
        }
    }, [actionSuccess, dispatch, fetchOrders, page, rowsPerPage, searchDebounce, activeTab]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) =>
    {
        setActiveTab(newValue);
        setPage(0);
        setSearchTerm('');
        setSearchDebounce('');
    };

    const handleViewDetails = useCallback((order: AdminOrder) =>
    {
        dispatch(fetchAdminOrderDetails(order._id));
        setDetailDialogOpen(true);
    }, [dispatch]);

    const handleDetailDialogClose = useCallback(() =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedOrder());
    }, [dispatch]);

    const handleUpdateStatusFromDetail = useCallback((order: AdminOrder) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedOrder());
        setStatusUpdateOrder(order);
        setStatusDialogOpen(true);
    }, [dispatch]);

    const handleUpdateStatusFromTable = useCallback((order: AdminOrder) =>
    {
        setStatusUpdateOrder(order);
        setStatusDialogOpen(true);
    }, []);

    const handleStatusDialogClose = useCallback(() =>
    {
        setStatusDialogOpen(false);
        setStatusUpdateOrder(null);
    }, []);

    const handleStatusConfirm = useCallback((orderStatus: string, adminNote: string) =>
    {
        if (statusUpdateOrder)
        {
            dispatch(updateAdminOrderStatus({
                orderId: statusUpdateOrder._id,
                orderStatus,
                adminNote,
            }));
        }
        setStatusDialogOpen(false);
        setStatusUpdateOrder(null);
    }, [dispatch, statusUpdateOrder]);

    return (
        <>
            {/* Status Tabs */}
            <Box className="mb-4">
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {STATUS_TABS.map((tab) => (
                        <Tab key={tab.value || 'all'} label={tab.label} />
                    ))}
                </Tabs>
            </Box>

            {/* Search Bar */}
            <Box className="mb-4">
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by order ID, customer name, email, or seller name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ maxWidth: 500 }}
                />
            </Box>

            {/* Error Banner */}
            {error && (
                <Alert
                    severity="error"
                    className="mb-4"
                    onClose={() => dispatch(clearAdminOrderError())}
                >
                    {error}
                </Alert>
            )}

            {/* Data Table */}
            <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 290px)" }}>
                <Table sx={{ minWidth: 1100 }} aria-label="admin order table" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Order ID</StyledTableCell>
                            <StyledTableCell>Customer</StyledTableCell>
                            <StyledTableCell>Seller</StyledTableCell>
                            <StyledTableCell>Items</StyledTableCell>
                            <StyledTableCell align="right">Amount</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell>Payment</StyledTableCell>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && orders.length === 0 ? (
                            <LoadingRow colSpan={9} />
                        ) : orders.length === 0 ? (
                            <EmptyRow colSpan={9} message="No orders found." />
                        ) : (
                            orders.map((order) => (
                                <StyledTableRow key={order._id}>
                                    <StyledTableCell>
                                        <div className="font-medium text-sm">{order.orderId}</div>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <div className="text-sm">{order.user?.fullName || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{order.user?.email || ''}</div>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <div className="text-sm">
                                            {order.seller?.businessDetails?.businessName || order.seller?.sellerName || 'N/A'}
                                        </div>
                                    </StyledTableCell>
                                    <StyledTableCell>{order.totalItem}</StyledTableCell>
                                    <StyledTableCell align="right">
                                        {formatCurrency(order.totalSellingPrice)}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            size="small"
                                            label={order.orderStatus.replace(/_/g, ' ')}
                                            color={getOrderChipColor(order.orderStatus)}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            size="small"
                                            label={order.paymentStatus}
                                            color={getPaymentChipColor(order.paymentStatus)}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>{formatDate(order.orderDate || order.createdAt)}</StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Box className="flex items-center justify-end gap-1">
                                            <Button
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewDetails(order)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleUpdateStatusFromTable(order)}
                                                disabled={order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED'}
                                            >
                                                Update
                                            </Button>
                                        </Box>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {pagination && (
                    <TablePagination
                        component="div"
                        count={pagination.total}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) =>
                        {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                    />
                )}
            </TableContainer>

            {/* Order Detail Dialog */}
            <OrderDetailDialog
                open={detailDialogOpen}
                onClose={handleDetailDialogClose}
                order={selectedOrder}
                onUpdateStatus={handleUpdateStatusFromDetail}
            />

            {/* Update Status Dialog */}
            <UpdateStatusDialog
                open={statusDialogOpen}
                onClose={handleStatusDialogClose}
                onConfirm={handleStatusConfirm}
                currentStatus={statusUpdateOrder?.orderStatus || ''}
                orderId={statusUpdateOrder?.orderId || ''}
                loading={loading}
            />
        </>
    );
};

export default React.memo(OrderTable);
