import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useAppSelector } from '../../../../Redux Toolkit/Store';

interface StatItem {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

const QuickStatsCard: React.FC = () => {
    const summary = useAppSelector((state) => state.sellerDashboard.summary);
    const orders = useAppSelector((state) => state.sellerDashboard.orders);
    const customers = useAppSelector((state) => state.sellerDashboard.customers);
    const loading = useAppSelector((state) => state.sellerDashboard.loading);
    const refreshing = useAppSelector((state) => state.sellerDashboard.refreshing);

    const isLoading = loading || refreshing;

    const stats = useMemo<StatItem[]>(() => {
        const items: StatItem[] = [];

        if (summary) {
            items.push({
                label: 'Weekly Revenue',
                value: `₹${summary.sales.weeklyRevenue.toLocaleString('en-IN')}`,
            });
            items.push({
                label: 'Active Products',
                value: summary.products.activeProducts,
            });
        }

        if (orders?.revenue) {
            items.push({
                label: 'Avg Order Value',
                value: `₹${orders.revenue.averageOrderValue.toLocaleString('en-IN')}`,
            });
        }

        if (customers?.growth) {
            const trend = customers.growth.growthPercentage >= 0 ? 'up' : 'down';
            items.push({
                label: 'Customer Growth',
                value: `${Math.abs(customers.growth.growthPercentage).toFixed(1)}%`,
                trend,
                trendValue: `${customers.growth.currentMonth} this month`,
            });
        }

        return items;
    }, [summary, orders, customers]);

    if (isLoading && !summary) {
        return (
            <Card className="h-full">
                <CardHeader title={<Skeleton variant="text" width="30%" />} />
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i}>
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="40%" height={28} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader
                title={<span className="text-sm font-semibold text-gray-700">Quick Stats</span>}
            />
            <CardContent className="pt-0">
                {stats.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4" role="status">
                        No stats available
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4" role="list" aria-label="Quick statistics">
                        {stats.map((stat, index) => (
                            <div key={index} role="listitem">
                                <p className="text-xs text-gray-500">{stat.label}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                                    {stat.trend === 'up' && (
                                        <TrendingUpIcon sx={{ fontSize: 16, color: '#22C55E' }} aria-label="Trending up" />
                                    )}
                                    {stat.trend === 'down' && (
                                        <TrendingDownIcon sx={{ fontSize: 16, color: '#EF4444' }} aria-label="Trending down" />
                                    )}
                                </div>
                                {stat.trendValue && (
                                    <p className="text-xs text-gray-400">{stat.trendValue}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default React.memo(QuickStatsCard);
