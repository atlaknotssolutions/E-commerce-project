import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Grid, TextField, Switch, Box, Typography } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { InvoiceSettings as T } from '../../../../types/adminSystemSettingsTypes';
import SettingsCard from './SettingsCard';
import StickySaveBar from './StickySaveBar';
import { notification } from '../../../../services/notificationService';

interface Props { settings: T | null; onSave: (data: Partial<T>) => void; loading: boolean; saving: boolean; }

const defaults: T = {
  invoicePrefix: 'INV-', invoiceFooter: 'Thank you for your business!', invoiceTerms: 'Payment due within 30 days.',
  invoiceDefaultDueDays: 30, invoiceShowGST: true, invoiceShowDiscount: true, invoiceAutoEmail: true,
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

const InvoiceSettings: React.FC<Props> = ({ settings, onSave, loading, saving }) => {
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
    if (!form.invoicePrefix.trim()) next.invoicePrefix = 'Invoice prefix is required';
    if (form.invoiceDefaultDueDays < 1) next.invoiceDefaultDueDays = 'Must be at least 1';
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
      <SettingsCard icon={<ReceiptIcon />} title="Invoice Configuration" description="Invoice numbering, footer, terms, and due date rules.">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Invoice Prefix" value={form.invoicePrefix}
              onChange={(e) => set('invoicePrefix', e.target.value)} sx={FIELD_SX}
              error={!!errors.invoicePrefix} helperText={errors.invoicePrefix || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Default Due (days)" type="number" value={form.invoiceDefaultDueDays}
              onChange={(e) => set('invoiceDefaultDueDays', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.invoiceDefaultDueDays} helperText={errors.invoiceDefaultDueDays || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: 2, borderRadius: 2, border: '1px solid', borderColor: '#F3F4F6',
                bgcolor: '#FAFAFA', height: '100%',
                '&:hover': { borderColor: '#E5E7EB', bgcolor: '#F3F4F6' },
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ color: '#374151', fontSize: 13.5 }}>Auto-Email Invoices</Typography>
              <Switch
                checked={form.invoiceAutoEmail}
                onChange={(e) => set('invoiceAutoEmail', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#A5B4FC' },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Invoice Footer Text" value={form.invoiceFooter}
              onChange={(e) => set('invoiceFooter', e.target.value)} multiline rows={2} sx={FIELD_SX} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Invoice Terms & Conditions" value={form.invoiceTerms}
              onChange={(e) => set('invoiceTerms', e.target.value)} multiline rows={2} sx={FIELD_SX} />
          </Grid>
        </Grid>
      </SettingsCard>

      <SettingsCard icon={<VisibilityIcon />} title="Display Settings" description="Control which information appears on customer invoices.">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: 2, borderRadius: 2, border: '1px solid', borderColor: '#F3F4F6',
                bgcolor: '#FAFAFA', transition: 'all 0.15s ease',
                '&:hover': { borderColor: '#E5E7EB', bgcolor: '#F3F4F6' },
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ color: '#374151', fontSize: 13.5 }}>Show GST on Invoice</Typography>
              <Switch
                checked={form.invoiceShowGST}
                onChange={(e) => set('invoiceShowGST', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#A5B4FC' },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: 2, borderRadius: 2, border: '1px solid', borderColor: '#F3F4F6',
                bgcolor: '#FAFAFA', transition: 'all 0.15s ease',
                '&:hover': { borderColor: '#E5E7EB', bgcolor: '#F3F4F6' },
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ color: '#374151', fontSize: 13.5 }}>Show Discount Details</Typography>
              <Switch
                checked={form.invoiceShowDiscount}
                onChange={(e) => set('invoiceShowDiscount', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#A5B4FC' },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </SettingsCard>

      <StickySaveBar hasChanges={hasChanges || dirty} saving={saving} onSave={handleSave} onDiscard={() => { setForm(settings || defaults); setDirty(false); }} />
    </>
  );
};

export default InvoiceSettings;
