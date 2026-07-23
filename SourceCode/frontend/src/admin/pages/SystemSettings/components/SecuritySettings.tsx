import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { SecuritySettings as SecuritySettingsType } from '../../../../types/adminSystemSettingsTypes';
import { SettingsSection, SettingsField, SettingsSwitch } from './SettingsFormHelpers';

interface SecuritySettingsProps {
    settings: SecuritySettingsType | null;
    onSave: (data: Partial<SecuritySettingsType>) => void;
    loading: boolean;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ settings, onSave, loading }) => {
    const [form, setForm] = useState<SecuritySettingsType>({
        passwordMinLength: 8,
        sessionTimeout: 30,
        loginAttemptLimit: 5,
        twoFactorAuthEnabled: false,
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (settings) setForm(settings);
    }, [settings]);

    const handleChange = (key: keyof SecuritySettingsType, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    return (
        <SettingsSection title="Security Settings" onSave={() => onSave(form)} loading={loading} hasChanges={hasChanges}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Minimum Password Length" value={form.passwordMinLength} onChange={(v) => handleChange('passwordMinLength', v)} type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Session Timeout (minutes)" value={form.sessionTimeout} onChange={(v) => handleChange('sessionTimeout', v)} type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Login Attempt Limit" value={form.loginAttemptLimit} onChange={(v) => handleChange('loginAttemptLimit', v)} type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Two-Factor Authentication" description="Enable 2FA for admin accounts" checked={form.twoFactorAuthEnabled} onChange={(v) => handleChange('twoFactorAuthEnabled', v)} />
                </Grid>
            </Grid>
        </SettingsSection>
    );
};

export default React.memo(SecuritySettings);
