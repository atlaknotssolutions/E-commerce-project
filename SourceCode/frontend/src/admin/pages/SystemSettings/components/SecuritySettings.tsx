import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Grid, TextField, Switch, Box, Typography } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import type { SecuritySettings as T } from '../../../../types/adminSystemSettingsTypes';
import SettingsCard from './SettingsCard';
import StickySaveBar from './StickySaveBar';
import { notification } from '../../../../services/notificationService';

interface Props { settings: T | null; onSave: (data: Partial<T>) => void; loading: boolean; saving: boolean; }

const defaults: T = { passwordMinLength: 8, sessionTimeout: 30, loginAttemptLimit: 5, twoFactorAuthEnabled: false };

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

const SecuritySettings: React.FC<Props> = ({ settings, onSave, loading, saving }) => {
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
    if (form.passwordMinLength < 6 || form.passwordMinLength > 64) next.passwordMinLength = 'Must be between 6 and 64';
    if (form.sessionTimeout < 1) next.sessionTimeout = 'Must be at least 1';
    if (form.loginAttemptLimit < 1) next.loginAttemptLimit = 'Must be at least 1';
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
      <SettingsCard icon={<SecurityIcon />} title="Security Configuration" description="Password policies, session management, and authentication settings.">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Min Password Length" type="number" value={form.passwordMinLength}
              onChange={(e) => set('passwordMinLength', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.passwordMinLength} helperText={errors.passwordMinLength || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Session Timeout (min)" type="number" value={form.sessionTimeout}
              onChange={(e) => set('sessionTimeout', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.sessionTimeout} helperText={errors.sessionTimeout || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Login Attempt Limit" type="number" value={form.loginAttemptLimit}
              onChange={(e) => set('loginAttemptLimit', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.loginAttemptLimit} helperText={errors.loginAttemptLimit || ' '} />
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
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#374151', fontSize: 13.5 }}>Two-Factor Auth</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 0.3, lineHeight: 1.4 }}>
                  Require 2FA for admin accounts
                </Typography>
              </Box>
              <Switch
                checked={form.twoFactorAuthEnabled}
                onChange={(e) => set('twoFactorAuthEnabled', e.target.checked)}
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

export default SecuritySettings;
