import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Grid, TextField, MenuItem, Switch, Box, Typography, InputAdornment } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import ImageIcon from '@mui/icons-material/Image';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import type { AppearanceSettings as A, MaintenanceSettings as M } from '../../../../types/adminSystemSettingsTypes';
import SettingsCard from './SettingsCard';
import StickySaveBar from './StickySaveBar';
import { notification } from '../../../../services/notificationService';

interface Props {
  settings: A | null;
  maintenance: M | null;
  onSaveAppearance: (data: Partial<A>) => void;
  onSaveMaintenance: (data: Partial<M>) => void;
  loading: boolean;
  saving: boolean;
}

const appearanceDefaults: A = {
  primaryColor: '#4F46E5', secondaryColor: '#06B6D4', theme: 'light', dateFormat: 'DD/MM/YYYY',
  logoMaxSize: 2, brandingAssets: { logo: '', favicon: '', banner: '' },
};
const maintenanceDefaults: M = { maintenanceMode: false, maintenanceMessage: '' };

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

const HEX_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

const AppearanceSettings: React.FC<Props> = ({ settings, maintenance, onSaveAppearance, onSaveMaintenance, loading, saving }) => {
  const [a, setA] = useState<A>(settings || appearanceDefaults);
  const [m, setM] = useState<M>(maintenance || maintenanceDefaults);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const appearanceBaselineRef = useRef<A | null>(settings);
  const maintenanceBaselineRef = useRef<M | null>(maintenance);

  useEffect(() => {
    if (settings && JSON.stringify(settings) !== JSON.stringify(appearanceBaselineRef.current)) {
      appearanceBaselineRef.current = settings;
      setA(settings);
      setDirty(false);
    }
  }, [settings]);

  useEffect(() => {
    if (maintenance && JSON.stringify(maintenance) !== JSON.stringify(maintenanceBaselineRef.current)) {
      maintenanceBaselineRef.current = maintenance;
      setM(maintenance);
      setDirty(false);
    }
  }, [maintenance]);

  const hasChanges = useMemo(() => {
    const aChanged = (Object.keys(appearanceDefaults) as Array<keyof A>).some((k) => {
      if (k === 'brandingAssets') return JSON.stringify(a.brandingAssets) !== JSON.stringify(settings?.brandingAssets || {});
      return String(a[k] ?? '') !== String(settings?.[k] ?? '');
    });
    const mChanged = (Object.keys(maintenanceDefaults) as Array<keyof M>).some((k) => String(m[k] ?? '') !== String(maintenance?.[k] ?? ''));
    return aChanged || mChanged;
  }, [a, m, settings, maintenance]);

  const setAField = (key: keyof A, value: any) => {
    setA((p) => ({ ...p, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const setMField = (key: keyof M, value: any) => {
    setM((p) => ({ ...p, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const setBrandingAsset = (key: keyof A['brandingAssets'], value: string) => {
    setA((p) => ({ ...p, brandingAssets: { ...p.brandingAssets, [key]: value } }));
    setDirty(true);
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!HEX_RE.test(a.primaryColor)) next.primaryColor = 'Enter a valid hex color (e.g. #4F46E5)';
    if (!HEX_RE.test(a.secondaryColor)) next.secondaryColor = 'Enter a valid hex color (e.g. #06B6D4)';
    if (a.logoMaxSize <= 0) next.logoMaxSize = 'Must be greater than 0';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      notification.error('Please fix the highlighted fields before saving.');
      return;
    }
    onSaveAppearance(a);
    onSaveMaintenance(m);
    setDirty(false);
  };

  return (
    <>
      <SettingsCard icon={<PaletteIcon />} title="Brand Theme" description="Customize the marketplace appearance — colors, date format, and theme.">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Primary Color" value={a.primaryColor}
              onChange={(e) => setAField('primaryColor', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: a.primaryColor, border: '2px solid #E5E7EB' }} /></InputAdornment>,
              }}
              sx={FIELD_SX} error={!!errors.primaryColor} helperText={errors.primaryColor || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Secondary Color" value={a.secondaryColor}
              onChange={(e) => setAField('secondaryColor', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: a.secondaryColor, border: '2px solid #E5E7EB' }} /></InputAdornment>,
              }}
              sx={FIELD_SX} error={!!errors.secondaryColor} helperText={errors.secondaryColor || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Theme" value={a.theme} select
              onChange={(e) => setAField('theme', e.target.value)} sx={FIELD_SX}>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Date Format" value={a.dateFormat} select
              onChange={(e) => setAField('dateFormat', e.target.value)} sx={FIELD_SX}>
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Max Logo Size (MB)" type="number" value={a.logoMaxSize}
              onChange={(e) => setAField('logoMaxSize', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.logoMaxSize} helperText={errors.logoMaxSize || ' '} />
          </Grid>
        </Grid>
      </SettingsCard>

      <SettingsCard icon={<ImageIcon />} title="Branding Assets" description="URLs for favicon and banner used across the marketplace.">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Favicon URL" value={a.brandingAssets?.favicon || ''}
              onChange={(e) => setBrandingAsset('favicon', e.target.value)} sx={FIELD_SX} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Banner URL" value={a.brandingAssets?.banner || ''}
              onChange={(e) => setBrandingAsset('banner', e.target.value)} sx={FIELD_SX} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Logo URL" value={a.brandingAssets?.logo || ''}
              onChange={(e) => setBrandingAsset('logo', e.target.value)} sx={FIELD_SX} />
          </Grid>
        </Grid>
      </SettingsCard>

      <SettingsCard icon={<BuildCircleIcon />} title="Maintenance Mode" description="Temporarily disable the marketplace for maintenance or updates.">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <SwitchCard label="Maintenance Mode" desc="When enabled, only admins can access the marketplace"
              checked={m.maintenanceMode} onChange={(v) => setMField('maintenanceMode', v)} />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField fullWidth size="small" label="Maintenance Message" value={m.maintenanceMessage}
              onChange={(e) => setMField('maintenanceMessage', e.target.value)} multiline rows={2} sx={FIELD_SX} />
          </Grid>
        </Grid>
      </SettingsCard>

      <StickySaveBar hasChanges={hasChanges || dirty} saving={saving} onSave={handleSave}
        onDiscard={() => { setA(settings || appearanceDefaults); setM(maintenance || maintenanceDefaults); setDirty(false); }} />
    </>
  );
};

export default AppearanceSettings;
