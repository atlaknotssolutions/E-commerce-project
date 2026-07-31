import React, { useEffect, useCallback } from 'react';
import { Alert, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchSellerVerificationStats,
    clearSellerVerificationError,
} from '../../../Redux Toolkit/Admin/sellerVerificationSlice';
import VerificationStatsCards from './components/VerificationStatsCards';
import SellerVerificationTable from './components/SellerVerificationTable';

const AdminSellerVerificationPage: React.FC = () =>
{
    const dispatch = useAppDispatch();
    const { error, stats } = useAppSelector(
        (store) => store.sellerVerification
    );

    useEffect(() =>
    {
        dispatch(fetchSellerVerificationStats());
    }, [dispatch]);

    const handleRetry = useCallback(() =>
    {
        dispatch(clearSellerVerificationError());
        dispatch(fetchSellerVerificationStats());
    }, [dispatch]);

    const handleDismissError = useCallback(() =>
    {
        dispatch(clearSellerVerificationError());
    }, [dispatch]);

    return (
        <div className="space-y-6" role="main" aria-label="Seller Verification Management">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Seller Verification
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review, approve, reject, and manage seller onboarding.
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
            <section aria-label="Verification Statistics">
                <VerificationStatsCards stats={stats} />
            </section>

            {/* Seller Verification Table */}
            <section aria-label="Seller Verification Table">
                <SellerVerificationTable />
            </section>
        </div>
    );
};

export default React.memo(AdminSellerVerificationPage);
