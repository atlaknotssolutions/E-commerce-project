import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { ReturnSettings as ReturnSettingsType } from '../../../../types/adminSystemSettingsTypes';
import { SettingsSection, SettingsField, SettingsSwitch } from './SettingsFormHelpers';

interface ReturnSettingsProps {
    settings: ReturnSettingsType | null;
    onSave: (data: Partial<ReturnSettingsType>) => void;
    loading: boolean;
}

const ReturnSettings: React.FC<ReturnSettingsProps> = ({ settings, onSave, loading }) => {
    const [form, setForm] = useState<ReturnSettingsType>({
        returnEnabled: true,
        refundEnabled: true,
        replacementEnabled: true,
        returnDays: 30,
        autoRefund: false,
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (settings) setForm(settings);
    }, [settings]);

    const handleChange = (key: keyof ReturnSettingsType, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    return (
        <SettingsSection title="Return Settings" onSave={() => onSave(form)} loading={loading} hasChanges={hasChanges}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Returns Enabled" checked={form.returnEnabled} onChange={(v) => handleChange('returnEnabled', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Refunds Enabled" checked={form.refundEnabled} onChange={(v) => handleChange('refundEnabled', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Replacements Enabled" checked={form.replacementEnabled} onChange={(v) => handleChange('replacementEnabled', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Return Window (days)" value={form.returnDays} onChange={(v) => handleChange('returnDays', v)} type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Auto Refund" description="Automatically process refunds when returns are approved" checked={form.autoRefund} onChange={(v) => handleChange('autoRefund', v)} />
                </Grid>
            </Grid>
        </SettingsSection>
    );
};

export default React.memo(ReturnSettings);
