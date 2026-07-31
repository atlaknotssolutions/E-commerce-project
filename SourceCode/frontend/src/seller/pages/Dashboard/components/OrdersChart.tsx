import React, { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { useAppSelector } from '../../../../Redux Toolkit/Store';
import ChartContainer from './ChartContainer';

const COLORS = ['#F97316', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899', '#64748B'];

const OrdersChart: React.FC = () => {
    const orders = useAppSelector((state) => state.sellerDashboard.orders);
    const loading = useAppSelector((state) => state.sellerDashboard.loading);

    const chartData = useMemo(() => {
        if (!orders?.statusDistribution) return [];
        return orders.statusDistribution.map((item) => ({
            name: item.status,
            value: item.count,
        }));
    }, [orders]);

    return (
        <ChartContainer
            title="Order Status Distribution"
            loading={loading && !orders}
            height={300}
        >
            {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm" role="status">
                    <span className="text-3xl mb-2">📊</span>
                    No order data available
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: number, name: string) => [value, name]}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </ChartContainer>
    );
};

export default React.memo(OrdersChart);
