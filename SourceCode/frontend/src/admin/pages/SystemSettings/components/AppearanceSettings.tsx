import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { AppearanceSettings as AppearanceSettingsType } from '../../../../types/adminSystemSettingsTypes';
import { SettingsSection, SettingsField } from './SettingsFormHelpers';

interface AppearanceSettingsProps {
    settings: AppearanceSettingsType | null;
    onSave: (data: Partial<AppearanceSettingsType>) => void;
    loading: boolean;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ settings, onSave, loading }) => {
    const [form, setForm] = useState<AppearanceSettingsType>({
        primaryColor: '#4F46E5',
        secondaryColor: '#06B6D4',
        theme: 'light',
        brandingAssets: { logo: '', favicon: '', banner: '' },
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (settings) setForm(settings);
    }, [settings]);

    const handleChange = (key: keyof AppearanceSettingsType, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleBrandingChange = (key: 'logo' | 'favicon' | 'banner', value: string) => {
        setForm((prev) => ({
            ...prev,
            brandingAssets: { ...prev.brandingAssets, [key]: value },
        }));
        setHasChanges(true);
    };

    return (
        <SettingsSection title="Appearance Settings" onSave={() => onSave(form)} loading={loading} hasChanges={hasChanges}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Primary Color" value={form.primaryColor} onChange={(v) => handleChange('primaryColor', v)} type="color" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Secondary Color" value={form.secondaryColor} onChange={(v) => handleChange('secondaryColor', v)} type="color" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Theme" value={form.theme} onChange={(v) => handleChange('theme', v)} type="select"
                        options={[
                            { value: 'light', label: 'Light' },
                            { value: 'dark', label: 'Dark' },
                        ]}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Logo URL" value={form.brandingAssets.logo} onChange={(v) => handleBrandingChange('logo', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Favicon URL" value={form.brandingAssets.favicon} onChange={(v) => handleBrandingChange('favicon', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Banner URL" value={form.brandingAssets.banner} onChange={(v) => handleBrandingChange('banner', v)} />
                </Grid>
            </Grid>
        </SettingsSection>
    );
};

export default React.memo(AppearanceSettings);
