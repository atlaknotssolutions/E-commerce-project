import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReplayIcon from '@mui/icons-material/Replay';
import { DashboardSummary } from '../../../../types/adminReportsTypes';

interface ReportsDashboardProps {
    dashboard: DashboardSummary | null;
}

const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
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
                {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Paper>
);

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ dashboard }) => {
    if (!dashboard) return null;

    return (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatCard
                title="Gross Revenue"
                value={dashboard.grossRevenue}
                icon={<AttachMoneyIcon sx={{ fontSize: 40 }} />}
                color="#2e7d32"
            />
            <StatCard
                title="Net Revenue"
                value={dashboard.netRevenue}
                icon={<AccountBalanceIcon sx={{ fontSize: 40 }} />}
                color="#1565c0"
            />
            <StatCard
                title="Total Orders"
                value={dashboard.totalOrders}
                icon={<ShoppingCartIcon sx={{ fontSize: 40 }} />}
                color="#7b1fa2"
            />
            <StatCard
                title="Total Products"
                value={dashboard.totalProducts}
                icon={<InventoryIcon sx={{ fontSize: 40 }} />}
                color="#0288d1"
            />
            <StatCard
                title="Total Customers"
                value={dashboard.totalCustomers}
                icon={<PeopleIcon sx={{ fontSize: 40 }} />}
                color="#00838f"
            />
            <StatCard
                title="Active Sellers"
                value={dashboard.totalSellers}
                icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
                color="#ed6c02"
            />
            <StatCard
                title="Coupons Used"
                value={dashboard.couponsUsed}
                icon={<LocalOfferIcon sx={{ fontSize: 40 }} />}
                color="#9c27b0"
            />
            <StatCard
                title="Total Refunds"
                value={dashboard.totalRefunds}
                icon={<ReplayIcon sx={{ fontSize: 40 }} />}
                color="#d32f2f"
            />
            <StatCard
                title="Return Rate"
                value={`${dashboard.returnRate}%`}
                icon={<TrendingDownIcon sx={{ fontSize: 40 }} />}
                color="#f57c00"
                subtitle={`${dashboard.totalReturns} returns`}
            />
        </Box>
    );
};

export default React.memo(ReportsDashboard);
