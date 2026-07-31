import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Grid, TextField, MenuItem } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import LanguageIcon from '@mui/icons-material/Language';
import ImageIcon from '@mui/icons-material/Image';
import type { GeneralSettings, AppearanceSettings } from '../../../../types/adminSystemSettingsTypes';
import SettingsCard from './SettingsCard';
import LogoUpload from './LogoUpload';
import StickySaveBar from './StickySaveBar';
import { notification } from '../../../../services/notificationService';

interface Props {
  settings: GeneralSettings | null;
  appearance: AppearanceSettings | null;
  onSave: (data: Partial<GeneralSettings>) => void;
  onLogoUpload: (fd: FormData) => Promise<void>;
  loading: boolean;
  saving: boolean;
}

const TIMEZONES = [
  'UTC', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Shanghai',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London',
  'Europe/Berlin', 'Australia/Sydney', 'Pacific/Auckland',
];

const CURRENCIES = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'SGD', label: 'SGD (S$)' },
  { value: 'AED', label: 'AED (د.إ)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'mr', label: 'Marathi' },
];

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

const DEFAULTS: GeneralSettings = {
  platformName: '', companyLegalName: '', GSTIN: '', PAN: '', CIN: '', address: '',
  supportEmail: '', supportPhone: '', website: '',
  timezone: 'UTC', currency: 'INR', language: 'en', country: 'IN', platformLogo: '',
};

const BusinessSettings: React.FC<Props> = ({ settings, appearance, onSave, onLogoUpload, loading, saving }) => {
  const [form, setForm] = useState<GeneralSettings>(settings || DEFAULTS);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const baselineRef = useRef<GeneralSettings | null>(settings);

  useEffect(() => {
    if (settings && JSON.stringify(settings) !== JSON.stringify(baselineRef.current)) {
      baselineRef.current = settings;
      setForm(settings);
      setDirty(false);
    }
  }, [settings]);

  const hasChanges = useMemo(() => {
    if (!settings) return false;
    return (Object.keys(DEFAULTS) as Array<keyof GeneralSettings>).some((k) => String(form[k] ?? '') !== String(settings[k] ?? ''));
  }, [form, settings]);

  const handleChange = (key: keyof GeneralSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.platformName.trim()) next.platformName = 'Platform name is required';
    if (!form.companyLegalName.trim()) next.companyLegalName = 'Legal name is required';
    if (!form.supportEmail.trim()) next.supportEmail = 'Support email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail)) next.supportEmail = 'Enter a valid email address';
    if (!form.country.trim()) next.country = 'Country code is required';
    if (form.website.trim() && !/^https?:\/\/\S+\.\S+$/.test(form.website)) next.website = 'Enter a valid URL (e.g. https://example.com)';
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
  const handleDiscard = () => { setForm(settings || DEFAULTS); setDirty(false); };

  return (
    <>
      <SettingsCard icon={<BusinessIcon />} title="Business Identity" description="Your marketplace legal identity and tax information.">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Platform Name" value={form.platformName}
              onChange={(e) => handleChange('platformName', e.target.value)} sx={FIELD_SX}
              error={!!errors.platformName} helperText={errors.platformName || ' '} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Company Legal Name" value={form.companyLegalName}
              onChange={(e) => handleChange('companyLegalName', e.target.value)} sx={FIELD_SX}
              error={!!errors.companyLegalName} helperText={errors.companyLegalName || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="GSTIN" value={form.GSTIN}
              onChange={(e) => handleChange('GSTIN', e.target.value)} sx={FIELD_SX} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="PAN" value={form.PAN}
              onChange={(e) => handleChange('PAN', e.target.value)} sx={FIELD_SX} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="CIN" value={form.CIN}
              onChange={(e) => handleChange('CIN', e.target.value)} sx={FIELD_SX} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Business Address" value={form.address}
              onChange={(e) => handleChange('address', e.target.value)} multiline rows={2} sx={FIELD_SX} />
          </Grid>
        </Grid>
      </SettingsCard>

      <SettingsCard icon={<ContactSupportIcon />} title="Support Information" description="Contact details displayed to customers and on invoices.">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Support Email" value={form.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)} sx={FIELD_SX}
              error={!!errors.supportEmail} helperText={errors.supportEmail || ' '} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Support Phone" value={form.supportPhone}
              onChange={(e) => handleChange('supportPhone', e.target.value)} sx={FIELD_SX} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Website" value={form.website}
              onChange={(e) => handleChange('website', e.target.value)} sx={FIELD_SX}
              error={!!errors.website} helperText={errors.website || ' '} />
          </Grid>
        </Grid>
      </SettingsCard>

      <SettingsCard icon={<LanguageIcon />} title="Regional Settings" description="Timezone, currency, and language preferences.">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Timezone" value={form.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)} select sx={FIELD_SX}>
              {TIMEZONES.map((tz) => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Currency" value={form.currency}
              onChange={(e) => handleChange('currency', e.target.value)} select sx={FIELD_SX}>
              {CURRENCIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Language" value={form.language}
              onChange={(e) => handleChange('language', e.target.value)} select sx={FIELD_SX}>
              {LANGUAGES.map((l) => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Country Code" value={form.country}
              onChange={(e) => handleChange('country', e.target.value)} sx={FIELD_SX}
              error={!!errors.country} helperText={errors.country || ' '} />
          </Grid>
        </Grid>
      </SettingsCard>

      <SettingsCard icon={<ImageIcon />} title="Brand Logo" description="Upload your marketplace logo. Displayed on invoices, emails, and the storefront.">
        <LogoUpload
          currentLogo={form.platformLogo}
          platformName={form.platformName}
          onUpload={onLogoUpload}
          uploading={false}
        />
      </SettingsCard>

      <StickySaveBar hasChanges={hasChanges || dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} />
    </>
  );
};

export default BusinessSettings;
