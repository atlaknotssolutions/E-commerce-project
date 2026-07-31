import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '../../../../Redux Toolkit/Store';
import ChartContainer from './ChartContainer';

const SalesTrendChart: React.FC = () => {
    const orders = useAppSelector((state) => state.sellerDashboard.orders);
    const loading = useAppSelector((state) => state.sellerDashboard.loading);

    const chartData = useMemo(() => {
        if (!orders?.recentOrders) return [];

        const monthlyData: Record<string, { month: string; orders: number; revenue: number }> = {};

        orders.recentOrders.forEach((order) => {
            const date = new Date(order.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

            if (!monthlyData[key]) {
                monthlyData[key] = { month: monthLabel, orders: 0, revenue: 0 };
            }
            monthlyData[key].orders += 1;
            monthlyData[key].revenue += order.totalAmount;
        });

        return Object.values(monthlyData).slice(-6);
    }, [orders]);

    return (
        <ChartContainer
            title="Monthly Sales Trend"
            loading={loading && !orders}
            height={300}
        >
            {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm" role="status">
                    <span className="text-3xl mb-2">📈</span>
                    No sales data available
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: number, name: string) => [
                                name === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : value,
                                name === 'revenue' ? 'Revenue' : 'Orders',
                            ]}
                        />
                        <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="orders" fill="#22C55E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </ChartContainer>
    );
};

export default React.memo(SalesTrendChart);
