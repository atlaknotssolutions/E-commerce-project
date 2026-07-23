import React from 'react';
import {
    Box,
    TextField,
    MenuItem,
    Button,
    InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { NotificationFilters as NotificationFiltersType } from '../../../../types/adminNotificationTypes';
import { NOTIFICATION_TYPE_LABELS, AUDIENCE_LABELS, STATUS_LABELS } from '../../../../types/adminNotificationTypes';

interface NotificationFiltersProps {
    filters: NotificationFiltersType;
    onFilterChange: (field: keyof NotificationFiltersType, value: any) => void;
    onApply: () => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
    filters,
    onFilterChange,
    onApply,
}) => {
    return (
        <Box className="flex flex-wrap gap-3 items-end">
            <TextField
                label="Search"
                size="small"
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                sx={{ minWidth: 200 }}
            />
            <TextField
                label="Status"
                size="small"
                select
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value)}
                sx={{ minWidth: 140 }}
            >
                <MenuItem value="">All</MenuItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
            </TextField>
            <TextField
                label="Type"
                size="small"
                select
                value={filters.notificationType}
                onChange={(e) => onFilterChange('notificationType', e.target.value)}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">All</MenuItem>
                {Object.entries(NOTIFICATION_TYPE_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
            </TextField>
            <TextField
                label="Audience"
                size="small"
                select
                value={filters.targetAudience}
                onChange={(e) => onFilterChange('targetAudience', e.target.value)}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">All</MenuItem>
                {Object.entries(AUDIENCE_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
            </TextField>
            <TextField
                label="Start Date"
                type="date"
                size="small"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange('startDate', e.target.value || null)}
                InputLabelProps={{ shrink: true }}
            />
            <TextField
                label="End Date"
                type="date"
                size="small"
                value={filters.endDate || ''}
                onChange={(e) => onFilterChange('endDate', e.target.value || null)}
                InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={onApply}>
                Apply
            </Button>
        </Box>
    );
};

export default React.memo(NotificationFilters);
