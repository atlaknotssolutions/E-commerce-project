import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { NotificationSettings as NotificationSettingsType } from '../../../../types/adminSystemSettingsTypes';
import { SettingsSection, SettingsSwitch } from './SettingsFormHelpers';

interface NotificationSettingsProps {
    settings: NotificationSettingsType | null;
    onSave: (data: Partial<NotificationSettingsType>) => void;
    loading: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ settings, onSave, loading }) => {
    const [form, setForm] = useState<NotificationSettingsType>({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        broadcastNotifications: true,
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (settings) setForm(settings);
    }, [settings]);

    const handleChange = (key: keyof NotificationSettingsType, value: boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    return (
        <SettingsSection title="Notification Settings" onSave={() => onSave(form)} loading={loading} hasChanges={hasChanges}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Email Notifications" checked={form.emailNotifications} onChange={(v) => handleChange('emailNotifications', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="SMS Notifications" checked={form.smsNotifications} onChange={(v) => handleChange('smsNotifications', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Push Notifications" checked={form.pushNotifications} onChange={(v) => handleChange('pushNotifications', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Broadcast Notifications" checked={form.broadcastNotifications} onChange={(v) => handleChange('broadcastNotifications', v)} />
                </Grid>
            </Grid>
        </SettingsSection>
    );
};

export default React.memo(NotificationSettings);
