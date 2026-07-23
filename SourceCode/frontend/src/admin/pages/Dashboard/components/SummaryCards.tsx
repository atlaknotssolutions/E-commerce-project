import React, { useMemo } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import InventoryIcon from '@mui/icons-material/Inventory';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import { useAppSelector } from '../../../../Redux Toolkit/Store';
import AdminKPICard from './AdminKPICard';

const formatCurrency = (value: number) =>
    `₹${value.toLocaleString('en-IN')}`;

const SummaryCards: React.FC = () => {
    const analytics = useAppSelector((state) => state.adminDashboard.analytics);
    const loading = useAppSelector((state) => state.adminDashboard.loading);

    const cards = useMemo(() => {
        if (!analytics) return [];

        return [
            {
                icon: <PeopleIcon />,
                title: 'Total Users',
                value: analytics.users.totalUsers,
                color: '#4F46E5',
            },
            {
                icon: <PersonIcon />,
                title: 'Total Customers',
                value: analytics.users.totalCustomers,
                color: '#3B82F6',
            },
            {
                icon: <StorefrontIcon />,
                title: 'Total Sellers',
                value: analytics.users.totalSellers,
                subtitle: `${analytics.users.pendingSellers} pending`,
                color: '#8B5CF6',
            },
            {
                icon: <PendingActionsIcon />,
                title: 'Pending Sellers',
                value: analytics.users.pendingSellers,
                color: '#F97316',
            },
            {
                icon: <InventoryIcon />,
                title: 'Total Products',
                value: analytics.products.totalProducts,
                color: '#10B981',
            },
            {
                icon: <CheckCircleIcon />,
                title: 'Active Products',
                value: analytics.products.activeProducts,
                color: '#22C55E',
            },
            {
                icon: <Inventory2Icon />,
                title: 'Out of Stock',
                value: analytics.products.outOfStockProducts,
                color: '#EF4444',
            },
            {
                icon: <ShoppingCartIcon />,
                title: 'Total Orders',
                value: analytics.orders.totalOrders,
                color: '#06B6D4',
            },
            {
                icon: <CheckCircleIcon />,
                title: 'Delivered Orders',
                value: analytics.orders.deliveredOrders,
                color: '#16A34A',
            },
            {
                icon: <HourglassEmptyIcon />,
                title: 'Pending Orders',
                value: analytics.orders.pendingOrders,
                color: '#EAB308',
            },
            {
                icon: <CancelIcon />,
                title: 'Cancelled Orders',
                value: analytics.orders.cancelledOrders,
                color: '#DC2626',
            },
            {
                icon: <AttachMoneyIcon />,
                title: 'Total Revenue',
                value: formatCurrency(analytics.revenue.totalRevenue),
                color: '#059669',
            },
            {
                icon: <TodayIcon />,
                title: "Today's Revenue",
                value: formatCurrency(analytics.revenue.todayRevenue),
                color: '#0D9488',
            },
            {
                icon: <DateRangeIcon />,
                title: 'This Month Revenue',
                value: formatCurrency(analytics.revenue.thisMonthRevenue),
                color: '#7C3AED',
            },
            {
                icon: <TrendingUpIcon />,
                title: 'Average Order Value',
                value: formatCurrency(analytics.revenue.averageOrderValue),
                color: '#2563EB',
            },
            {
                icon: <StarIcon />,
                title: 'Total Reviews',
                value: analytics.reviews.totalReviews,
                subtitle: `${analytics.reviews.averageRating}★ avg`,
                color: '#F59E0B',
            },
        ];
    }, [analytics]);

    if (loading && !analytics) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 16 }).map((_, i) => (
                    <AdminKPICard
                        key={i}
                        icon={<PeopleIcon />}
                        title=""
                        value=""
                        loading
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Admin dashboard analytics cards">
            {cards.map((card, index) => (
                <div key={index} role="listitem">
                    <AdminKPICard
                        icon={card.icon}
                        title={card.title}
                        value={card.value}
                        subtitle={card.subtitle}
                        color={card.color}
                        loading={loading}
                    />
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;
