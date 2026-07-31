import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Grid, TextField, Switch, Box, Typography } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import type { CouponSettings as T } from '../../../../types/adminSystemSettingsTypes';
import SettingsCard from './SettingsCard';
import StickySaveBar from './StickySaveBar';
import { notification } from '../../../../services/notificationService';

interface Props { settings: T | null; onSave: (data: Partial<T>) => void; loading: boolean; saving: boolean; }

const defaults: T = { couponEnabled: true, maxDiscount: 50, couponExpiryDefault: 30 };

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

const CouponSettings: React.FC<Props> = ({ settings, onSave, loading, saving }) => {
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
    if (form.maxDiscount < 0 || form.maxDiscount > 100) next.maxDiscount = 'Must be between 0 and 100';
    if (form.couponExpiryDefault < 1) next.couponExpiryDefault = 'Must be at least 1';
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
      <SettingsCard icon={<LocalOfferIcon />} title="Coupon Configuration" description="Global coupon rules, discount limits, and default expiry periods.">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: 2, borderRadius: 2, border: '1px solid', borderColor: '#F3F4F6',
                bgcolor: '#FAFAFA', height: '100%',
                '&:hover': { borderColor: '#E5E7EB', bgcolor: '#F3F4F6' },
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ color: '#374151', fontSize: 13.5 }}>Coupons Enabled</Typography>
              <Switch
                checked={form.couponEnabled}
                onChange={(e) => set('couponEnabled', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#A5B4FC' },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Max Discount (%)" type="number" value={form.maxDiscount}
              onChange={(e) => set('maxDiscount', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.maxDiscount} helperText={errors.maxDiscount || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Default Expiry (days)" type="number" value={form.couponExpiryDefault}
              onChange={(e) => set('couponExpiryDefault', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.couponExpiryDefault} helperText={errors.couponExpiryDefault || ' '} />
          </Grid>
        </Grid>
      </SettingsCard>

      <StickySaveBar hasChanges={hasChanges || dirty} saving={saving} onSave={handleSave} onDiscard={() => { setForm(settings || defaults); setDirty(false); }} />
    </>
  );
};

export default CouponSettings;
