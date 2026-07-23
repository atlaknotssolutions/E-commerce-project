import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import PeopleIcon from '@mui/icons-material/People';
import { SellerVerificationStats } from '../../../../types/sellerVerificationTypes';

interface VerificationStatsCardsProps {
    stats: SellerVerificationStats | null;
}

const StatCard = ({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: number;
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

const VerificationStatsCards: React.FC<VerificationStatsCardsProps> = ({ stats }) =>
{
    if (!stats) return null;

    return (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
                title="Pending Verification"
                value={stats.PENDING}
                icon={<PendingActionsIcon sx={{ fontSize: 40 }} />}
                color="#ed6c02"
            />
            <StatCard
                title="Approved Sellers"
                value={stats.APPROVED}
                icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                color="#2e7d32"
            />
            <StatCard
                title="Rejected Sellers"
                value={stats.REJECTED}
                icon={<CancelIcon sx={{ fontSize: 40 }} />}
                color="#d32f2f"
            />
            <StatCard
                title="Suspended Sellers"
                value={stats.SELLER_SUSPENDED}
                icon={<BlockIcon sx={{ fontSize: 40 }} />}
                color="#9c27b0"
            />
            <StatCard
                title="Total Sellers"
                value={stats.totalSellers}
                icon={<PeopleIcon sx={{ fontSize: 40 }} />}
                color="#1976d2"
            />
        </Box>
    );
};

export default React.memo(VerificationStatsCards);
