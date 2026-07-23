import React, { useMemo, useCallback } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../Redux Toolkit/Store';
import { fetchRevenueAnalytics } from '../../../../Redux Toolkit/Seller/sellerDashboardSlice';
import ChartContainer from './ChartContainer';

const PERIODS = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
];

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const RevenueChart: React.FC = () => {
    const dispatch = useAppDispatch();
    const revenue = useAppSelector((state) => state.sellerDashboard.revenue);
    const loading = useAppSelector((state) => state.sellerDashboard.loading);
    const refreshing = useAppSelector((state) => state.sellerDashboard.refreshing);

    const [period, setPeriod] = React.useState('monthly');

    React.useEffect(() => {
        dispatch(fetchRevenueAnalytics(period));
    }, [dispatch, period]);

    const chartData = useMemo(() => {
        if (!revenue?.chart) return [];
        return revenue.chart.labels.map((label, i) => ({
            label,
            revenue: revenue.chart.datasets[0]?.data[i] ?? 0,
        }));
    }, [revenue]);

    const handlePeriodChange = useCallback((event: SelectChangeEvent) => {
        setPeriod(event.target.value);
    }, []);

    const periodAction = (
        <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel id="revenue-period-label">Period</InputLabel>
            <Select
                labelId="revenue-period-label"
                value={period}
                label="Period"
                onChange={handlePeriodChange}
                aria-label="Select revenue chart period"
            >
                {PERIODS.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                        {p.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

    return (
        <ChartContainer
            title="Revenue Trend"
            action={periodAction}
            loading={loading && !revenue}
            height={300}
        >
            {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm" role="status">
                    No revenue data available
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                            labelFormatter={(label) => `Period: ${label}`}
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#revenueGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </ChartContainer>
    );
};

export default React.memo(RevenueChart);
