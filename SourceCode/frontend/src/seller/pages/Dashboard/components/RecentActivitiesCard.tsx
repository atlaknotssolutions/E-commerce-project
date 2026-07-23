import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Skeleton,
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useAppSelector } from '../../../../Redux Toolkit/Store';

const ACTIVITY_ICONS: Record<string, React.ReactElement> = {
    NEW_ORDER: <ShoppingBagIcon sx={{ fontSize: 20 }} />,
    PAYMENT_RECEIVED: <PaymentIcon sx={{ fontSize: 20 }} />,
    RETURN_REQUEST: <AssignmentReturnIcon sx={{ fontSize: 20 }} />,
    PRODUCT_UPDATE: <InventoryIcon sx={{ fontSize: 20 }} />,
};

const ACTIVITY_COLORS: Record<string, string> = {
    NEW_ORDER: '#3B82F6',
    PAYMENT_RECEIVED: '#22C55E',
    RETURN_REQUEST: '#F97316',
    PRODUCT_UPDATE: '#8B5CF6',
};

const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
};

const RecentActivitiesCard: React.FC = () => {
    const activities = useAppSelector((state) => state.sellerDashboard.recentActivities);
    const loading = useAppSelector((state) => state.sellerDashboard.loading);
    const refreshing = useAppSelector((state) => state.sellerDashboard.refreshing);

    const isLoading = loading || refreshing;

    if (isLoading && activities.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader title={<Skeleton variant="text" width="40%" />} />
                <CardContent>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 mb-3">
                            <Skeleton variant="circular" width={40} height={40} />
                            <div className="flex-1">
                                <Skeleton variant="text" width="70%" />
                                <Skeleton variant="text" width="50%" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader
                title={<span className="text-sm font-semibold text-gray-700">Recent Activities</span>}
            />
            <CardContent className="pt-0">
                {activities.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8" role="status">
                        No recent activities
                    </div>
                ) : (
                    <List disablePadding aria-label="Recent activities feed">
                        {activities.slice(0, 8).map((activity) => (
                            <ListItem key={activity.id} disablePadding className="mb-2">
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: `${ACTIVITY_COLORS[activity.type] || '#64748B'}20`,
                                            color: ACTIVITY_COLORS[activity.type] || '#64748B',
                                        }}
                                        aria-hidden="true"
                                    >
                                        {ACTIVITY_ICONS[activity.type] || <InventoryIcon sx={{ fontSize: 20 }} />}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <span className="text-sm font-medium text-gray-800">
                                            {activity.title}
                                        </span>
                                    }
                                    secondary={
                                        <span className="text-xs text-gray-500">
                                            {activity.description} · {formatTimeAgo(activity.timestamp)}
                                        </span>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

export default React.memo(RecentActivitiesCard);
