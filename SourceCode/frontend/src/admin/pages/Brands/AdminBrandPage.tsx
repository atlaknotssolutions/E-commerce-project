import React, { useEffect, useCallback } from "react";
import { Alert, Button, Box, Tabs, Tab } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
    fetchAllBrands,
    fetchBrandStats,
    clearAdminBrandError,
} from "../../../Redux Toolkit/Admin/adminBrandSlice";
import {
    fetchAllBrandRequests,
    fetchPendingBrandRequestCount,
} from "../../../Redux Toolkit/Admin/adminBrandRequestSlice";
import AdminBrandTable from "./AdminBrandTable";
import AdminBrandRequestList from "./AdminBrandRequestList";

const AdminBrandPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { error } = useAppSelector((store) => store.adminBrand);
    const { pendingCount } = useAppSelector((store) => store.adminBrandRequest);

    const [activeTab, setActiveTab] = React.useState(0);

    useEffect(() => {
        dispatch(fetchBrandStats());
        dispatch(fetchPendingBrandRequestCount());
    }, [dispatch]);

    const handleRetry = useCallback(() => {
        dispatch(clearAdminBrandError());
        dispatch(fetchAllBrands());
    }, [dispatch]);

    const handleDismissError = useCallback(() => {
        dispatch(clearAdminBrandError());
    }, [dispatch]);

    return (
        <Box p={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Brand Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage brands, brand requests, and featured brand listings.
                    </p>
                </Box>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    onClose={handleDismissError}
                    action={
                        <Button color="inherit" size="small" onClick={handleRetry}>
                            Retry
                        </Button>
                    }
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{ mb: 3 }}
            >
                <Tab label="All Brands" />
                <Tab
                    label={`Brand Requests${pendingCount > 0 ? ` (${pendingCount})` : ""}`}
                />
            </Tabs>

            {activeTab === 0 && <AdminBrandTable />}
            {activeTab === 1 && <AdminBrandRequestList />}
        </Box>
    );
};

export default React.memo(AdminBrandPage);
