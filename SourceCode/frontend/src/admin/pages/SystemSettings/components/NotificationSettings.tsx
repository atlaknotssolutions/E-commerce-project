import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Grid, Switch, Box, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import type { NotificationSettings as T } from '../../../../types/adminSystemSettingsTypes';
import SettingsCard from './SettingsCard';
import StickySaveBar from './StickySaveBar';

interface Props { settings: T | null; onSave: (data: Partial<T>) => void; loading: boolean; saving: boolean; }

const defaults: T = { emailNotifications: true, smsNotifications: false, pushNotifications: true, broadcastNotifications: true };

const SwitchCard: React.FC<{ label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      p: 2.5, borderRadius: 2, border: '1px solid', borderColor: '#F3F4F6',
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

const NotificationSettings: React.FC<Props> = ({ settings, onSave, loading, saving }) => {
  const [form, setForm] = useState<T>(settings || defaults);
  const [dirty, setDirty] = useState(false);
  const baselineRef = useRef<T | null>(settings);

  useEffect(() => {
    if (settings && JSON.stringify(settings) !== JSON.stringify(baselineRef.current)) {
      baselineRef.current = settings;
      setForm(settings);
      setDirty(false);
    }
  }, [settings]);

  const hasChanges = useMemo(() => !settings || (Object.keys(defaults) as Array<keyof T>).some((k) => String(form[k]) !== String(settings[k])), [form, settings]);

  return (
    <>
      <SettingsCard icon={<NotificationsIcon />} title="Notification Channels" description="Choose which channels are used to send notifications.">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="Email Notifications" desc="Order confirmations, updates, and marketing" checked={form.emailNotifications}
              onChange={(v) => { setForm((p) => ({ ...p, emailNotifications: v })); setDirty(true); }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="SMS Notifications" desc="Shipping updates and OTPs" checked={form.smsNotifications}
              onChange={(v) => { setForm((p) => ({ ...p, smsNotifications: v })); setDirty(true); }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="Push Notifications" desc="Browser and mobile push alerts" checked={form.pushNotifications}
              onChange={(v) => { setForm((p) => ({ ...p, pushNotifications: v })); setDirty(true); }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="Broadcast Notifications" desc="System-wide announcements" checked={form.broadcastNotifications}
              onChange={(v) => { setForm((p) => ({ ...p, broadcastNotifications: v })); setDirty(true); }} />
          </Grid>
        </Grid>
      </SettingsCard>

      <StickySaveBar hasChanges={hasChanges || dirty} saving={saving} onSave={() => { onSave(form); setDirty(false); }} onDiscard={() => { setForm(settings || defaults); setDirty(false); }} />
    </>
  );
};

export default NotificationSettings;
