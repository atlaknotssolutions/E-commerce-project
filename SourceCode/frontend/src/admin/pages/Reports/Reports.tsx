import React, { useEffect, useState, useCallback } from 'react';
import {
    Alert,
    Button,
    Tabs,
    Tab,
    Box,
    TextField,
    MenuItem,
    CircularProgress,
    Skeleton,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchDashboardSummary,
    fetchSalesReport,
    fetchRevenueReport,
    fetchProductReport,
    fetchSellerReport,
    fetchCustomerReport,
    fetchOrderReport,
    fetchReturnReport,
    fetchCouponReport,
    clearAdminReportsError,
} from '../../../Redux Toolkit/Admin/adminReportsSlice';
import { ReportFilters, ReportTab } from '../../../types/adminReportsTypes';
import ReportsDashboard from './components/ReportsDashboard';
import {
    SalesTrendChart,
    RevenueTrendChart,
    OrderStatusChart,
    ReturnReasonChart,
    CouponUsageChart,
    TopProductsChart,
    TopSellersChart,
} from './components/ReportsCharts';
import {
    BestSellingProductsTable,
    TopSellersTable,
    LowStockTable,
    CouponTable,
    ReturnStatusTable,
    TopReturnedProductsTable,
} from './components/ReportsTable';
import ExportButtons from './components/ExportButtons';

