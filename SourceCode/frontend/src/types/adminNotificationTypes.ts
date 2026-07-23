export type NotificationType =
    | 'SYSTEM'
    | 'PLATFORM_ANNOUNCEMENT'
    | 'PROMOTIONAL'
    | 'MAINTENANCE'
    | 'SECURITY'
    | 'ORDER'
    | 'RETURN'
    | 'COUPON';

export type TargetAudience =
    | 'ALL_USERS'
    | 'ALL_CUSTOMERS'
    | 'ALL_SELLERS'
    | 'SPECIFIC_CUSTOMER'
    | 'SPECIFIC_SELLER'
    | 'SELECTED_CUSTOMERS'
    | 'SELECTED_SELLERS';

export type NotificationStatus =
    | 'DRAFT'
    | 'SCHEDULED'
    | 'PUBLISHED'
    | 'DELIVERED'
    | 'FAILED'
    | 'ARCHIVED';

export interface AdminNotification {
    _id: string;
    title: string;
    message: string;
    notificationType: NotificationType;
    targetAudience: TargetAudience;
    targetUsers: string[];
    targetSellers: string[];
    status: NotificationStatus;
    scheduledAt: string | null;
    publishedAt: string | null;
    deliveredAt: string | null;
    failedAt: string | null;
    archivedAt: string | null;
    deliveredCount: number;
    failedCount: number;
    readCount: number;
    errorLog: string | null;
    createdBy: {
        _id: string;
        fullName?: string;
        email?: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface NotificationStatistics {
    totalNotifications: number;
    published: number;
    scheduled: number;
    draft: number;
    failed: number;
    archived: number;
    delivered: number;
    deliveredCount: number;
    readCount: number;
    deliveryRate: string;
}

export interface NotificationFilters {
    status: string;
    notificationType: string;
    targetAudience: string;
    search: string;
    startDate: string | null;
    endDate: string | null;
    page: number;
    limit: number;
}

export interface AdminNotificationState {
    notifications: AdminNotification[];
    selectedNotification: AdminNotification | null;
    statistics: NotificationStatistics | null;
    pagination: NotificationPagination | null;
    loading: boolean;
    error: string | null;
    loaded: boolean;
    actionSuccess: boolean;
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
    SYSTEM: 'System',
    PLATFORM_ANNOUNCEMENT: 'Platform Announcement',
    PROMOTIONAL: 'Promotional',
    MAINTENANCE: 'Maintenance Notice',
    SECURITY: 'Security Alert',
    ORDER: 'Order Notification',
    RETURN: 'Return Notification',
    COUPON: 'Coupon Notification',
};

export const AUDIENCE_LABELS: Record<TargetAudience, string> = {
    ALL_USERS: 'All Users',
    ALL_CUSTOMERS: 'All Customers',
    ALL_SELLERS: 'All Sellers',
    SPECIFIC_CUSTOMER: 'Specific Customer',
    SPECIFIC_SELLER: 'Specific Seller',
    SELECTED_CUSTOMERS: 'Selected Customers',
    SELECTED_SELLERS: 'Selected Sellers',
};

export const STATUS_LABELS: Record<NotificationStatus, string> = {
    DRAFT: 'Draft',
    SCHEDULED: 'Scheduled',
    PUBLISHED: 'Published',
    DELIVERED: 'Delivered',
    FAILED: 'Failed',
    ARCHIVED: 'Archived',
};
