import React, { useMemo } from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { useAppSelector } from '../../../../Redux Toolkit/Store';
import KpiCard from './KpiCard';

const formatCurrency = (value: number) =>
    `₹${value.toLocaleString('en-IN')}`;

const SummaryCards: React.FC = () => {
    const summary = useAppSelector((state) => state.sellerDashboard.summary);
    const loading = useAppSelector((state) => state.sellerDashboard.loading);
    const refreshing = useAppSelector((state) => state.sellerDashboard.refreshing);

    const isLoading = loading || refreshing;

    const cards = useMemo(() => {
        if (!summary) return [];

        return [
            {
                icon: <AccountBalanceIcon />,
                title: 'Total Revenue',
                value: formatCurrency(summary.sales.totalRevenue),
                color: '#4F46E5',
            },
            {
                icon: <TrendingUpIcon />,
                title: "Today's Revenue",
                value: formatCurrency(summary.sales.todayRevenue),
                color: '#10B981',
            },
            {
                icon: <AttachMoneyIcon />,
                title: 'Monthly Revenue',
                value: formatCurrency(summary.sales.monthlyRevenue),
                color: '#F59E0B',
            },
            {
                icon: <ShoppingCartIcon />,
                title: 'Total Orders',
                value: summary.orders.totalOrders,
                color: '#3B82F6',
            },
            {
                icon: <PendingActionsIcon />,
                title: 'Pending Orders',
                value: summary.orders.pendingOrders,
                color: '#F97316',
            },
            {
                icon: <CheckCircleIcon />,
                title: 'Delivered Orders',
                value: summary.orders.deliveredOrders,
                color: '#22C55E',
            },
            {
                icon: <CancelIcon />,
                title: 'Cancelled Orders',
                value: summary.orders.cancelledOrders,
                color: '#EF4444',
            },
            {
                icon: <InventoryIcon />,
                title: 'Total Products',
                value: summary.products.totalProducts,
                subtitle: `${summary.products.activeProducts} active`,
                color: '#8B5CF6',
            },
            {
                icon: <Inventory2Icon />,
                title: 'Out of Stock',
                value: summary.products.outOfStockProducts,
                color: '#EC4899',
            },
            {
                icon: <PeopleIcon />,
                title: 'Reviews',
                value: summary.reviews.totalReviews,
                subtitle: `${summary.reviews.averageRating}★ avg rating`,
                color: '#06B6D4',
            },
            {
                icon: <AssignmentReturnIcon />,
                title: 'Returns',
                value: summary.returns.totalReturns,
                subtitle: `${summary.returns.pendingReturns} pending`,
                color: '#F43F5E',
            },
            {
                icon: <NotificationsIcon />,
                title: 'Unread Notifications',
                value: summary.notifications.unreadNotifications,
                color: '#A855F7',
            },
        ];
    }, [summary]);

    if (isLoading && !summary) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <KpiCard
                        key={i}
                        icon={<AccountBalanceIcon />}
                        title=""
                        value=""
                        loading
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Dashboard KPI cards">
            {cards.map((card, index) => (
                <div key={index} role="listitem">
                    <KpiCard
                        icon={card.icon}
                        title={card.title}
                        value={card.value}
                        subtitle={card.subtitle}
                        color={card.color}
                        loading={isLoading}
                    />
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;
