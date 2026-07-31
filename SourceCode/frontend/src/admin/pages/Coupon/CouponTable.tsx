import React, { useEffect, useState, useCallback } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
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
import { StyledTableCell, StyledTableRow, LoadingRow, EmptyRow } from '../../../components/shared/Table';

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
            <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 290px)" }}>
                <Table stickyHeader sx={{ minWidth: 1000 }} aria-label="admin coupon table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Code</StyledTableCell>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Owner</StyledTableCell>
                            <StyledTableCell>Discount</StyledTableCell>
                            <StyledTableCell>Scope</StyledTableCell>
                            <StyledTableCell>Target</StyledTableCell>
                            <StyledTableCell>Priority</StyledTableCell>
                            <StyledTableCell>Stackable</StyledTableCell>
                            <StyledTableCell>Usage</StyledTableCell>
                            <StyledTableCell>Valid Until</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && coupons.length === 0 ? (<LoadingRow colSpan={13} />) :
                         coupons.length === 0 ? (<EmptyRow colSpan={13} message="No coupons found." />) : (
                            coupons.map((coupon) => (
                                <StyledTableRow key={coupon._id}>
                                    <StyledTableCell>
                                        <div className="font-medium text-sm">{coupon.code}</div>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <div className="text-sm max-w-[150px] truncate">
                                            {coupon.name || coupon.code || '—'}
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
                                        <Chip
                                            size="small"
                                            label={coupon.ownerType === 'SELLER' ? 'Seller' : 'Platform'}
                                            color={coupon.ownerType === 'SELLER' ? 'warning' : 'default'}
                                            variant="outlined"
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {coupon.discountType === 'PERCENTAGE'
                                            ? `${coupon.discountPercentage}%`
                                            : formatCurrency(coupon.discountValue)}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            size="small"
                                            label={coupon.scope?.replace(/_/g, ' ')}
                                            color={coupon.scope === 'ALL' || coupon.scope === 'ORDER' ? 'success' : 'info'}
                                            variant="outlined"
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            size="small"
                                            label={coupon.targetType?.replace(/_/g, ' ') || 'ALL'}
                                            color="default"
                                            variant="outlined"
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <span className="text-sm">{coupon.priority ?? 0}</span>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            size="small"
                                            label={coupon.stackable ? 'Yes' : 'No'}
                                            color={coupon.stackable ? 'primary' : 'default'}
                                            variant="outlined"
                                        />
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
