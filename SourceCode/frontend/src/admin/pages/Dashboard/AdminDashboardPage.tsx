import React, { useEffect, useCallback } from 'react';
import { Alert, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchAdminDashboard,
    clearAdminDashboardError,
} from '../../../Redux Toolkit/Admin/adminDashboardSlice';
import DashboardHeader from './components/DashboardHeader';
import SummaryCards from './components/SummaryCards';
import EmptyDashboard from './components/EmptyDashboard';
import DashboardSkeleton from './components/DashboardSkeleton';

const AdminDashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const loaded = useAppSelector((state) => state.adminDashboard.loaded);
    const loading = useAppSelector((state) => state.adminDashboard.loading);
    const error = useAppSelector((state) => state.adminDashboard.error);
    const analytics = useAppSelector((state) => state.adminDashboard.analytics);
    const lastUpdated = useAppSelector((state) => state.adminDashboard.lastUpdated);

    useEffect(() => {
        if (!loaded) {
            dispatch(fetchAdminDashboard());
        }
    }, [dispatch, loaded]);

    const handleRefresh = useCallback(() => {
        dispatch(fetchAdminDashboard());
    }, [dispatch]);

    const handleRetry = useCallback(() => {
        dispatch(clearAdminDashboardError());
        dispatch(fetchAdminDashboard());
    }, [dispatch]);

    const handleDismissError = useCallback(() => {
        dispatch(clearAdminDashboardError());
    }, [dispatch]);

    const isInitialLoad = loading && !loaded;

    if (isInitialLoad) {
        return <DashboardSkeleton />;
    }

    if (error && !analytics) {
        return (
            <div className="space-y-4" role="alert" aria-live="assertive">
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={handleRetry} aria-label="Retry loading admin dashboard">
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

    if (!analytics) {
        return <EmptyDashboard />;
    }

    return (
        <div className="space-y-6" role="main" aria-label="Admin Dashboard">
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
            <DashboardHeader
                title="Admin Dashboard"
                subtitle="Welcome back! Here's what's happening across the platform."
                lastUpdated={lastUpdated}
                onRefresh={handleRefresh}
            />

            {/* Analytics Cards */}
            <section aria-label="Platform Analytics">
                <SummaryCards />
            </section>
        </div>
    );
};

export default React.memo(AdminDashboardPage);
