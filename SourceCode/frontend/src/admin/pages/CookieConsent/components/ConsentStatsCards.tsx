import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TodayIcon from '@mui/icons-material/Today';
import BarChartIcon from '@mui/icons-material/BarChart';
import MarketingIcon from '@mui/icons-material/Campaign';
import SettingsIcon from '@mui/icons-material/Settings';
import { ConsentStatistics } from '../../../../types/cookieConsentTypes';

interface ConsentStatsCardsProps {
    statistics: ConsentStatistics | null;
    loading: boolean;
}

const ConsentStatsCards: React.FC<ConsentStatsCardsProps> = ({ statistics, loading }) => {
    const cards = useMemo(() => {
        if (!statistics) return [];

        return [
            {
                icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
                title: 'Total Accepted',
                value: statistics.totalAccepted.toLocaleString(),
                color: '#10B981',
            },
            {
                icon: <TodayIcon sx={{ fontSize: 32 }} />,
                title: 'Accepted Today',
                value: statistics.acceptedToday.toLocaleString(),
                color: '#3B82F6',
            },
            {
                icon: <CancelIcon sx={{ fontSize: 32 }} />,
                title: 'Rejected',
                value: statistics.totalRejected.toLocaleString(),
                color: '#EF4444',
            },
            {
                icon: <BarChartIcon sx={{ fontSize: 32 }} />,
                title: 'Analytics',
                value: `${statistics.analyticsPercentage}%`,
                color: '#8B5CF6',
            },
            {
                icon: <MarketingIcon sx={{ fontSize: 32 }} />,
                title: 'Marketing',
                value: `${statistics.marketingPercentage}%`,
                color: '#F97316',
            },
            {
                icon: <SettingsIcon sx={{ fontSize: 32 }} />,
                title: 'Preferences',
                value: `${statistics.preferencesPercentage}%`,
                color: '#06B6D4',
            },
        ];
    }, [statistics]);

    if (loading && !statistics) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Box sx={{ width: 32, height: 32, mx: 'auto', mb: 1, bgcolor: '#f5f5f5', borderRadius: '50%' }} />
                            <Box sx={{ width: '60%', height: 16, mx: 'auto', mb: 1, bgcolor: '#f5f5f5', borderRadius: 1 }} />
                            <Box sx={{ width: '40%', height: 24, mx: 'auto', bgcolor: '#f5f5f5', borderRadius: 1 }} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {cards.map((card, index) => (
                <Card key={index} sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Box sx={{ color: card.color, mb: 1 }}>{card.icon}</Box>
                        <Typography variant="caption" color="text.secondary">{card.title}</Typography>
                        <Typography variant="h6" fontWeight={700} mt={0.5} color={card.color as never}>
                            {card.value}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default React.memo(ConsentStatsCards);
