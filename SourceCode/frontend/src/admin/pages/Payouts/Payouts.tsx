import React, { useEffect, useState, useCallback } from 'react';
import {
    Container, Typography, Box, Paper, TextField, MenuItem, Button,
    Grid, Card, CardContent, Snackbar, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchAllPayouts,
    fetchPayoutStatistics,
    approvePayoutAdmin,
    rejectPayoutAdmin,
    markPayoutPaidAdmin,
    clearAdminPayoutError,
    clearAdminPayoutActionSuccess,
} from '../../../Redux Toolkit/Admin/adminPayoutSlice';
import { AdminPayoutFilters as PayoutFiltersType, AdminPayout } from '../../../types/adminPayoutTypes';
import PayoutTable from './components/PayoutTable';
import PayoutDetailDialog from './components/PayoutDetailDialog';
import ConfirmActionDialog from './components/ConfirmActionDialog';

const AdminPayouts: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        payouts, statistics, pagination,
        loading, error, actionSuccess,
    } = useAppSelector((store) => store.adminPayout);

    const [filters, setFilters] = useState<PayoutFiltersType>({
        status: '',
        startDate: null,
        endDate: null,
        page: 1,
        limit: 20,
    });
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [viewPayout, setViewPayout] = useState<AdminPayout | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'pay'>('approve');
    const [confirmTarget, setConfirmTarget] = useState<AdminPayout | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });

    useEffect(() => {
        dispatch(fetchAllPayouts(filters));
        dispatch(fetchPayoutStatistics());
    }, [dispatch, filters.page, filters.limit]);

    useEffect(() => {
        if (actionSuccess) {
            dispatch(fetchAllPayouts(filters));
            dispatch(fetchPayoutStatistics());
            dispatch(clearAdminPayoutActionSuccess());
        }
    }, [actionSuccess, dispatch, filters]);

    const handleFilterChange = useCallback((field: keyof PayoutFiltersType, value: any) => {
        setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
    }, []);

    const handleApplyFilters = useCallback(() => {
        dispatch(fetchAllPayouts({ ...filters, page: 1 }));
    }, [dispatch, filters]);

    const handleView = useCallback((payout: AdminPayout) => {
        setViewPayout(payout);
        setDetailsOpen(true);
    }, []);

    const openConfirm = useCallback((action: 'approve' | 'reject' | 'pay', payout: AdminPayout) => {
        setConfirmAction(action);
        setConfirmTarget(payout);
        setRejectReason('');
        setConfirmOpen(true);
    }, []);

    const handleConfirmAction = useCallback(() => {
        if (!confirmTarget) return;
        const id = confirmTarget.id;

        if (confirmAction === 'approve') {
            dispatch(approvePayoutAdmin(id))
                .unwrap()
                .then(() => {
                    setSnackbar({ open: true, message: 'Payout approved successfully', severity: 'success' });
                    setConfirmOpen(false);
                })
                .catch((err: any) => {
                    setSnackbar({ open: true, message: err || 'Failed to approve payout', severity: 'error' });
                });
        } else if (confirmAction === 'reject') {
            dispatch(rejectPayoutAdmin({ id, reason: rejectReason }))
                .unwrap()
                .then(() => {
                    setSnackbar({ open: true, message: 'Payout rejected successfully', severity: 'success' });
                    setConfirmOpen(false);
                })
                .catch((err: any) => {
                    setSnackbar({ open: true, message: err || 'Failed to reject payout', severity: 'error' });
                });
        } else if (confirmAction === 'pay') {
            dispatch(markPayoutPaidAdmin(id))
                .unwrap()
                .then(() => {
                    setSnackbar({ open: true, message: 'Payout marked as paid', severity: 'success' });
                    setConfirmOpen(false);
                })
                .catch((err: any) => {
                    setSnackbar({ open: true, message: err || 'Failed to mark payout as paid', severity: 'error' });
                });
        }
    }, [dispatch, confirmAction, confirmTarget, rejectReason]);

    const getConfirmTitle = () => {
        switch (confirmAction) {
            case 'approve': return 'Approve Payout';
            case 'reject': return 'Reject Payout';
            case 'pay': return 'Mark as Paid';
        }
    };

    const getConfirmMessage = () => {
        if (!confirmTarget) return '';
        switch (confirmAction) {
            case 'approve':
                return `Are you sure you want to approve the payout of ₹${confirmTarget.amount.toLocaleString()} for ${confirmTarget.seller?.companyName || confirmTarget.seller?.email || 'this seller'}?`;
            case 'reject':
                return `Are you sure you want to reject the payout of ₹${confirmTarget.amount.toLocaleString()} for ${confirmTarget.seller?.companyName || confirmTarget.seller?.email || 'this seller'}?`;
            case 'pay':
                return `Confirm that ₹${confirmTarget.amount.toLocaleString()} has been paid to ${confirmTarget.seller?.companyName || confirmTarget.seller?.email || 'this seller'}. This action cannot be undone.`;
        }
    };

    return (
        <Container maxWidth="lg">
            <Box mb={3}>
                <Typography variant="h4" fontWeight={700}>Payout Management</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Review and manage seller payout requests.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminPayoutError())}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'Total Requests', value: statistics?.totalPayouts ?? 0, color: 'text.primary' },
                    { label: 'Total Amount', value: `₹${(statistics?.totalAmount ?? 0).toLocaleString()}`, color: 'text.primary' },
                    { label: 'Pending', value: `₹${(statistics?.totalPending ?? 0).toLocaleString()}`, color: 'warning.main' },
                    { label: 'Approved', value: `₹${(statistics?.totalApproved ?? 0).toLocaleString()}`, color: 'info.main' },
                    { label: 'Completed', value: `₹${(statistics?.totalCompleted ?? 0).toLocaleString()}`, color: 'success.main' },
                    { label: 'Rejected', value: `₹${(statistics?.totalRejected ?? 0).toLocaleString()}`, color: 'error.main' },
                ].map((stat, i) => (
                    <Grid item xs={12} sm={6} md={2} key={i}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                <Typography variant="h6" fontWeight={700} mt={0.5} color={stat.color as any}>{stat.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                        <TextField
                            fullWidth size="small" select label="Status"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="APPROVED">Approved</MenuItem>
                            <MenuItem value="REJECTED">Rejected</MenuItem>
                            <MenuItem value="COMPLETED">Completed</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            fullWidth size="small" type="date" label="Start Date"
                            value={filters.startDate || ''}
                            onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            fullWidth size="small" type="date" label="End Date"
                            value={filters.endDate || ''}
                            onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button variant="outlined" onClick={handleApplyFilters}>
                            Apply Filters
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Table */}
            <PayoutTable
                payouts={payouts}
                pagination={pagination}
                loading={loading}
                onView={handleView}
                onApprove={(p) => openConfirm('approve', p)}
                onReject={(p) => openConfirm('reject', p)}
                onMarkPaid={(p) => openConfirm('pay', p)}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                onRowsPerPageChange={(limit) => setFilters((prev) => ({ ...prev, limit, page: 1 }))}
            />

            {/* Detail Dialog */}
            <PayoutDetailDialog
                open={detailsOpen}
                payout={viewPayout}
                onClose={() => setDetailsOpen(false)}
            />

            {/* Confirm Action Dialog */}
            <ConfirmActionDialog
                open={confirmOpen}
                title={getConfirmTitle()}
                message={getConfirmMessage()}
                actionLabel={confirmAction === 'approve' ? 'Approve' : confirmAction === 'reject' ? 'Reject' : 'Mark Paid'}
                actionColor={confirmAction === 'reject' ? 'error' : confirmAction === 'approve' ? 'success' : 'primary'}
                requireReason={confirmAction === 'reject'}
                reason={rejectReason}
                onReasonChange={setRejectReason}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmOpen(false)}
                loading={loading}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminPayouts;
