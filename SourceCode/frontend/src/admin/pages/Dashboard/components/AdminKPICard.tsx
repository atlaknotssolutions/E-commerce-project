import React from 'react';
import { Card, CardContent, Skeleton, Tooltip } from '@mui/material';
import { SvgIconProps } from '@mui/material/SvgIcon';

interface AdminKPICardProps {
    icon: React.ReactElement<SvgIconProps>;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    loading?: boolean;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const AdminKPICard: React.FC<AdminKPICardProps> = React.memo(({
    icon,
    title,
    value,
    subtitle,
    color = '#4F46E5',
    loading = false,
    trend,
}) => {
    if (loading) {
        return (
            <Card className="h-full">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Skeleton variant="rounded" width={48} height={48} />
                        <div className="flex-1">
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="40%" height={32} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Tooltip title={`${title}: ${value}`} arrow>
            <Card
                className="h-full hover:shadow-md transition-shadow"
                role="group"
                aria-label={`${title}: ${value}`}
            >
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="rounded-lg p-2 flex items-center justify-center"
                            style={{ backgroundColor: `${color}15` }}
                            aria-hidden="true"
                        >
                            {React.cloneElement(icon, {
                                sx: { color, fontSize: 28 },
                            })}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 truncate">{title}</p>
                            <p className="text-xl font-bold text-gray-800">{value}</p>
                            <div className="flex items-center gap-2">
                                {subtitle && (
                                    <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                                )}
                                {trend && (
                                    <span
                                        className={`text-xs font-medium ${
                                            trend.isPositive ? 'text-green-600' : 'text-red-600'
                                        }`}
                                    >
                                        {trend.isPositive ? '+' : ''}{trend.value}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Tooltip>
    );
});

AdminKPICard.displayName = 'AdminKPICard';

export default AdminKPICard;
