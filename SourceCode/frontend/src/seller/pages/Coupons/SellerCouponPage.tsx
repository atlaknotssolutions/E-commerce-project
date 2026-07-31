import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableContainer, TableHead,
    TableRow, TablePagination, Chip, Alert, TextField, InputAdornment,
    IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchSellerCoupons,
    createSellerCoupon,
    updateSellerCoupon,
    deleteSellerCoupon,
    enableSellerCoupon,
    disableSellerCoupon,
    clearError,
    clearActionSuccess,
} from '../../../Redux Toolkit/Seller/sellerCouponSlice';
import { Coupon } from '../../../types/couponTypes';
import SellerCouponFormDialog from './components/SellerCouponFormDialog';
import CouponDeleteDialog from '../../../admin/pages/Coupon/components/CouponDeleteDialog';
import CouponToggleDialog from '../../../admin/pages/Coupon/components/CouponToggleDialog';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (dateStr?: string | null) =>
{
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
};

const SellerCouponPage: React.FC = () =>
{
    const dispatch = useAppDispatch();
    const { coupons, pagination, loading, error, actionSuccess } = useAppSelector(
        (store) => store.sellerCoupon
    );

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
    const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
    const [togglingCoupon, setTogglingCoupon] = useState<Coupon | null>(null);
    const [toggleAction, setToggleAction] = useState<'enable' | 'disable'>('enable');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuCoupon, setMenuCoupon] = useState<Coupon | null>(null);

    const fetchPage = useCallback((p: number, limit: number, search: string) =>
    {
        dispatch(fetchSellerCoupons({
            page: p + 1,
            limit,
            search: search || undefined,
        }));
    }, [dispatch]);

    useEffect(() =>
    {
        const timer = setTimeout(() => setSearchDebounce(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() =>
    {
        fetchPage(page, rowsPerPage, searchDebounce);
    }, [fetchPage, page, rowsPerPage, searchDebounce]);

    useEffect(() =>
    {
        if (actionSuccess)
        {
            fetchPage(page, rowsPerPage, searchDebounce);
            dispatch(clearActionSuccess());
        }
    }, [actionSuccess, dispatch, fetchPage, page, rowsPerPage, searchDebounce]);

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
            dispatch(updateSellerCoupon({ id: editingCoupon._id, coupon: couponData }));
        }
        else
        {
            dispatch(createSellerCoupon({ coupon: couponData }));
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
            dispatch(deleteSellerCoupon({ id: deletingCoupon._id }));
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
                dispatch(enableSellerCoupon({ id: togglingCoupon._id }));
            }
            else
            {
                dispatch(disableSellerCoupon({ id: togglingCoupon._id }));
            }
        }
        setToggleDialogOpen(false);
        setTogglingCoupon(null);
    }, [dispatch, togglingCoupon, toggleAction]);

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
        <Box>
            <Box className="flex justify-between items-center mb-3">
                <Box>
                    <Typography variant="h4" fontWeight={700}>My Coupons</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create and manage promotional coupons for your store.
                    </Typography>
                </Box>
                <Button variant="contained" color="primary" onClick={handleOpenCreate}>
                    Create Coupon
                </Button>
            </Box>

            {error && (
                <Alert severity="error" className="mb-4" onClose={() => dispatch(clearError())}>
                    {error}
                </Alert>
            )}

            <Box className="mb-4">
                <TextField
                    size="small"
                    placeholder="Search by code or name..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                    }}
                    sx={{ maxWidth: 400 }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 900 }}>
                    <TableHead>
                        <TableRow>
                            <Box component="th" sx={{ p: 2, fontWeight: 600, fontSize: '0.875rem' }}>Code</Box>
                            <Box component="th" sx={{ p: 2, fontWeight: 600, fontSize: '0.875rem' }}>Type</Box>
                            <Box component="th" sx={{ p: 2, fontWeight: 600, fontSize: '0.875rem' }}>Discount</Box>
                            <Box component="th" sx={{ p: 2, fontWeight: 600, fontSize: '0.875rem' }}>Scope</Box>
                            <Box component="th" sx={{ p: 2, fontWeight: 600, fontSize: '0.875rem' }}>Target</Box>
                            <Box component="th" sx={{ p: 2, fontWeight: 600, fontSize: '0.875rem' }}>Stackable</Box>
                            <Box component="th" sx={{ p: 2, fontWeight: 600, fontSize: '0.875rem' }}>Usage</Box>
                            <Box component="th" sx={{ p: 2, fontWeight: 600, fontSize: '0.875rem' }}>Valid Until</Box>
                            <Box component="th" sx={{ p: 2, fontWeight: 600, fontSize: '0.875rem' }}>Status</Box>
                            <Box component="th" sx={{ p: 2, fontWeight: 600, fontSize: '0.875rem' }}>Actions</Box>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && coupons.length === 0 ? (
                            <TableRow>
                                <Box component="td" colSpan={10} sx={{ p: 4, textAlign: 'center' }}>
                                    loading...
                                </Box>
                            </TableRow>
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <Box component="td" colSpan={10} sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                    No coupons found for your store.
                                </Box>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => (
                                <TableRow key={coupon._id} hover>
                                    <Box component="td" sx={{ p: 2 }}>
                                        <Typography fontWeight={600} fontSize="0.875rem">{coupon.code}</Typography>
                                    </Box>
                                    <Box component="td" sx={{ p: 2 }}>
                                        <Chip size="small" label={coupon.discountType === 'PERCENTAGE' ? '%' : 'Flat'}
                                            color={coupon.discountType === 'PERCENTAGE' ? 'primary' : 'secondary'} />
                                    </Box>
                                    <Box component="td" sx={{ p: 2, fontSize: '0.875rem' }}>
                                        {coupon.discountType === 'PERCENTAGE'
                                            ? `${coupon.discountPercentage}%`
                                            : formatCurrency(coupon.discountValue)}
                                        {coupon.maximumDiscount > 0 && ` (cap: ${formatCurrency(coupon.maximumDiscount)})`}
                                    </Box>
                                    <Box component="td" sx={{ p: 2 }}>
                                        <Chip size="small" label={coupon.scope?.replace(/_/g, ' ')} variant="outlined" color="info" />
                                    </Box>
                                    <Box component="td" sx={{ p: 2 }}>
                                        <Chip size="small" label={coupon.targetType?.replace(/_/g, ' ') || 'ALL'} variant="outlined" />
                                    </Box>
                                    <Box component="td" sx={{ p: 2 }}>
                                        <Chip size="small" label={coupon.stackable ? 'Yes' : 'No'}
                                            color={coupon.stackable ? 'primary' : 'default'} variant="outlined" />
                                    </Box>
                                    <Box component="td" sx={{ p: 2, fontSize: '0.875rem' }}>
                                        {coupon.usageLimit > 0
                                            ? `${coupon.usageCount}/${coupon.usageLimit}`
                                            : coupon.usageCount}
                                    </Box>
                                    <Box component="td" sx={{ p: 2, fontSize: '0.875rem' }}>
                                        {formatDate(coupon.validityEndDate)}
                                    </Box>
                                    <Box component="td" sx={{ p: 2 }}>
                                        {new Date(coupon.validityEndDate) < new Date() ? (
                                            <Chip size="small" label="Expired" color="warning" />
                                        ) : coupon.isActive ? (
                                            <Chip size="small" label="Active" color="success" />
                                        ) : (
                                            <Chip size="small" label="Disabled" color="error" />
                                        )}
                                    </Box>
                                    <Box component="td" sx={{ p: 2 }}>
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, coupon)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>
                                </TableRow>
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
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[10, 20, 50]}
                    />
                )}
            </TableContainer>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => menuCoupon && handleOpenEdit(menuCoupon)}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit</ListItemText>
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

            <SellerCouponFormDialog
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
        </Box>
    );
};

export default React.memo(SellerCouponPage);
