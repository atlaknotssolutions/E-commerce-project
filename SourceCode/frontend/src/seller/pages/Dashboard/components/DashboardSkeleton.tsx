import React from 'react';
import { Card, CardContent, Skeleton } from '@mui/material';

const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="h-[88px]">
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
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent>
                            <Skeleton variant="text" width="30%" />
                            <Skeleton variant="rounded" width="100%" height={300} className="mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Lists Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent>
                            <Skeleton variant="text" width="40%" />
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} className="flex items-center gap-3 mt-3">
                                    <Skeleton variant="circular" width={40} height={40} />
                                    <div className="flex-1">
                                        <Skeleton variant="text" width="70%" />
                                        <Skeleton variant="text" width="50%" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <span className="sr-only">Loading dashboard content...</span>
        </div>
    );
};

export default React.memo(DashboardSkeleton);
