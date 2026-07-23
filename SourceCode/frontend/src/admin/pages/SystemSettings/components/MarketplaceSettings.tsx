import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { MarketplaceSettings as MarketplaceSettingsType } from '../../../../types/adminSystemSettingsTypes';
import { SettingsSection, SettingsSwitch, SettingsField } from './SettingsFormHelpers';

interface MarketplaceSettingsProps {
    settings: MarketplaceSettingsType | null;
    onSave: (data: Partial<MarketplaceSettingsType>) => void;
    loading: boolean;
}

const MarketplaceSettings: React.FC<MarketplaceSettingsProps> = ({ settings, onSave, loading }) => {
    const [form, setForm] = useState<MarketplaceSettingsType>({
        marketplaceEnabled: true,
        sellerRegistrationEnabled: true,
        customerRegistrationEnabled: true,
        guestCheckout: false,
        autoApproveSeller: false,
        autoApproveProduct: false,
        commissionPercentage: 10,
        gstPercentage: 18,
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (settings) setForm(settings);
    }, [settings]);

    const handleChange = (key: keyof MarketplaceSettingsType, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    return (
        <SettingsSection title="Marketplace Settings" onSave={() => onSave(form)} loading={loading} hasChanges={hasChanges}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Marketplace Enabled" description="Enable or disable the entire marketplace" checked={form.marketplaceEnabled} onChange={(v) => handleChange('marketplaceEnabled', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Seller Registration" description="Allow new sellers to register" checked={form.sellerRegistrationEnabled} onChange={(v) => handleChange('sellerRegistrationEnabled', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Customer Registration" description="Allow new customers to register" checked={form.customerRegistrationEnabled} onChange={(v) => handleChange('customerRegistrationEnabled', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Guest Checkout" description="Allow customers to checkout without login" checked={form.guestCheckout} onChange={(v) => handleChange('guestCheckout', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Auto Approve Sellers" description="Automatically approve new seller registrations" checked={form.autoApproveSeller} onChange={(v) => handleChange('autoApproveSeller', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsSwitch label="Auto Approve Products" description="Automatically approve new product listings" checked={form.autoApproveProduct} onChange={(v) => handleChange('autoApproveProduct', v)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="Platform Commission (%)" value={form.commissionPercentage} onChange={(v) => handleChange('commissionPercentage', v)} type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SettingsField label="GST on Commission (%)" value={form.gstPercentage} onChange={(v) => handleChange('gstPercentage', v)} type="number" />
                </Grid>
            </Grid>
        </SettingsSection>
    );
};

export default React.memo(MarketplaceSettings);