const Reports: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        dashboard,
        sales,
        revenue,
        products,
        sellers,
        customers,
        orders,
        returns,
        coupons,
        loading,
        error,
        loaded,
    } = useAppSelector((store) => store.adminReports);

    const [activeTab, setActiveTab] = useState<ReportTab>('dashboard');
    const [filters, setFilters] = useState<ReportFilters>({
        startDate: null,
        endDate: null,
        groupBy: 'daily',
    });

    const fetchReportData = useCallback(
        (tab: ReportTab) => {
            const baseFilters = {
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
            };

            switch (tab) {
                case 'dashboard':
                    dispatch(fetchDashboardSummary());
                    break;
                case 'sales':
                    dispatch(fetchSalesReport(filters));
                    break;
                case 'revenue':
                    dispatch(fetchRevenueReport(filters));
                    break;
                case 'products':
                    dispatch(fetchProductReport(baseFilters));
                    break;
                case 'sellers':
                    dispatch(fetchSellerReport(baseFilters));
                    break;
                case 'customers':
                    dispatch(fetchCustomerReport(baseFilters));
                    break;
                case 'orders':
                    dispatch(fetchOrderReport(baseFilters));
                    break;
                case 'returns':
                    dispatch(fetchReturnReport(baseFilters));
                    break;
                case 'coupons':
                    dispatch(fetchCouponReport(baseFilters));
                    break;
            }
        },
        [dispatch, filters]
    );

    useEffect(() => {
        if (!loaded) {
            fetchReportData('dashboard');
        }
    }, [loaded, fetchReportData]);

    const handleTabChange = useCallback(
        (_: React.SyntheticEvent, newValue: ReportTab) => {
            setActiveTab(newValue);
            fetchReportData(newValue);
        },
        [fetchReportData]
    );

    const handleRetry = useCallback(() => {
        dispatch(clearAdminReportsError());
        fetchReportData(activeTab);
    }, [dispatch, fetchReportData, activeTab]);

    const handleFilterChange = useCallback(
        (field: keyof ReportFilters, value: string | null) => {
            setFilters((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const handleApplyFilters = useCallback(() => {
        fetchReportData(activeTab);
    }, [fetchReportData, activeTab]);

    const renderContent = () => {
        if (loading) {
            return (
                <Box className="space-y-4">
                    <Skeleton variant="rectangular" height={120} />
                    <Skeleton variant="rectangular" height={300} />
                    <Skeleton variant="rectangular" height={300} />
                </Box>
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return <ReportsDashboard dashboard={dashboard} />;
            case 'sales':
                return (
                    <Box className="space-y-4">
                        <SalesTrendChart data={sales} />
                    </Box>
                );
            case 'revenue':
                return (
                    <Box className="space-y-4">
                        {revenue && (
                            <>
                                <RevenueTrendChart data={revenue.trend} />
                                <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Gross Revenue:</strong> ₹{revenue.summary.grossRevenue.toLocaleString('en-IN')}
                                    </Box>
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Net Revenue:</strong> ₹{revenue.summary.netRevenue.toLocaleString('en-IN')}
                                    </Box>
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Total Refunds:</strong> ₹{revenue.summary.totalRefunds.toLocaleString('en-IN')}
                                    </Box>
                                </Box>
                            </>
                        )}
                    </Box>
                );
            case 'products':
                return (
                    <Box className="space-y-4">
                        {products && (
                            <>
                                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Out of Stock:</strong> {products.outOfStock} products
                                    </Box>
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Low Stock:</strong> {products.lowStock.length} products
                                    </Box>
                                </Box>
                                <TopProductsChart data={products.bestSelling} />
                                <BestSellingProductsTable data={products.bestSelling} />
                                <LowStockTable data={products.lowStock} />
                            </>
                        )}
                    </Box>
                );
            case 'sellers':
                return (
                    <Box className="space-y-4">
                        {sellers && (
                            <>
                                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                    <strong>Total Active Sellers:</strong> {sellers.sellerCount}
                                </Box>
                                <TopSellersChart data={sellers.topSellers} />
                                <TopSellersTable data={sellers.topSellers} />
                            </>
                        )}
                    </Box>
                );
            case 'customers':
                return (
                    <Box className="space-y-4">
                        {customers && (
                            <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                                    <strong>Total Customers</strong>
                                    <Box sx={{ fontSize: 24, fontWeight: 700, mt: 1 }}>{customers.totalCustomers}</Box>
                                </Box>
                                <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                                    <strong>New Customers</strong>
                                    <Box sx={{ fontSize: 24, fontWeight: 700, mt: 1 }}>{customers.newCustomers}</Box>
                                </Box>
                                <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                                    <strong>Active Customers</strong>
                                    <Box sx={{ fontSize: 24, fontWeight: 700, mt: 1 }}>{customers.activeCustomers}</Box>
                                </Box>
                                <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                                    <strong>Returning Customers</strong>
                                    <Box sx={{ fontSize: 24, fontWeight: 700, mt: 1 }}>{customers.returningCustomers}</Box>
                                </Box>
                            </Box>
                        )}
                    </Box>
                );
            case 'orders':
                return (
                    <Box className="space-y-4">
                        {orders && (
                            <>
                                <OrderStatusChart data={orders.byStatus} />
                                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Total Orders:</strong> {orders.totalOrders}
                                    </Box>
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Payment Methods:</strong>{' '}
                                        {orders.byPaymentMethod.map((p) => `${p._id} (${p.count})`).join(', ')}
                                    </Box>
                                </Box>
                            </>
                        )}
                    </Box>
                );
            case 'returns':
                return (
                    <Box className="space-y-4">
                        {returns && (
                            <>
                                <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Total Returns:</strong> {returns.totalReturns}
                                    </Box>
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Return Rate:</strong> {returns.returnRate}%
                                    </Box>
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Total Refund:</strong> ₹{returns.totalRefundAmount.toLocaleString('en-IN')}
                                    </Box>
                                </Box>
                                <ReturnReasonChart data={returns.byReason} />
                                <ReturnStatusTable data={returns.byStatus} />
                                <TopReturnedProductsTable data={returns.topReturnedProducts} />
                            </>
                        )}
                    </Box>
                );
            case 'coupons':
                return (
                    <Box className="space-y-4">
                        {coupons && (
                            <>
                                <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Total Coupons:</strong> {coupons.summary.totalCoupons}
                                    </Box>
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Coupons Used:</strong> {coupons.summary.totalCouponsUsed}
                                    </Box>
                                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <strong>Success Rate:</strong> {coupons.summary.successRate}%
                                    </Box>
                                </Box>
                                <CouponUsageChart data={coupons.usageStats} />
                                <CouponTable data={coupons.usageStats} />
                            </>
                        )}
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6" role="main" aria-label="Reports & Analytics">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Reports & Analytics
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Platform insights, trends, and downloadable reports.
                    </p>
                </div>
                <ExportButtons filters={filters} activeTab={activeTab} />
            </div>

            {error && (
                <Alert
                    severity="error"
                    onClose={() => dispatch(clearAdminReportsError())}
                    action={
                        <Button color="inherit" size="small" onClick={handleRetry}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Dashboard" value="dashboard" />
                    <Tab label="Sales" value="sales" />
                    <Tab label="Revenue" value="revenue" />
                    <Tab label="Products" value="products" />
                    <Tab label="Sellers" value="sellers" />
                    <Tab label="Customers" value="customers" />
                    <Tab label="Orders" value="orders" />
                    <Tab label="Returns" value="returns" />
                    <Tab label="Coupons" value="coupons" />
                </Tabs>
            </Box>

            {activeTab !== 'dashboard' && (
                <Box className="flex flex-wrap gap-3 items-end">
                    <TextField
                        label="Start Date"
                        type="date"
                        size="small"
                        value={filters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        size="small"
                        value={filters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                        InputLabelProps={{ shrink: true }}
                    />
                    {(activeTab === 'sales' || activeTab === 'revenue') && (
                        <TextField
                            label="Group By"
                            size="small"
                            select
                            value={filters.groupBy}
                            onChange={(e) =>
                                handleFilterChange(
                                    'groupBy',
                                    e.target.value as ReportFilters['groupBy']
                                )
                            }
                        >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="yearly">Yearly</MenuItem>
                        </TextField>
                    )}
                    <Button variant="contained" onClick={handleApplyFilters} disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : 'Apply'}
                    </Button>
                </Box>
            )}

            <section aria-label="Report Content">
                {renderContent()}
            </section>
        </div>
    );
};

export default React.memo(Reports);
