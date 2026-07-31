import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CountryDistribution } from '../../../../types/cookieConsentTypes';

interface CountryDistributionChartProps {
    data: CountryDistribution[];
    loading: boolean;
}

const COLORS = ['#00927c', '#3B82F6', '#8B5CF6', '#F97316', '#EF4444', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];

const CountryDistributionChart: React.FC<CountryDistributionChartProps> = ({ data, loading }) => {
    if (loading && data.length === 0) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>Country Distribution</Typography>
                    <Box sx={{ width: '100%', height: 300, bgcolor: '#f5f5f5', borderRadius: 1 }} />
                </CardContent>
            </Card>
        );
    }

    if (data.length === 0) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>Country Distribution</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <Typography color="text.secondary">No consent data available</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    const chartData = data.map((item) => ({
        name: item.country || 'Unknown',
        value: item.count,
    }));

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Country Distribution</Typography>
                <ResponsiveContainer width="100%" height={300}>
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
                        <Tooltip formatter={(value: number) => [`${value} consents`, 'Count']} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default React.memo(CountryDistributionChart);
