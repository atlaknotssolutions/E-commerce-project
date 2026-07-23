import React from 'react';
import { Card, CardContent, Skeleton } from '@mui/material';
import { SvgIconProps } from '@mui/material/SvgIcon';

interface KpiCardProps {
    icon: React.ReactElement<SvgIconProps>;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = React.memo(({
    icon,
    title,
    value,
    subtitle,
    color = '#4F46E5',
    loading = false,
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
        <Card className="h-full hover:shadow-md transition-shadow" role="group" aria-label={`${title}: ${value}`}>
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
                        {subtitle && (
                            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

KpiCard.displayName = 'KpiCard';

export default KpiCard;
