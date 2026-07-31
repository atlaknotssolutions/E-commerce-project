import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Grid, TextField, MenuItem, Switch, Box, Typography } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import type { MarketplaceSettings as T } from '../../../../types/adminSystemSettingsTypes';
import SettingsCard from './SettingsCard';
import StickySaveBar from './StickySaveBar';
import { notification } from '../../../../services/notificationService';

interface Props { settings: T | null; onSave: (data: Partial<T>) => void; loading: boolean; saving: boolean; }

const defaults: T = {
  marketplaceEnabled: true, sellerRegistrationEnabled: true, customerRegistrationEnabled: true,
  guestCheckout: false, autoApproveSeller: false, autoApproveProduct: false,
  commissionPercentage: 10, gstPercentage: 18, gstEnabled: true, commissionBase: 'selling_price',
};

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, bgcolor: '#FFFFFF',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5', borderWidth: 2 },
    transition: 'all 0.15s ease',
  },
  '& .MuiInputLabel-root': { fontWeight: 500, color: '#6B7280', '&.Mui-focused': { color: '#4F46E5' } },
  '& .MuiInputBase-input': { fontSize: 14 },
};

const SwitchCard: React.FC<{ label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      p: 2, borderRadius: 2, border: '1px solid', borderColor: '#F3F4F6',
      bgcolor: '#FAFAFA', transition: 'all 0.15s ease',
      '&:hover': { borderColor: '#E5E7EB', bgcolor: '#F3F4F6' },
    }}
  >
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ color: '#374151', fontSize: 13.5 }}>{label}</Typography>
      {desc && <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 0.3, lineHeight: 1.4 }}>{desc}</Typography>}
    </Box>
    <Switch
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#A5B4FC' },
      }}
    />
  </Box>
);

const MarketplaceSettings: React.FC<Props> = ({ settings, onSave, loading, saving }) => {
  const [form, setForm] = useState<T>(settings || defaults);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const baselineRef = useRef<T | null>(settings);

  useEffect(() => {
    if (settings && JSON.stringify(settings) !== JSON.stringify(baselineRef.current)) {
      baselineRef.current = settings;
      setForm(settings);
      setDirty(false);
    }
  }, [settings]);

  const hasChanges = useMemo(() => !settings || (Object.keys(defaults) as Array<keyof T>).some((k) => String(form[k]) !== String(settings[k])), [form, settings]);

  const set = (key: keyof T, value: any) => {
    setForm((p) => ({ ...p, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof T, string>> = {};
    if (form.commissionPercentage < 0 || form.commissionPercentage > 100) next.commissionPercentage = 'Must be between 0 and 100';
    if (form.gstPercentage < 0 || form.gstPercentage > 100) next.gstPercentage = 'Must be between 0 and 100';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      notification.error('Please fix the highlighted fields before saving.');
      return;
    }
    onSave(form);
    setDirty(false);
  };

  return (
    <>
      <SettingsCard icon={<StorefrontIcon />} title="Marketplace Configuration" description="Control marketplace availability and registration flows.">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="Marketplace Enabled" desc="Enable or disable the entire marketplace" checked={form.marketplaceEnabled} onChange={(v) => set('marketplaceEnabled', v)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="Seller Registration" desc="Allow new sellers to register" checked={form.sellerRegistrationEnabled} onChange={(v) => set('sellerRegistrationEnabled', v)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="Customer Registration" desc="Allow new customers to register" checked={form.customerRegistrationEnabled} onChange={(v) => set('customerRegistrationEnabled', v)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="Guest Checkout" desc="Allow checkout without login" checked={form.guestCheckout} onChange={(v) => set('guestCheckout', v)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="Auto Approve Sellers" desc="Automatically approve new seller registrations" checked={form.autoApproveSeller} onChange={(v) => set('autoApproveSeller', v)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="Auto Approve Products" desc="Automatically approve new product listings" checked={form.autoApproveProduct} onChange={(v) => set('autoApproveProduct', v)} />
          </Grid>
        </Grid>
      </SettingsCard>

      <SettingsCard icon={<AccountBalanceIcon />} title="Commission & Tax" description="Platform commission rate, GST settings, and commission base.">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Platform Commission (%)" type="number" value={form.commissionPercentage}
              onChange={(e) => set('commissionPercentage', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.commissionPercentage} helperText={errors.commissionPercentage || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="GST on Commission (%)" type="number" value={form.gstPercentage}
              onChange={(e) => set('gstPercentage', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.gstPercentage} helperText={errors.gstPercentage || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SwitchCard label="Enable GST" desc="Apply GST on platform commission" checked={form.gstEnabled} onChange={(v) => set('gstEnabled', v)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Commission Base" value={form.commissionBase} select
              onChange={(e) => set('commissionBase', e.target.value)} sx={FIELD_SX}>
              <MenuItem value="selling_price">Pre-Coupon (Selling Price)</MenuItem>
              <MenuItem value="post_coupon">Post-Coupon (Selling Price - Coupon)</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </SettingsCard>

      <StickySaveBar hasChanges={hasChanges || dirty} saving={saving} onSave={handleSave} onDiscard={() => { setForm(settings || defaults); setDirty(false); }} />
    </>
  );
};

export default MarketplaceSettings;
