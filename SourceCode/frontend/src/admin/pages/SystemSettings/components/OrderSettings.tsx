import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Grid, TextField, Switch, Box, Typography } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import type { OrderSettings as O, ReturnSettings as R } from '../../../../types/adminSystemSettingsTypes';
import SettingsCard from './SettingsCard';
import StickySaveBar from './StickySaveBar';
import { notification } from '../../../../services/notificationService';

interface Props {
  settings: O | null;
  returnsSettings: R | null;
  onSaveOrders: (data: Partial<O>) => void;
  onSaveReturns: (data: Partial<R>) => void;
  loading: boolean;
  saving: boolean;
}

const orderDefaults: O = { orderCancellationWindow: 24, returnWindow: 30, codEnabled: true, onlinePaymentEnabled: true, freeShippingThreshold: 0 };
const returnDefaults: R = { returnEnabled: true, refundEnabled: true, replacementEnabled: true, returnDays: 30, autoRefund: false };

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, bgcolor: '#FFFFFF',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5', borderWidth: 2 },
    transition: 'all 0.15s ease',
  },
  '& .MuiInputLabel-root': { fontWeight: 500, color: '#6B7280', '&.Mui-focused': { color: '#4F46E5' } },
  '& .MuiInputBase-input': { fontSize: 14 },
};

const SwitchCard: React.FC<{ label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      p: 2, borderRadius: 2, border: '1px solid', borderColor: '#F3F4F6',
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

const OrderSettings: React.FC<Props> = ({ settings, returnsSettings, onSaveOrders, onSaveReturns, loading, saving }) => {
  const [o, setO] = useState<O>(settings || orderDefaults);
  const [r, setR] = useState<R>(returnsSettings || returnDefaults);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const orderBaselineRef = useRef<O | null>(settings);
  const returnBaselineRef = useRef<R | null>(returnsSettings);

  useEffect(() => {
    if (settings && JSON.stringify(settings) !== JSON.stringify(orderBaselineRef.current)) {
      orderBaselineRef.current = settings;
      setO(settings);
      setDirty(false);
    }
  }, [settings]);

  useEffect(() => {
    if (returnsSettings && JSON.stringify(returnsSettings) !== JSON.stringify(returnBaselineRef.current)) {
      returnBaselineRef.current = returnsSettings;
      setR(returnsSettings);
      setDirty(false);
    }
  }, [returnsSettings]);

  const hasChanges = useMemo(() => {
    const oChanged = (Object.keys(orderDefaults) as Array<keyof O>).some((k) => String(o[k]) !== String(settings?.[k] ?? ''));
    const rChanged = (Object.keys(returnDefaults) as Array<keyof R>).some((k) => String(r[k]) !== String(returnsSettings?.[k] ?? ''));
    return oChanged || rChanged;
  }, [o, r, settings, returnsSettings]);

  const setOrder = (key: keyof O, value: any) => {
    setO((p) => ({ ...p, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const setReturn = (key: keyof R, value: any) => {
    setR((p) => ({ ...p, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (o.orderCancellationWindow < 0) next.orderCancellationWindow = 'Must be 0 or more';
    if (o.returnWindow < 0) next.returnWindow = 'Must be 0 or more';
    if (o.freeShippingThreshold < 0) next.freeShippingThreshold = 'Must be 0 or more';
    if (r.returnDays < 1) next.returnDays = 'Must be at least 1';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      notification.error('Please fix the highlighted fields before saving.');
      return;
    }
    onSaveOrders(o);
    onSaveReturns(r);
    setDirty(false);
  };

  return (
    <>
      <SettingsCard icon={<ShoppingCartIcon />} title="Order Settings" description="Order lifecycle, payment methods, and shipping thresholds.">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Cancellation Window (hrs)" type="number" value={o.orderCancellationWindow}
              onChange={(e) => setOrder('orderCancellationWindow', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.orderCancellationWindow} helperText={errors.orderCancellationWindow || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Return Window (days)" type="number" value={o.returnWindow}
              onChange={(e) => setOrder('returnWindow', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.returnWindow} helperText={errors.returnWindow || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Free Shipping Threshold (₹)" type="number" value={o.freeShippingThreshold}
              onChange={(e) => setOrder('freeShippingThreshold', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.freeShippingThreshold} helperText={errors.freeShippingThreshold || ' '} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="COD Enabled" desc="Allow cash on delivery" checked={o.codEnabled} onChange={(v) => setOrder('codEnabled', v)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SwitchCard label="Online Payment" desc="Accept online payments" checked={o.onlinePaymentEnabled} onChange={(v) => setOrder('onlinePaymentEnabled', v)} />
          </Grid>
        </Grid>
      </SettingsCard>

      <SettingsCard icon={<ReplyAllIcon />} title="Return & Refund Settings" description="Configure return, refund, and replacement policies.">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <SwitchCard label="Returns Enabled" checked={r.returnEnabled} onChange={(v) => setReturn('returnEnabled', v)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SwitchCard label="Refunds Enabled" checked={r.refundEnabled} onChange={(v) => setReturn('refundEnabled', v)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SwitchCard label="Replacements Enabled" checked={r.replacementEnabled} onChange={(v) => setReturn('replacementEnabled', v)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Return Window (days)" type="number" value={r.returnDays}
              onChange={(e) => setReturn('returnDays', Number(e.target.value))} sx={FIELD_SX}
              error={!!errors.returnDays} helperText={errors.returnDays || ' '} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SwitchCard label="Auto Refund" desc="Auto-process refunds on return approval" checked={r.autoRefund} onChange={(v) => setReturn('autoRefund', v)} />
          </Grid>
        </Grid>
      </SettingsCard>

      <StickySaveBar hasChanges={hasChanges || dirty} saving={saving} onSave={handleSave}
        onDiscard={() => { setO(settings || orderDefaults); setR(returnsSettings || returnDefaults); setDirty(false); }} />
    </>
  );
};

export default OrderSettings;
