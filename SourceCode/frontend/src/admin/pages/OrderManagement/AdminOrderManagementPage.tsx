import React, { useEffect, useCallback } from 'react';
import { Alert, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchAdminOrderStats,
    clearAdminOrderError,
} from '../../../Redux Toolkit/Admin/adminOrderSlice';
import OrderStatsCards from './components/OrderStatsCards';
import OrderTable from './components/OrderTable';

const AdminOrderManagementPage: React.FC = () =>
{
    const dispatch = useAppDispatch();
    const { error, stats } = useAppSelector(
        (store) => store.adminOrder
    );

    useEffect(() =>
    {
        dispatch(fetchAdminOrderStats());
    }, [dispatch]);

    const handleRetry = useCallback(() =>
    {
        dispatch(clearAdminOrderError());
        dispatch(fetchAdminOrderStats());
    }, [dispatch]);

    const handleDismissError = useCallback(() =>
    {
        dispatch(clearAdminOrderError());
    }, [dispatch]);

    return (
        <div className="space-y-6" role="main" aria-label="Order Management">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Order Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View, search, filter, and manage all marketplace orders.
                    </p>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <Alert
                    severity="error"
                    onClose={handleDismissError}
                    action={
                        <Button color="inherit" size="small" onClick={handleRetry}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {/* Statistics Cards */}
            <section aria-label="Order Statistics">
                <OrderStatsCards stats={stats} />
            </section>

            {/* Order Table */}
            <section aria-label="Order Table">
                <OrderTable />
            </section>
        </div>
    );
};

export default React.memo(AdminOrderManagementPage);
