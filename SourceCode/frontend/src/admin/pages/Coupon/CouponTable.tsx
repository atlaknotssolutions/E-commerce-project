import React, { useEffect, useState, useCallback } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
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
    styled,
    CircularProgress,
    Alert,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    enableCoupon,
    disableCoupon,
    fetchCouponStatistics,
    clearAdminCouponError,
    clearAdminCouponActionSuccess,
} from '../../../Redux Toolkit/Admin/AdminCouponSlice';
import { Coupon } from '../../../types/couponTypes';
import CouponFormDialog from './components/CouponFormDialog';
import CouponDeleteDialog from './components/CouponDeleteDialog';
import CouponToggleDialog from './components/CouponToggleDialog';
import CouponUsageDialog from './components/CouponUsageDialog';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const STATUS_TABS = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
];

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (dateStr?: string | null) =>
{
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const CouponTable: React.FC = () =>
{
    const dispatch = useAppDispatch();
    const { coupons, pagination, loading, error, actionSuccess } = useAppSelector(
        (store) => store.adminCoupon
    );

    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

    // Dialog states
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
    const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
    const [togglingCoupon, setTogglingCoupon] = useState<Coupon | null>(null);
    const [toggleAction, setToggleAction] = useState<'enable' | 'disable'>('enable');
    const [usageDialogOpen, setUsageDialogOpen] = useState(false);
    const [usageCoupon, setUsageCoupon] = useState<Coupon | null>(null);

    // Action menu
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuCoupon, setMenuCoupon] = useState<Coupon | null>(null);

    const fetchPage = useCallback((p: number, limit: number, search: string, isActive: string) =>
    {
        dispatch(fetchCoupons({
            page: p + 1,
            limit,
            search: search || undefined,
            isActive: isActive || undefined,
        }));
    }, [dispatch]);

    useEffect(() =>
    {
        dispatch(fetchCouponStatistics());
    }, [dispatch]);

    useEffect(() =>
    {
        const timer = setTimeout(() => setSearchDebounce(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() =>
    {
        fetchPage(page, rowsPerPage, searchDebounce, STATUS_TABS[activeTab].value);
    }, [fetchPage, page, rowsPerPage, searchDebounce, activeTab]);

    useEffect(() =>
    {
        if (actionSuccess)
        {
            dispatch(fetchCouponStatistics());
            fetchPage(page, rowsPerPage, searchDebounce, STATUS_TABS[activeTab].value);
            dispatch(clearAdminCouponActionSuccess());
        }
    }, [actionSuccess, dispatch, fetchPage, page, rowsPerPage, searchDebounce, activeTab]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) =>
    {
        setActiveTab(newValue);
        setPage(0);
        setSearchTerm('');
        setSearchDebounce('');
    };

    const handleOpenCreate = useCallback(() =>
    {
        setEditingCoupon(null);
        setFormDialogOpen(true);
    }, []);

    const handleOpenEdit = useCallback((coupon: Coupon) =>
    {
        setAnchorEl(null);
        setEditingCoupon(coupon);
        setFormDialogOpen(true);
    }, []);

    const handleFormConfirm = useCallback((couponData: any) =>
    {
        if (editingCoupon)
        {
            dispatch(updateCoupon({ id: editingCoupon._id, coupon: couponData }));
        }
        else
        {
            dispatch(createCoupon({ coupon: couponData }));
        }
        setFormDialogOpen(false);
        setEditingCoupon(null);
    }, [dispatch, editingCoupon]);

    const handleOpenDelete = useCallback((coupon: Coupon) =>
    {
        setAnchorEl(null);
        setDeletingCoupon(coupon);
        setDeleteDialogOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(() =>
    {
        if (deletingCoupon)
        {
            dispatch(deleteCoupon({ id: deletingCoupon._id }));
        }
        setDeleteDialogOpen(false);
        setDeletingCoupon(null);
    }, [dispatch, deletingCoupon]);

    const handleOpenToggle = useCallback((coupon: Coupon, action: 'enable' | 'disable') =>
    {
        setAnchorEl(null);
        setTogglingCoupon(coupon);
        setToggleAction(action);
        setToggleDialogOpen(true);
    }, []);

    const handleToggleConfirm = useCallback(() =>
    {
        if (togglingCoupon)
        {
            if (toggleAction === 'enable')
            {
                dispatch(enableCoupon({ id: togglingCoupon._id }));
            }
            else
            {
                dispatch(disableCoupon({ id: togglingCoupon._id }));
            }
        }
        setToggleDialogOpen(false);
        setTogglingCoupon(null);
    }, [dispatch, togglingCoupon, toggleAction]);

    const handleOpenUsage = useCallback((coupon: Coupon) =>
    {
        setAnchorEl(null);
        setUsageCoupon(coupon);
        setUsageDialogOpen(true);
    }, []);

    const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, coupon: Coupon) =>
    {
        setAnchorEl(event.currentTarget);
        setMenuCoupon(coupon);
    }, []);

    const handleMenuClose = useCallback(() =>
    {
        setAnchorEl(null);
        setMenuCoupon(null);
    }, []);

    return (
        <>
            {/* Status Tabs */}
            <Box className="mb-4 flex items-center justify-between">
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
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenCreate}
                >
                    Create Coupon
                </Button>
            </Box>

            {/* Search Bar */}
            <Box className="mb-4">
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by coupon code or description..."
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
                    onClose={() => dispatch(clearAdminCouponError())}
                >
                    {error}
                </Alert>
            )}

            {/* Data Table */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 1000 }} aria-label="admin coupon table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Code</StyledTableCell>
                            <StyledTableCell>Description</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Discount</StyledTableCell>
                            <StyledTableCell>Min Order</StyledTableCell>
                            <StyledTableCell>Max Discount</StyledTableCell>
                            <StyledTableCell>Usage</StyledTableCell>
                            <StyledTableCell>Valid Until</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && coupons.length === 0 ? (
                            <TableRow>
                                <StyledTableCell colSpan={10} align="center" sx={{ py: 6 }}>
                                    <CircularProgress />
                                </StyledTableCell>
                            </TableRow>
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <StyledTableCell colSpan={10} align="center" sx={{ py: 6 }}>
                                    No coupons found.
                                </StyledTableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => (
                                <StyledTableRow key={coupon._id}>
                                    <StyledTableCell>
                                        <div className="font-medium text-sm">{coupon.code}</div>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <div className="text-sm max-w-[200px] truncate">
                                            {coupon.description || '—'}
                                        </div>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            size="small"
                                            label={coupon.discountType === 'PERCENTAGE' ? '%' : 'Flat'}
                                            color={coupon.discountType === 'PERCENTAGE' ? 'primary' : 'secondary'}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {coupon.discountType === 'PERCENTAGE'
                                            ? `${coupon.discountPercentage}%`
                                            : formatCurrency(coupon.discountValue)}
                                    </StyledTableCell>
                                    <StyledTableCell>{formatCurrency(coupon.minimumOrderValue)}</StyledTableCell>
                                    <StyledTableCell>
                                        {coupon.maximumDiscount > 0 ? formatCurrency(coupon.maximumDiscount) : '—'}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {coupon.usageLimit > 0
                                            ? `${coupon.usageCount}/${coupon.usageLimit}`
                                            : coupon.usageCount}
                                    </StyledTableCell>
                                    <StyledTableCell>{formatDate(coupon.validityEndDate)}</StyledTableCell>
                                    <StyledTableCell>
                                        {new Date(coupon.validityEndDate) < new Date() ? (
                                            <Chip size="small" label="Expired" color="warning" />
                                        ) : coupon.isActive ? (
                                            <Chip size="small" label="Active" color="success" />
                                        ) : (
                                            <Chip size="small" label="Disabled" color="error" />
                                        )}
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, coupon)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
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

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => menuCoupon && handleOpenEdit(menuCoupon)}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => menuCoupon && handleOpenUsage(menuCoupon)}>
                    <ListItemIcon><BarChartIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View Usage</ListItemText>
                </MenuItem>
                {menuCoupon?.isActive ? (
                    <MenuItem onClick={() => menuCoupon && handleOpenToggle(menuCoupon, 'disable')}>
                        <ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Disable</ListItemText>
                    </MenuItem>
                ) : (
                    <MenuItem onClick={() => menuCoupon && handleOpenToggle(menuCoupon, 'enable')}>
                        <ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Enable</ListItemText>
                    </MenuItem>
                )}
                <MenuItem onClick={() => menuCoupon && handleOpenDelete(menuCoupon)}>
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            {/* Dialogs */}
            <CouponFormDialog
                open={formDialogOpen}
                onClose={() => { setFormDialogOpen(false); setEditingCoupon(null); }}
                onConfirm={handleFormConfirm}
                coupon={editingCoupon}
                loading={loading}
            />

            <CouponDeleteDialog
                open={deleteDialogOpen}
                onClose={() => { setDeleteDialogOpen(false); setDeletingCoupon(null); }}
                onConfirm={handleDeleteConfirm}
                couponCode={deletingCoupon?.code || ''}
                loading={loading}
            />

            <CouponToggleDialog
                open={toggleDialogOpen}
                onClose={() => { setToggleDialogOpen(false); setTogglingCoupon(null); }}
                onConfirm={handleToggleConfirm}
                couponCode={togglingCoupon?.code || ''}
                action={toggleAction}
                loading={loading}
            />

            <CouponUsageDialog
                open={usageDialogOpen}
                onClose={() => { setUsageDialogOpen(false); setUsageCoupon(null); }}
                couponId={usageCoupon?._id || null}
                couponCode={usageCoupon?.code || ''}
            />
        </>
    );
};

export default React.memo(CouponTable);
