import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemText,
    Badge,
    Chip,
    Button,
    Skeleton,
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useAppSelector } from '../../../../Redux Toolkit/Store';

const PRIORITY_COLORS: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
    high: 'error',
    medium: 'warning',
    low: 'info',
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const NotificationsCard: React.FC = () => {
    const notifications = useAppSelector((state) => state.sellerDashboard.notifications);
    const unreadCount = useAppSelector((state) =>
        state.sellerDashboard.summary?.notifications.unreadNotifications ?? 0
    );
    const loading = useAppSelector((state) => state.sellerDashboard.loading);
    const refreshing = useAppSelector((state) => state.sellerDashboard.refreshing);

    const isLoading = loading || refreshing;

    const displayNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

    if (isLoading && notifications.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader title={<Skeleton variant="text" width="40%" />} />
                <CardContent>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 mb-3">
                            <Skeleton variant="circular" width={24} height={24} />
                            <div className="flex-1">
                                <Skeleton variant="text" width="80%" />
                                <Skeleton variant="text" width="40%" />
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
                title={
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">Notifications</span>
                        {unreadCount > 0 && (
                            <Badge badgeContent={unreadCount} color="error" max={99} aria-label={`${unreadCount} unread notifications`} />
                        )}
                    </div>
                }
                action={
                    <Button size="small" disabled aria-label="View all notifications">
                        View All
                    </Button>
                }
            />
            <CardContent className="pt-0">
                {displayNotifications.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8" role="status">
                        No notifications
                    </div>
                ) : (
                    <List disablePadding aria-label="Notifications list">
                        {displayNotifications.map((notification) => (
                            <ListItem key={notification.id} disablePadding className="mb-2">
                                <FiberManualRecordIcon
                                    sx={{
                                        fontSize: 10,
                                        color: notification.isRead ? '#CBD5E1' : '#4F46E5',
                                        mr: 1.5,
                                    }}
                                    aria-hidden="true"
                                />
                                <ListItemText
                                    primary={
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-800">
                                                {notification.title}
                                            </span>
                                            {notification.priority && notification.priority !== 'medium' && (
                                                <Chip
                                                    label={notification.priority}
                                                    color={PRIORITY_COLORS[notification.priority] || 'default'}
                                                    size="small"
                                                    sx={{ height: 18, fontSize: 10 }}
                                                    aria-label={`Priority: ${notification.priority}`}
                                                />
                                            )}
                                        </div>
                                    }
                                    secondary={
                                        <span className="text-xs text-gray-500">
                                            {formatDate(notification.createdAt)}
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

export default React.memo(NotificationsCard);
