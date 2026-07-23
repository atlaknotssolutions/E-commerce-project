import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Grid,
    Typography,
    CircularProgress,
} from '@mui/material';

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
    onSave: () => void;
    loading: boolean;
    hasChanges: boolean;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
    title,
    children,
    onSave,
    loading,
    hasChanges,
}) => (
    <Box className="space-y-4">
        <Box className="flex items-center justify-between">
            <Typography variant="h6" fontWeight={600}>{title}</Typography>
            <Button
                variant="contained"
                onClick={onSave}
                disabled={!hasChanges || loading}
            >
                {loading ? <CircularProgress size={20} /> : 'Save Changes'}
            </Button>
        </Box>
        {children}
    </Box>
);

interface SettingsFieldProps {
    label: string;
    value: any;
    onChange: (value: any) => void;
    type?: 'text' | 'number' | 'email' | 'color' | 'select';
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
    fullWidth?: boolean;
    multiline?: boolean;
    rows?: number;
}

export const SettingsField: React.FC<SettingsFieldProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    options,
    required = false,
    fullWidth = true,
    multiline = false,
    rows,
}) => {
    if (type === 'select' && options) {
        return (
            <TextField
                fullWidth={fullWidth}
                label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                select
                required={required}
                size="small"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </TextField>
        );
    }

    if (type === 'color') {
        return (
            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
                <Box className="flex items-center gap-2">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }}
                    />
                    <TextField
                        size="small"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        sx={{ width: 120 }}
                    />
                </Box>
            </Box>
        );
    }

    return (
        <TextField
            fullWidth={fullWidth}
            label={label}
            value={value}
            onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            type={type}
            required={required}
            size="small"
            multiline={multiline}
            rows={rows}
        />
    );
};

interface SettingsSwitchProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const SettingsSwitch: React.FC<SettingsSwitchProps> = ({
    label,
    description,
    checked,
    onChange,
}) => (
    <Box>
        <FormControlLabel
            control={<Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />}
            label={<Typography variant="body2" fontWeight={500}>{label}</Typography>}
        />
        {description && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 6 }}>
                {description}
            </Typography>
        )}
    </Box>
);
