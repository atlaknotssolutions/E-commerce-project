import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../Redux Toolkit/Store';

/**
 * Protects customer-only routes.
 * Logged-out users (and sellers/admins) are redirected to /login while the
 * intended destination is preserved so they can return after login.
 */
const RequireAuth = ({ children }: { children: React.ReactElement }) => {
    const { user } = useAppSelector((store) => store);
    const location = useLocation();

    const isAuthenticatedCustomer =
        Boolean(user.user) && user.user?.role === 'ROLE_CUSTOMER';

    if (!isAuthenticatedCustomer) {
        const from = location.pathname + location.search;

        return <Navigate to="/login" replace state={{ from }} />;
    }

    return children;
};

export default RequireAuth;
