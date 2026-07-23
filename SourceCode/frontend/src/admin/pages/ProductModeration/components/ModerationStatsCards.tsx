import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PublicIcon from '@mui/icons-material/Public';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StarIcon from '@mui/icons-material/Star';
import InventoryIcon from '@mui/icons-material/Inventory';
import { ProductModerationStats } from '../../../../types/productModerationTypes';

interface ModerationStatsCardsProps {
    stats: ProductModerationStats | null;
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

const ModerationStatsCards: React.FC<ModerationStatsCardsProps> = ({ stats }) =>
{
    if (!stats) return null;

    return (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Pending Approval"
                value={stats.PENDING}
                icon={<PendingActionsIcon sx={{ fontSize: 40 }} />}
                color="#ed6c02"
            />
            <StatCard
                title="Approved"
                value={stats.APPROVED}
                icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                color="#2e7d32"
            />
            <StatCard
                title="Published"
                value={stats.PUBLISHED}
                icon={<PublicIcon sx={{ fontSize: 40 }} />}
                color="#1976d2"
            />
            <StatCard
                title="Featured"
                value={stats.featured}
                icon={<StarIcon sx={{ fontSize: 40 }} />}
                color="#ffc107"
            />
        </Box>
    );
};

export default React.memo(ModerationStatsCards);
