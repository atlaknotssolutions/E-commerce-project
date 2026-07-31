import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Container, Typography, Box, Paper, TextField, MenuItem, Button,
    Grid, Card, CardContent, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchSellerCommissions,
    fetchSellerCommissionStats,
    clearSellerCommissionError,
} from '../../../Redux Toolkit/Seller/sellerCommissionSlice';
import CommissionTable from './components/CommissionTable';
import CommissionDetailsDialog from './components/CommissionDetailsDialog';
import { Commission } from '../../../types/adminCommissionTypes';

const SellerCommissions: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        commissions, statistics, pagination, error,
    } = useAppSelector((store) => store.sellerCommission);

    const [filters, setFilters] = useState({ status: '', search: '', page: 1, limit: 20 });
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [viewCommission, setViewCommission] = useState<Commission | null>(null);

    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    useEffect(() => {
        dispatch(fetchSellerCommissions(filtersRef.current));
        dispatch(fetchSellerCommissionStats());
    }, [dispatch, filters.page, filters.limit]);

    const handleFilterChange = useCallback((field: string, value: any) => {
        setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
    }, []);

    const handleApplyFilters = useCallback(() => {
        dispatch(fetchSellerCommissions({ ...filters, page: 1 }));
    }, [dispatch, filters]);

    const handleView = useCallback((commission: Commission) => {
        setViewCommission(commission);
        setDetailsOpen(true);
    }, []);

    return (
        <Container maxWidth="lg">
            <Box mb={3}>
                <Typography variant="h4" fontWeight={700}>My Commissions</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    View commissions earned on your delivered orders.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearSellerCommissionError())}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'Total Orders', value: statistics?.totalCommissions ?? 0 },
                    { label: 'Total Order Value', value: `₹${(statistics?.totalOrderAmount ?? 0).toLocaleString()}` },
                    { label: 'Platform Commission', value: `₹${(statistics?.totalCommissionAmount ?? 0).toLocaleString()}` },
                    { label: 'Total GST', value: `₹${(statistics?.totalGstAmount ?? 0).toLocaleString()}` },
                    { label: 'You Receive', value: `₹${(statistics?.totalSellerAmount ?? 0).toLocaleString()}` },
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

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth size="small" label="Search Order ID"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
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
                    <Grid item xs={12} sm={3}>
                        <Button variant="outlined" onClick={handleApplyFilters}>Apply Filters</Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Table */}
            <CommissionTable
                commissions={commissions}
                pagination={pagination}
                onView={handleView}
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

export default SellerCommissions;
