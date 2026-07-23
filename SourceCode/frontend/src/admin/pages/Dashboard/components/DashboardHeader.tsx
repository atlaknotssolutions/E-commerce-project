import React from 'react';
import { Button, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    refreshing?: boolean;
    lastUpdated?: string | null;
    onRefresh?: () => void;
}

const formatLastUpdated = (isoString: string | null): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
    });
};

const DashboardHeader: React.FC<DashboardHeaderProps> = React.memo(({
    title,
    subtitle,
    refreshing = false,
    lastUpdated,
    onRefresh,
}) => {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                )}
                {lastUpdated && (
                    <p className="text-xs text-gray-400 mt-0.5">
                        Last updated: {formatLastUpdated(lastUpdated)}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Tooltip title="Search (coming soon)" arrow>
                    <Button
                        variant="outlined"
                        startIcon={<SearchIcon />}
                        size="small"
                        disabled
                        aria-label="Search dashboard"
                    >
                        Search
                    </Button>
                </Tooltip>
                {onRefresh && (
                    <Tooltip title={refreshing ? 'Refreshing...' : 'Refresh dashboard data'} arrow>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={onRefresh}
                            disabled={refreshing}
                            size="small"
                            aria-label={refreshing ? 'Refreshing dashboard data' : 'Refresh dashboard data'}
                        >
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </Tooltip>
                )}
            </div>
        </div>
    );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
