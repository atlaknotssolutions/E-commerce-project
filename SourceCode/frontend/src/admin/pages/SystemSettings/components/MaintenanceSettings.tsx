import React, { useState, useEffect } from 'react';
import { Grid, Alert } from '@mui/material';
import { MaintenanceSettings as MaintenanceSettingsType } from '../../../../types/adminSystemSettingsTypes';
import { SettingsSection, SettingsField, SettingsSwitch } from './SettingsFormHelpers';

interface MaintenanceSettingsProps {
    settings: MaintenanceSettingsType | null;
    onSave: (data: Partial<MaintenanceSettingsType>) => void;
    loading: boolean;
}

const MaintenanceSettings: React.FC<MaintenanceSettingsProps> = ({ settings, onSave, loading }) => {
    const [form, setForm] = useState<MaintenanceSettingsType>({
        maintenanceMode: false,
        maintenanceMessage: 'We are currently undergoing scheduled maintenance. Please check back later.',
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (settings) setForm(settings);
    }, [settings]);

    const handleChange = (key: keyof MaintenanceSettingsType, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    return (
        <SettingsSection title="Maintenance Settings" onSave={() => onSave(form)} loading={loading} hasChanges={hasChanges}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    {form.maintenanceMode && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Maintenance mode is currently enabled. The platform is not accessible to users.
                        </Alert>
                    )}
                    <SettingsSwitch
                        label="Maintenance Mode"
                        description="When enabled, the platform shows a maintenance page to all non-admin users"
                        checked={form.maintenanceMode}
                        onChange={(v) => handleChange('maintenanceMode', v)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <SettingsField
                        label="Maintenance Message"
                        value={form.maintenanceMessage}
                        onChange={(v) => handleChange('maintenanceMessage', v)}
                        multiline
                        rows={3}
                    />
                </Grid>
            </Grid>
        </SettingsSection>
    );
};

export default React.memo(MaintenanceSettings);
