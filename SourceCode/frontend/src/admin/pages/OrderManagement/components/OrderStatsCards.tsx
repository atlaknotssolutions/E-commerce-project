import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { AdminOrderStats } from '../../../../types/adminOrderTypes';

interface OrderStatsCardsProps {
    stats: AdminOrderStats | null;
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

const OrderStatsCards: React.FC<OrderStatsCardsProps> = ({ stats }) =>
{
    if (!stats) return null;

    return (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
                title="Pending"
                value={stats.PENDING}
                icon={<PendingActionsIcon sx={{ fontSize: 40 }} />}
                color="#ed6c02"
            />
            <StatCard
                title="Placed"
                value={stats.PLACED}
                icon={<AssignmentIcon sx={{ fontSize: 40 }} />}
                color="#0288d1"
            />
            <StatCard
                title="Confirmed"
                value={stats.CONFIRMED}
                icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                color="#2e7d32"
            />
            <StatCard
                title="Packed"
                value={stats.PACKED}
                icon={<InventoryIcon sx={{ fontSize: 40 }} />}
                color="#7b1fa2"
            />
            <StatCard
                title="Shipped"
                value={stats.SHIPPED}
                icon={<FlightTakeoffIcon sx={{ fontSize: 40 }} />}
                color="#1565c0"
            />
            <StatCard
                title="Out for Delivery"
                value={stats.OUT_FOR_DELIVERY}
                icon={<DeliveryDiningIcon sx={{ fontSize: 40 }} />}
                color="#00838f"
            />
            <StatCard
                title="Delivered"
                value={stats.DELIVERED}
                icon={<LocalShippingIcon sx={{ fontSize: 40 }} />}
                color="#388e3c"
            />
            <StatCard
                title="Cancelled"
                value={stats.CANCELLED}
                icon={<CancelIcon sx={{ fontSize: 40 }} />}
                color="#d32f2f"
            />
            <StatCard
                title="Total Orders"
                value={stats.totalOrders}
                icon={<ShoppingBagIcon sx={{ fontSize: 40 }} />}
                color="#1976d2"
            />
        </Box>
    );
};

export default React.memo(OrderStatsCards);
