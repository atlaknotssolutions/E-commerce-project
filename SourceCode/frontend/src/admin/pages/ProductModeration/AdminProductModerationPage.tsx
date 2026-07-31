import React, { useEffect, useCallback } from 'react';
import { Alert, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchProductModerationStats,
    clearProductModerationError,
} from '../../../Redux Toolkit/Admin/adminProductModerationSlice';
import ModerationStatsCards from './components/ModerationStatsCards';
import ProductModerationTable from './components/ProductModerationTable';

const AdminProductModerationPage: React.FC = () =>
{
    const dispatch = useAppDispatch();
    const { error, stats } = useAppSelector(
        (store) => store.adminProductModeration || { error: null, stats: null }
    );

    useEffect(() =>
    {
        dispatch(fetchProductModerationStats());
    }, [dispatch]);

    const handleRetry = useCallback(() =>
    {
        dispatch(clearProductModerationError());
        dispatch(fetchProductModerationStats());
    }, [dispatch]);

    const handleDismissError = useCallback(() =>
    {
        dispatch(clearProductModerationError());
    }, [dispatch]);

    return (
        <div className="space-y-6" role="main" aria-label="Product Moderation Management">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Product Moderation
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review, approve, reject, publish, feature, and manage marketplace products.
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
            <section aria-label="Moderation Statistics">
                <ModerationStatsCards stats={stats} />
            </section>

            {/* Product Moderation Table */}
            <section aria-label="Product Moderation Table">
                <ProductModerationTable />
            </section>
        </div>
    );
};

export default React.memo(AdminProductModerationPage);
