import React from 'react';
import { Card, CardContent, Skeleton } from '@mui/material';

const AdminDashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="Loading admin dashboard">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <Skeleton variant="text" width={200} height={40} />
                    <Skeleton variant="text" width={300} height={20} />
                </div>
                <div className="flex gap-2">
                    <Skeleton variant="rounded" width={100} height={36} />
                    <Skeleton variant="rounded" width={100} height={36} />
                </div>
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 16 }).map((_, i) => (
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
            <span className="sr-only">Loading admin dashboard content...</span>
        </div>
    );
};

export default React.memo(AdminDashboardSkeleton);
