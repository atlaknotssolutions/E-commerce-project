import React, { useEffect, useCallback } from 'react';
import { Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchSellerDashboard,
    fetchRevenueAnalytics,
    fetchProductAnalytics,
    fetchOrderAnalytics,
    fetchCustomerAnalytics,
    fetchReturnAnalytics,
    fetchSellerNotifications,
    fetchRecentActivities,
    refreshSellerDashboard,
    clearDashboardError,
} from '../../../Redux Toolkit/Seller/sellerDashboardSlice';
import SummaryCards from './components/SummaryCards';
import RevenueChart from './components/RevenueChart';
import OrdersChart from './components/OrdersChart';
import SalesTrendChart from './components/SalesTrendChart';
import TopProductsCard from './components/TopProductsCard';
import RecentActivitiesCard from './components/RecentActivitiesCard';
import NotificationsCard from './components/NotificationsCard';
import QuickStatsCard from './components/QuickStatsCard';
import EmptyDashboard from './components/EmptyDashboard';
import DashboardSkeleton from './components/DashboardSkeleton';

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const loaded = useAppSelector((state) => state.sellerDashboard.loaded);
    const loading = useAppSelector((state) => state.sellerDashboard.loading);
    const refreshing = useAppSelector((state) => state.sellerDashboard.refreshing);
    const error = useAppSelector((state) => state.sellerDashboard.error);
    const summary = useAppSelector((state) => state.sellerDashboard.summary);

    useEffect(() => {
        if (!loaded) {
            dispatch(fetchSellerDashboard());
            dispatch(fetchRevenueAnalytics('monthly'));
            dispatch(fetchProductAnalytics());
            dispatch(fetchOrderAnalytics());
            dispatch(fetchCustomerAnalytics());
            dispatch(fetchReturnAnalytics());
            dispatch(fetchSellerNotifications());
            dispatch(fetchRecentActivities());
        }
    }, [dispatch, loaded]);

    const handleRefresh = useCallback(() => {
        dispatch(refreshSellerDashboard());
    }, [dispatch]);

    const handleRetry = useCallback(() => {
        dispatch(clearDashboardError());
        dispatch(refreshSellerDashboard());
    }, [dispatch]);

    const handleDismissError = useCallback(() => {
        dispatch(clearDashboardError());
    }, [dispatch]);

    const isInitialLoad = loading && !loaded;

    if (isInitialLoad) {
        return <DashboardSkeleton />;
    }

    if (error && !summary) {
        return (
            <div className="space-y-4" role="alert" aria-live="assertive">
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={handleRetry} aria-label="Retry loading dashboard">
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
                <DashboardSkeleton />
            </div>
        );
    }

    if (!summary) {
        return <EmptyDashboard />;
    }

    return (
        <div className="space-y-6" role="main" aria-label="Seller Dashboard">
            {/* Error Banner */}
            {error && (
                <Alert
                    severity="warning"
                    onClose={handleDismissError}
                    action={
                        <Button color="inherit" size="small" onClick={handleRetry} aria-label="Retry after error">
                            Retry
                        </Button>
                    }
                    role="alert"
                >
                    {error}
                </Alert>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Welcome back! Here's what's happening with your store.
                    </p>
                </div>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={refreshing}
                    size="small"
                    aria-label={refreshing ? 'Refreshing dashboard data' : 'Refresh dashboard data'}
                >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {/* KPI Cards */}
            <section aria-label="Key Performance Indicators">
                <SummaryCards />
            </section>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RevenueChart />
                <OrdersChart />
            </div>

            {/* Second Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <SalesTrendChart />
                </div>
                <QuickStatsCard />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TopProductsCard />
                <RecentActivitiesCard />
                <NotificationsCard />
            </div>
        </div>
    );
};

export default React.memo(Dashboard);
