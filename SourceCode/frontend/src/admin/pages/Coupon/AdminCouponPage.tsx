import React, { useEffect, useCallback } from 'react';
import { Alert, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchCouponStatistics,
    clearAdminCouponError,
} from '../../../Redux Toolkit/Admin/AdminCouponSlice';
import CouponStatsCards from './components/CouponStatsCards';
import CouponTable from './CouponTable';

const AdminCouponPage: React.FC = () =>
{
    const dispatch = useAppDispatch();
    const { error, statistics } = useAppSelector(
        (store) => store.adminCoupon
    );

    useEffect(() =>
    {
        dispatch(fetchCouponStatistics());
    }, [dispatch]);

    const handleRetry = useCallback(() =>
    {
        dispatch(clearAdminCouponError());
        dispatch(fetchCouponStatistics());
    }, [dispatch]);

    const handleDismissError = useCallback(() =>
    {
        dispatch(clearAdminCouponError());
    }, [dispatch]);

    return (
        <div className="space-y-6" role="main" aria-label="Coupon Management">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Coupon & Promotion Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Create, manage, and track promotional coupons across the marketplace.
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
            <section aria-label="Coupon Statistics">
                <CouponStatsCards stats={statistics} />
            </section>

            {/* Coupon Table */}
            <section aria-label="Coupon Table">
                <CouponTable />
            </section>
        </div>
    );
};

export default React.memo(AdminCouponPage);
