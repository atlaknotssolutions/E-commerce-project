import React from 'react';
import { Card, CardContent, CardHeader, Skeleton } from '@mui/material';

interface ChartContainerProps {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    loading?: boolean;
    height?: number;
}

const ChartContainer: React.FC<ChartContainerProps> = React.memo(({
    title,
    action,
    children,
    loading = false,
    height = 300,
}) => {
    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader
                    title={<Skeleton variant="text" width="40%" />}
                    action={action}
                />
                <CardContent>
                    <Skeleton variant="rounded" width="100%" height={height} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader
                title={<span className="text-sm font-semibold text-gray-700">{title}</span>}
                action={action}
            />
            <CardContent className="pt-0">
                <div style={{ height }}>
                    {children}
                </div>
            </CardContent>
        </Card>
    );
});

ChartContainer.displayName = 'ChartContainer';

export default ChartContainer;
