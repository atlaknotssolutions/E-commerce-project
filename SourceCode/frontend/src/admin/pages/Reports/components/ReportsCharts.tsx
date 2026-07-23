import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import {
    SalesDataPoint,
    RevenueDataPoint,
    OrderStatusBreakdown,
    ReturnReasonBreakdown,
    CouponUsageItem,
} from '../../../../types/adminReportsTypes';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
            {title}
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
            {children}
        </Box>
    </Paper>
);

interface SalesChartProps {
    data: SalesDataPoint[];
}

export const SalesTrendChart: React.FC<SalesChartProps> = ({ data }) => {
    const chartData = data.map((d) => ({
        date: d._id?.date || '',
        sales: d.totalSales,
        orders: d.orderCount,
    }));

    return (
        <ChartCard title="Sales Trend">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                    />
                    <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        fill="url(#salesGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

interface RevenueChartProps {
    data: RevenueDataPoint[];
}

export const RevenueTrendChart: React.FC<RevenueChartProps> = ({ data }) => {
    const chartData = data.map((d) => ({
        date: d._id?.date || '',
        revenue: d.grossRevenue,
        discount: d.totalDiscount,
    }));

    return (
        <ChartCard title="Revenue Trend">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="discountGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number, name: string) => [
                            `₹${value.toLocaleString('en-IN')}`,
                            name === 'revenue' ? 'Revenue' : 'Discount',
                        ]}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                    />
                    <Area
                        type="monotone"
                        dataKey="discount"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        fill="url(#discountGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

interface OrderStatusChartProps {
    data: OrderStatusBreakdown[];
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
    const chartData = data.map((d) => ({
        name: d._id,
        value: d.count,
    }));

    return (
        <ChartCard title="Orders by Status">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

interface ReturnReasonChartProps {
    data: ReturnReasonBreakdown[];
}

export const ReturnReasonChart: React.FC<ReturnReasonChartProps> = ({ data }) => {
    const chartData = data.map((d) => ({
        name: d._id,
        value: d.count,
    }));

    return (
        <ChartCard title="Returns by Reason">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

interface CouponUsageChartProps {
    data: CouponUsageItem[];
}

export const CouponUsageChart: React.FC<CouponUsageChartProps> = ({ data }) => {
    const chartData = data
        .filter((c) => c.usageCount > 0)
        .slice(0, 10)
        .map((d) => ({
            name: d.code,
            usage: d.usageCount,
        }));

    return (
        <ChartCard title="Coupon Usage (Top 10)">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

interface TopProductsChartProps {
    data: Array<{ title: string; totalRevenue: number }>;
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => {
    const chartData = data.slice(0, 10).map((d) => ({
        name: d.title.length > 20 ? d.title.substring(0, 20) + '...' : d.title,
        revenue: d.totalRevenue,
    }));

    return (
        <ChartCard title="Top Products by Revenue">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                    <Tooltip
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

interface TopSellersChartProps {
    data: Array<{ sellerName: string; totalRevenue: number }>;
}

export const TopSellersChart: React.FC<TopSellersChartProps> = ({ data }) => {
    const chartData = data.slice(0, 10).map((d) => ({
        name: d.sellerName || 'Unknown',
        revenue: d.totalRevenue,
    }));

    return (
        <ChartCard title="Top Sellers by Revenue">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};
