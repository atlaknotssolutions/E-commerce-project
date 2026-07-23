import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { GeneralSettings as GeneralSettingsType } from '../../../../types/adminSystemSettingsTypes';
import { SettingsSection, SettingsField } from './SettingsFormHelpers';

interface GeneralSettingsProps {
    settings: GeneralSettingsType | null;
    onSave: (data: Partial<GeneralSettingsType>) => void;
    loading: boolean;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onSave, loading }) => {
    const [form, setForm] = useState<GeneralSettingsType>({
        platformName: '',
        platformLogo: '',
        supportEmail: '',
        supportPhone: '',
        timezone: 'UTC',
        currency: 'INR',
        language: 'en',
        country: 'IN',
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (settings) setForm(settings);
    }, [settings]);

    const handleChange = (key: keyof GeneralSettingsType, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    return (
        <SettingsSection title="General Settings" onSave={() => onSave(form)} loading={loading} hasChanges={hasChanges}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Platform Name" value={form.platformName} onChange={(v) => handleChange('platformName', v)} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Platform Logo URL" value={form.platformLogo} onChange={(v) => handleChange('platformLogo', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Support Email" value={form.supportEmail} onChange={(v) => handleChange('supportEmail', v)} type="email" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Support Phone" value={form.supportPhone} onChange={(v) => handleChange('supportPhone', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Timezone" value={form.timezone} onChange={(v) => handleChange('timezone', v)} type="select"
                        options={[
                            { value: 'UTC', label: 'UTC' },
                            { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                            { value: 'America/New_York', label: 'America/New_York (EST)' },
                            { value: 'Europe/London', label: 'Europe/London (GMT)' },
                        ]}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Currency" value={form.currency} onChange={(v) => handleChange('currency', v)} type="select"
                        options={[
                            { value: 'INR', label: 'INR (₹)' },
                            { value: 'USD', label: 'USD ($)' },
                            { value: 'EUR', label: 'EUR (€)' },
                            { value: 'GBP', label: 'GBP (£)' },
                        ]}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Language" value={form.language} onChange={(v) => handleChange('language', v)} type="select"
                        options={[
                            { value: 'en', label: 'English' },
                            { value: 'hi', label: 'Hindi' },
                            { value: 'es', label: 'Spanish' },
                        ]}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Country" value={form.country} onChange={(v) => handleChange('country', v)} type="select"
                        options={[
                            { value: 'IN', label: 'India' },
                            { value: 'US', label: 'United States' },
                            { value: 'GB', label: 'United Kingdom' },
                        ]}
                    />
                </Grid>
            </Grid>
        </SettingsSection>
    );
};

export default React.memo(GeneralSettings);
