import React, { useEffect, useCallback } from 'react';
import { Alert, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchAdminUsers,
    fetchAdminUserCounts,
    clearAdminUserError,
} from '../../../Redux Toolkit/Admin/adminUserSlice';
import UsersTable from './components/UsersTable';

const AdminUsersPage: React.FC = () =>
{
    const dispatch = useAppDispatch();
    const { loading, error, loaded } = useAppSelector(
        (store) => store.adminUser
    );

    useEffect(() =>
    {
        if (!loaded)
        {
            dispatch(fetchAdminUsers({}));
            dispatch(fetchAdminUserCounts());
        }
    }, [dispatch, loaded]);

    const handleRetry = useCallback(() =>
    {
        dispatch(clearAdminUserError());
        dispatch(fetchAdminUsers({}));
        dispatch(fetchAdminUserCounts());
    }, [dispatch]);

    const handleDismissError = useCallback(() =>
    {
        dispatch(clearAdminUserError());
    }, [dispatch]);

    return (
        <div className="space-y-4" role="main" aria-label="User Management">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        User Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage customers, sellers, and admin accounts.
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

            {/* Users Table */}
            <UsersTable />
        </div>
    );
};

export default React.memo(AdminUsersPage);
