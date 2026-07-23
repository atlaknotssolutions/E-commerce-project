import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { OrderSettings as OrderSettingsType } from '../../../../types/adminSystemSettingsTypes';
import { SettingsSection, SettingsField, SettingsSwitch } from './SettingsFormHelpers';

interface OrderSettingsProps {
    settings: OrderSettingsType | null;
    onSave: (data: Partial<OrderSettingsType>) => void;
    loading: boolean;
}

const OrderSettings: React.FC<OrderSettingsProps> = ({ settings, onSave, loading }) => {
    const [form, setForm] = useState<OrderSettingsType>({
        orderCancellationWindow: 24,
        returnWindow: 30,
        codEnabled: true,
        onlinePaymentEnabled: true,
        freeShippingThreshold: 0,
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (settings) setForm(settings);
    }, [settings]);

    const handleChange = (key: keyof OrderSettingsType, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    return (
        <SettingsSection title="Order Settings" onSave={() => onSave(form)} loading={loading} hasChanges={hasChanges}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Order Cancellation Window (hours)" value={form.orderCancellationWindow} onChange={(v) => handleChange('orderCancellationWindow', v)} type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Return Window (days)" value={form.returnWindow} onChange={(v) => handleChange('returnWindow', v)} type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Free Shipping Threshold (₹)" value={form.freeShippingThreshold} onChange={(v) => handleChange('freeShippingThreshold', v)} type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="COD Enabled" checked={form.codEnabled} onChange={(v) => handleChange('codEnabled', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Online Payment Enabled" checked={form.onlinePaymentEnabled} onChange={(v) => handleChange('onlinePaymentEnabled', v)} />
                </Grid>
            </Grid>
        </SettingsSection>
    );
};

export default React.memo(OrderSettings);
