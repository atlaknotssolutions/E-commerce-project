import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { CouponStatistics } from '../../../../types/couponTypes';

interface CouponStatsCardsProps {
    stats: CouponStatistics | null;
}

const StatCard = ({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}) => (
    <Paper
        elevation={1}
        sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderLeft: `4px solid ${color}`,
        }}
    >
        <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h4" fontWeight={700}>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
        </Box>
    </Paper>
);

const CouponStatsCards: React.FC<CouponStatsCardsProps> = ({ stats }) =>
{
    if (!stats) return null;

    return (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
                title="Total Coupons"
                value={stats.total}
                icon={<LocalOfferIcon sx={{ fontSize: 40 }} />}
                color="#1976d2"
            />
            <StatCard
                title="Active Coupons"
                value={stats.active}
                icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                color="#2e7d32"
            />
            <StatCard
                title="Expired"
                value={stats.expired}
                icon={<CancelIcon sx={{ fontSize: 40 }} />}
                color="#ed6c02"
            />
            <StatCard
                title="Disabled"
                value={stats.disabled}
                icon={<BlockIcon sx={{ fontSize: 40 }} />}
                color="#d32f2f"
            />
            <StatCard
                title="Total Uses"
                value={stats.totalUsageCount}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="#7b1fa2"
            />
            <StatCard
                title="Most Used"
                value={stats.mostUsedCoupon ? `${stats.mostUsedCoupon.code} (${stats.mostUsedCoupon.usageCount})` : 'N/A'}
                icon={<LocalOfferIcon sx={{ fontSize: 40 }} />}
                color="#00838f"
            />
        </Box>
    );
};

export default React.memo(CouponStatsCards);
