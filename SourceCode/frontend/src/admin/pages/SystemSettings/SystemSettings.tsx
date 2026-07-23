import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../Redux Toolkit/Store';
import {
    fetchSettings,
    updateGeneralSettings,
    updateMarketplaceSettings,
    updateOrderSettings,
    updateReturnSettings,
    updateCouponSettings,
    updateNotificationSettings,
    updateSecuritySettings,
    updateMaintenanceSettings,
    updateAppearanceSettings,
    resetSettings,
} from '../../../Redux Toolkit/Admin/adminSystemSettingsSlice';
import SettingsTabs from './components/SettingsTabs';
import GeneralSettings from './components/GeneralSettings';
import MarketplaceSettings from './components/MarketplaceSettings';
import OrderSettings from './components/OrderSettings';
import ReturnSettings from './components/ReturnSettings';
import CouponSettings from './components/CouponSettings';
import NotificationSettings from './components/NotificationSettings';
import SecuritySettings from './components/SecuritySettings';
import MaintenanceSettings from './components/MaintenanceSettings';
import AppearanceSettings from './components/AppearanceSettings';
import ResetSettingsDialog from './components/ResetSettingsDialog';

const SystemSettings: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { settings, loading, error } = useSelector((state: RootState) => state.adminSystemSettings);
    const [activeTab, setActiveTab] = useState(0);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    const showSnack = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleUpdateSection = (actionFn: any, data: any) => {
        dispatch(actionFn(data))
            .unwrap()
            .then(() => showSnack('Settings saved successfully'))
            .catch((err: any) => showSnack(err || 'Failed to save settings', 'error'));
    };

    const handleReset = () => {
        dispatch(resetSettings())
            .unwrap()
            .then(() => {
                showSnack('Settings reset to defaults');
                setResetDialogOpen(false);
            })
            .catch((err: any) => showSnack(err || 'Failed to reset settings', 'error'));
    };

    if (loading && !settings) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" fontWeight={700}>System Settings</Typography>
                {activeTab === 7 && (
                    <Box>
                        <Typography
                            component="span"
                            sx={{ color: 'error.main', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}
                            onClick={() => setResetDialogOpen(true)}
                        >
                            Reset All Settings
                        </Typography>
                    </Box>
                )}
            </Box>

            <Paper sx={{ p: 3 }}>
                <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {activeTab === 0 && <GeneralSettings settings={settings?.general ?? null} onSave={(d) => handleUpdateSection(updateGeneralSettings, d)} loading={loading} />}
                {activeTab === 1 && <MarketplaceSettings settings={settings?.marketplace ?? null} onSave={(d) => handleUpdateSection(updateMarketplaceSettings, d)} loading={loading} />}
                {activeTab === 2 && <OrderSettings settings={settings?.orders ?? null} onSave={(d) => handleUpdateSection(updateOrderSettings, d)} loading={loading} />}
                {activeTab === 3 && <ReturnSettings settings={settings?.returns ?? null} onSave={(d) => handleUpdateSection(updateReturnSettings, d)} loading={loading} />}
                {activeTab === 4 && <CouponSettings settings={settings?.coupons ?? null} onSave={(d) => handleUpdateSection(updateCouponSettings, d)} loading={loading} />}
                {activeTab === 5 && <NotificationSettings settings={settings?.notifications ?? null} onSave={(d) => handleUpdateSection(updateNotificationSettings, d)} loading={loading} />}
                {activeTab === 6 && <SecuritySettings settings={settings?.security ?? null} onSave={(d) => handleUpdateSection(updateSecuritySettings, d)} loading={loading} />}
                {activeTab === 7 && <MaintenanceSettings settings={settings?.maintenance ?? null} onSave={(d) => handleUpdateSection(updateMaintenanceSettings, d)} loading={loading} />}
                {activeTab === 8 && <AppearanceSettings settings={settings?.appearance ?? null} onSave={(d) => handleUpdateSection(updateAppearanceSettings, d)} loading={loading} />}
            </Paper>

            <ResetSettingsDialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} onConfirm={handleReset} loading={loading} />

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default SystemSettings;
