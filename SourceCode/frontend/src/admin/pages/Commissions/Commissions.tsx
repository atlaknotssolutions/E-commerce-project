import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Container, Typography, Box, Paper, TextField, MenuItem, Button,
    Grid, Card, CardContent, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchAllCommissions,
    fetchCommissionStatistics,
    calculateCommission,
    approveCommission,
    settleCommission,
    cancelCommission,
    clearAdminCommissionError,
    clearAdminCommissionActionSuccess,
} from '../../../Redux Toolkit/Admin/adminCommissionSlice';
import { CommissionFilters as CommissionFiltersType } from '../../../types/adminCommissionTypes';
import CommissionTable from './components/CommissionTable';
import CommissionDetailsDialog from './components/CommissionDetailsDialog';
import { Commission } from '../../../types/adminCommissionTypes';
import { notification } from '../../../services/notificationService';

const AdminCommissions: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        commissions, statistics, pagination,
        loading, error, actionSuccess,
    } = useAppSelector((store) => store.adminCommission);

    const [filters, setFilters] = useState<CommissionFiltersType>({
        status: '',
        search: '',
        startDate: null,
        endDate: null,
        page: 1,
        limit: 20,
    });
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [viewCommission, setViewCommission] = useState<Commission | null>(null);
    const [orderIdInput, setOrderIdInput] = useState('');

    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    useEffect(() => {
        dispatch(fetchAllCommissions(filtersRef.current));
        dispatch(fetchCommissionStatistics());
    }, [dispatch, filters.page, filters.limit]);

    useEffect(() => {
        if (actionSuccess) {
            dispatch(fetchAllCommissions(filters));
            dispatch(fetchCommissionStatistics());
            dispatch(clearAdminCommissionActionSuccess());
        }
    }, [actionSuccess, dispatch, filters]);

    const handleFilterChange = useCallback((field: keyof CommissionFiltersType, value: any) => {
        setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
    }, []);

    const handleApplyFilters = useCallback(() => {
        dispatch(fetchAllCommissions({ ...filters, page: 1 }));
    }, [dispatch, filters]);

    const handleView = useCallback((commission: Commission) => {
        setViewCommission(commission);
        setDetailsOpen(true);
    }, []);

    const handleCalculate = useCallback(() => {
        if (!orderIdInput.trim()) return;
        dispatch(calculateCommission(orderIdInput.trim()))
            .unwrap()
            .then(() => {
                notification.success('Commission calculated successfully');
                setOrderIdInput('');
            })
            .catch((err: any) => {
                notification.error(err || 'Failed to calculate commission');
            });
    }, [dispatch, orderIdInput]);

    const handleApprove = useCallback((commission: Commission) => {
        dispatch(approveCommission(commission.id || (commission as any)._id))
            .unwrap()
            .then(() => {
                notification.success('Commission approved successfully');
            })
            .catch((err: any) => {
                notification.error(err || 'Failed to approve commission');
            });
    }, [dispatch]);

    const handleSettle = useCallback((commission: Commission) => {
        dispatch(settleCommission(commission.id || (commission as any)._id))
            .unwrap()
            .then(() => {
                notification.success('Commission settled successfully');
            })
            .catch((err: any) => {
                notification.error(err || 'Failed to settle commission');
            });
    }, [dispatch]);

    const handleCancel = useCallback((commission: Commission) => {
        dispatch(cancelCommission(commission.id || (commission as any)._id))
            .unwrap()
            .then(() => {
                notification.success('Commission cancelled successfully');
            })
            .catch((err: any) => {
                notification.error(err || 'Failed to cancel commission');
            });
    }, [dispatch]);

    return (
        <Container maxWidth="lg">
            <Box mb={3}>
                <Typography variant="h4" fontWeight={700}>Commission Management</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    View and manage platform commissions calculated on delivered orders.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminCommissionError())}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'Total Commissions', value: statistics?.totalCommissions ?? 0 },
                    { label: 'Total Order Value', value: `₹${(statistics?.totalOrderAmount ?? 0).toLocaleString()}` },
                    { label: 'Total Commission', value: `₹${(statistics?.totalCommissionAmount ?? 0).toLocaleString()}` },
                    { label: 'Total GST', value: `₹${(statistics?.totalGstAmount ?? 0).toLocaleString()}` },
                    { label: 'Total Seller Payout', value: `₹${(statistics?.totalSellerAmount ?? 0).toLocaleString()}` },
                ].map((stat, i) => (
                    <Grid item xs={12} sm={6} md={2.4} key={i}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                <Typography variant="h6" fontWeight={700} mt={0.5}>{stat.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Manual Calculate */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" mb={1}>Manual Commission Calculation</Typography>
                <Box display="flex" gap={1}>
                    <TextField
                        size="small"
                        placeholder="Enter Order ID (e.g. ORD_ABC12345)"
                        value={orderIdInput}
                        onChange={(e) => setOrderIdInput(e.target.value)}
                        sx={{ minWidth: 300 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleCalculate}
                        disabled={!orderIdInput.trim() || loading}
                    >
                        Calculate
                    </Button>
                </Box>
            </Paper>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth size="small" label="Search Order ID"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            fullWidth size="small" select label="Status"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="CALCULATED">Calculated</MenuItem>
                            <MenuItem value="APPROVED">Approved</MenuItem>
                            <MenuItem value="SETTLED">Settled</MenuItem>
                            <MenuItem value="CANCELLED">Cancelled</MenuItem>
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
            <CommissionTable
                commissions={commissions}
                pagination={pagination}
                onView={handleView}
                onApprove={handleApprove}
                onSettle={handleSettle}
                onCancel={handleCancel}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                onRowsPerPageChange={(limit) => setFilters((prev) => ({ ...prev, limit, page: 1 }))}
            />

            <CommissionDetailsDialog
                open={detailsOpen}
                commission={viewCommission}
                onClose={() => setDetailsOpen(false)}
            />

        </Container>
    );
};

export default AdminCommissions;
