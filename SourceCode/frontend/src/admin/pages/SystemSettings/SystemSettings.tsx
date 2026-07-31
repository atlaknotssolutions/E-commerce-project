import React, { useEffect, useCallback, useState } from 'react';
import { Box, CircularProgress, Alert, Tabs, Tab, Button } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaletteIcon from '@mui/icons-material/Palette';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
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
  updateInvoiceSettings,
  uploadLogo,
  resetSettings,
} from '../../../Redux Toolkit/Admin/adminSystemSettingsSlice';
import BusinessSettings from './components/BusinessSettings';
import MarketplaceSettings from './components/MarketplaceSettings';
import OrderSettings from './components/OrderSettings';
import CouponSettings from './components/CouponSettings';
import NotificationSettings from './components/NotificationSettings';
import SecuritySettings from './components/SecuritySettings';
import InvoiceSettings from './components/InvoiceSettings';
import AppearanceSettings from './components/AppearanceSettings';
import ResetSettingsDialog from './components/ResetSettingsDialog';
import { notification } from '../../../services/notificationService';
import type { SystemSettings as SystemSettingsType, SettingsSection as SettingsSectionType } from '../../../types/adminSystemSettingsTypes';

const SECTIONS: Array<{ id: SettingsSectionType; label: string; icon: React.ReactElement }> = [
  { id: 'general', label: 'Business', icon: <BusinessIcon /> },
  { id: 'marketplace', label: 'Marketplace', icon: <StorefrontIcon /> },
  { id: 'orders', label: 'Orders & Returns', icon: <ShoppingCartIcon /> },
  { id: 'coupons', label: 'Coupons', icon: <LocalOfferIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { id: 'security', label: 'Security', icon: <SecurityIcon /> },
  { id: 'invoicing', label: 'Invoicing', icon: <ReceiptIcon /> },
  { id: 'appearance', label: 'Appearance', icon: <PaletteIcon /> },
];

const SystemSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading, error } = useSelector((state: RootState) => state.adminSystemSettings);
  const [tabIndex, setTabIndex] = useState(0);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) dispatch(fetchSettings());
  }, [dispatch, settings]);

  const handleSectionSave = useCallback(
    (section: string, actionFn: any, data: any): Promise<void> => {
      const label = SECTIONS.find((x) => x.id === section)?.label || 'Settings';
      setSavingSection(section);
      return dispatch(actionFn(data))
        .unwrap()
        .then(() => notification.success(`${label} settings updated successfully.`))
        .catch(() => notification.error(`Unable to save ${label.toLowerCase()} settings.`))
        .finally(() => setSavingSection((cur) => (cur === section ? null : cur)));
    },
    [dispatch],
  );

  const handleReset = useCallback(() => {
    dispatch(resetSettings())
      .unwrap()
      .then(() => {
        notification.success('Settings reset to defaults');
        setResetDialogOpen(false);
      })
      .catch((err: any) => notification.error(err || 'Failed to reset'));
  }, [dispatch]);

  const s = settings as SystemSettingsType | null;

  const renderSection = (section: SettingsSectionType) => {
    switch (section) {
      case 'general':
        return (
          <BusinessSettings
            settings={s?.general ?? null}
            appearance={s?.appearance ?? null}
            onSave={(d) => handleSectionSave('general', updateGeneralSettings, d)}
            onLogoUpload={async (fd) => { await dispatch(uploadLogo(fd)).unwrap(); }}
            loading={loading}
            saving={savingSection === 'general'}
          />
        );
      case 'marketplace':
        return (
          <MarketplaceSettings
            settings={s?.marketplace ?? null}
            onSave={(d) => handleSectionSave('marketplace', updateMarketplaceSettings, d)}
            loading={loading}
            saving={savingSection === 'marketplace'}
          />
        );
      case 'orders':
        return (
          <OrderSettings
            settings={s?.orders ?? null}
            returnsSettings={s?.returns ?? null}
            onSaveOrders={(d) => handleSectionSave('orders', updateOrderSettings, d)}
            onSaveReturns={(d) => handleSectionSave('returns', updateReturnSettings, d)}
            loading={loading}
            saving={savingSection === 'orders' || savingSection === 'returns'}
          />
        );
      case 'coupons':
        return (
          <CouponSettings
            settings={s?.coupons ?? null}
            onSave={(d) => handleSectionSave('coupons', updateCouponSettings, d)}
            loading={loading}
            saving={savingSection === 'coupons'}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings
            settings={s?.notifications ?? null}
            onSave={(d) => handleSectionSave('notifications', updateNotificationSettings, d)}
            loading={loading}
            saving={savingSection === 'notifications'}
          />
        );
      case 'security':
        return (
          <SecuritySettings
            settings={s?.security ?? null}
            onSave={(d) => handleSectionSave('security', updateSecuritySettings, d)}
            loading={loading}
            saving={savingSection === 'security'}
          />
        );
      case 'invoicing':
        return (
          <InvoiceSettings
            settings={s?.invoicing ?? null}
            onSave={(d) => handleSectionSave('invoicing', updateInvoiceSettings, d)}
            loading={loading}
            saving={savingSection === 'invoicing'}
          />
        );
      case 'appearance':
        return (
          <AppearanceSettings
            settings={s?.appearance ?? null}
            maintenance={s?.maintenance ?? null}
            onSaveAppearance={(d) => handleSectionSave('appearance', updateAppearanceSettings, d)}
            onSaveMaintenance={(d) => handleSectionSave('maintenance', updateMaintenanceSettings, d)}
            loading={loading}
            saving={savingSection === 'appearance' || savingSection === 'maintenance'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your marketplace settings</p>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={() => setResetDialogOpen(true)}
          sx={{ textTransform: 'none', borderRadius: 2, color: '#EF4444', borderColor: '#FECACA' }}
        >
          Reset
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {SECTIONS.map((sec) => (
          <Tab key={sec.id} label={sec.label} icon={sec.icon} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 48 }} />
        ))}
      </Tabs>

      {loading && !s ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, pb:5, mb:5 }}>
          {SECTIONS.map((sec, idx) => (
            <Box key={sec.id} sx={{ display: tabIndex === idx ? 'block' : 'none' }}>
              {renderSection(sec.id)}
            </Box>
          ))}
        </Box>
      )}

      <ResetSettingsDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleReset}
        loading={loading}
      />
    </Box>
  );
};

export default SystemSettings;
