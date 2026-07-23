import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { CouponSettings as CouponSettingsType } from '../../../../types/adminSystemSettingsTypes';
import { SettingsSection, SettingsField, SettingsSwitch } from './SettingsFormHelpers';

interface CouponSettingsProps {
    settings: CouponSettingsType | null;
    onSave: (data: Partial<CouponSettingsType>) => void;
    loading: boolean;
}

const CouponSettings: React.FC<CouponSettingsProps> = ({ settings, onSave, loading }) => {
    const [form, setForm] = useState<CouponSettingsType>({
        couponEnabled: true,
        maxDiscount: 50,
        couponExpiryDefault: 30,
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (settings) setForm(settings);
    }, [settings]);

    const handleChange = (key: keyof CouponSettingsType, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    return (
        <SettingsSection title="Coupon Settings" onSave={() => onSave(form)} loading={loading} hasChanges={hasChanges}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Coupons Enabled" checked={form.couponEnabled} onChange={(v) => handleChange('couponEnabled', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Max Discount (%)" value={form.maxDiscount} onChange={(v) => handleChange('maxDiscount', v)} type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Default Expiry (days)" value={form.couponExpiryDefault} onChange={(v) => handleChange('couponExpiryDefault', v)} type="number" />
                </Grid>
            </Grid>
        </SettingsSection>
    );
};

export default React.memo(CouponSettings);
