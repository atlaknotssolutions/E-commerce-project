import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ErrorIcon from '@mui/icons-material/Error';
import ArchiveIcon from '@mui/icons-material/Archive';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { NotificationStatistics } from '../../../../types/adminNotificationTypes';

interface NotificationStatisticsProps {
    statistics: NotificationStatistics | null;
}

const StatCard = ({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: string | number;
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

const NotificationStatsCards: React.FC<NotificationStatisticsProps> = ({ statistics }) => {
    if (!statistics) return null;

    return (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <StatCard
                title="Total"
                value={statistics.totalNotifications}
                icon={<NotificationsIcon sx={{ fontSize: 40 }} />}
                color="#4F46E5"
            />
            <StatCard
                title="Published"
                value={statistics.published}
                icon={<SendIcon sx={{ fontSize: 40 }} />}
                color="#2e7d32"
            />
            <StatCard
                title="Scheduled"
                value={statistics.scheduled}
                icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                color="#0288d1"
            />
            <StatCard
                title="Draft"
                value={statistics.draft}
                icon={<EditNoteIcon sx={{ fontSize: 40 }} />}
                color="#ed6c02"
            />
            <StatCard
                title="Failed"
                value={statistics.failed}
                icon={<ErrorIcon sx={{ fontSize: 40 }} />}
                color="#d32f2f"
            />
            <StatCard
                title="Archived"
                value={statistics.archived}
                icon={<ArchiveIcon sx={{ fontSize: 40 }} />}
                color="#757575"
            />
            <StatCard
                title="Delivery Rate"
                value={`${statistics.deliveryRate}%`}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="#00838f"
            />
            <StatCard
                title="Read Count"
                value={statistics.readCount}
                icon={<VisibilityIcon sx={{ fontSize: 40 }} />}
                color="#9c27b0"
            />
        </Box>
    );
};

export default React.memo(NotificationStatsCards);
