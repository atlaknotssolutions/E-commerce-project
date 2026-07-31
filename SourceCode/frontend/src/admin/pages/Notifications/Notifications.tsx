import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchNotifications,
    fetchNotificationStatistics,
    createNotification,
    updateNotification,
    deleteNotification,
    publishNotification,
    scheduleNotification,
    archiveNotification,
    clearAdminNotificationError,
    clearAdminNotificationActionSuccess,
} from '../../../Redux Toolkit/Admin/adminNotificationSlice';
import { NotificationFilters as NotificationFiltersType, AdminNotification } from '../../../types/adminNotificationTypes';
import { notification } from '../../../services/notificationService';
import NotificationStatsCards from './components/NotificationStatistics';
import NotificationFilters from './components/NotificationFilters';
import NotificationTable from './components/NotificationTable';
import NotificationDetailsDialog from './components/NotificationDetailsDialog';
import NotificationFormDialog from './components/NotificationFormDialog';

const Notifications: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        notifications,
        statistics,
        pagination,
        loading,
        error,
        actionSuccess,
    } = useAppSelector((store) => store.adminNotification);

    const [filters, setFilters] = useState<NotificationFiltersType>({
        status: '',
        notificationType: '',
        targetAudience: '',
        search: '',
        startDate: null,
        endDate: null,
        page: 1,
        limit: 20,
    });

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState<AdminNotification | null>(null);

    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    useEffect(() => {
        dispatch(fetchNotifications(filtersRef.current));
        dispatch(fetchNotificationStatistics());
    }, [dispatch, filters.page, filters.limit]);

    useEffect(() => {
        if (actionSuccess) {
            dispatch(fetchNotifications(filters));
            dispatch(fetchNotificationStatistics());
            dispatch(clearAdminNotificationActionSuccess());
            setFormOpen(false);
            setEditingNotification(null);
        }
    }, [actionSuccess, dispatch, filters]);

    const handleFilterChange = useCallback((field: keyof NotificationFiltersType, value: any) => {
        setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
    }, []);

    const handleApplyFilters = useCallback(() => {
        setFilters((prev) => ({ ...prev, page: 1 }));
        dispatch(fetchNotifications({ ...filters, page: 1 }));
    }, [dispatch, filters]);

    const handleView = useCallback((notification: AdminNotification) => {
        setEditingNotification(notification);
        setDetailsOpen(true);
    }, []);

    const handleCreate = useCallback(() => {
        setEditingNotification(null);
        setFormOpen(true);
    }, []);

    const handleEdit = useCallback((notification: AdminNotification) => {
        setEditingNotification(notification);
        setFormOpen(true);
    }, []);

    const handleDelete = useCallback((notif: AdminNotification) => {
        dispatch(deleteNotification(notif._id))
            .unwrap()
            .then(() => {
                notification.success('Notification deleted successfully');
                dispatch(fetchNotifications(filters));
                dispatch(fetchNotificationStatistics());
            })
            .catch((err: any) => {
                notification.error(err || 'Failed to delete notification');
            });
    }, [dispatch, filters]);

    const handlePublish = useCallback((notif: AdminNotification) => {
        dispatch(publishNotification(notif._id))
            .unwrap()
            .then(() => {
                notification.success('Notification published successfully');
                dispatch(fetchNotifications(filters));
                dispatch(fetchNotificationStatistics());
            })
            .catch((err: any) => {
                notification.error(err || 'Failed to publish notification');
            });
    }, [dispatch, filters]);

    const handleSchedule = useCallback((notif: AdminNotification) => {
        const scheduledAt = prompt('Enter scheduled date/time (ISO format):');
        if (scheduledAt) {
            dispatch(scheduleNotification({ id: notif._id, scheduledAt }))
                .unwrap()
                .then(() => {
                    notification.success('Notification scheduled successfully');
                    dispatch(fetchNotifications(filters));
                    dispatch(fetchNotificationStatistics());
                })
                .catch((err: any) => {
                    notification.error(err || 'Failed to schedule notification');
                });
        }
    }, [dispatch, filters]);

    const handleArchive = useCallback((notif: AdminNotification) => {
        dispatch(archiveNotification(notif._id))
            .unwrap()
            .then(() => {
                notification.success('Notification archived successfully');
                dispatch(fetchNotifications(filters));
                dispatch(fetchNotificationStatistics());
            })
            .catch((err: any) => {
                notification.error(err || 'Failed to archive notification');
            });
    }, [dispatch, filters]);

    const handleFormSubmit = useCallback((data: Partial<AdminNotification>) => {
        if (editingNotification) {
            dispatch(updateNotification({ id: editingNotification._id, data }));
        } else {
            dispatch(createNotification(data));
        }
    }, [dispatch, editingNotification]);

    return (
        <div className="space-y-6" role="main" aria-label="Notification Center">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Notification Center
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage platform announcements and notifications.
                    </p>
                </div>
                <Button variant="contained" onClick={handleCreate}>
                    Create Notification
                </Button>
            </div>

            {error && (
                <Alert
                    severity="error"
                    onClose={() => dispatch(clearAdminNotificationError())}
                >
                    {error}
                </Alert>
            )}

            <section aria-label="Notification Statistics">
                <NotificationStatsCards statistics={statistics} />
            </section>

            <section aria-label="Notification Filters">
                <NotificationFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onApply={handleApplyFilters}
                />
            </section>

            <section aria-label="Notification Table">
                <NotificationTable
                    notifications={notifications}
                    pagination={pagination}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPublish={handlePublish}
                    onSchedule={handleSchedule}
                    onArchive={handleArchive}
                    onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                    onRowsPerPageChange={(limit) => setFilters((prev) => ({ ...prev, limit, page: 1 }))}
                />
            </section>

            {/* Details Dialog */}
            <NotificationDetailsDialog
                open={detailsOpen}
                notification={editingNotification}
                onClose={() => setDetailsOpen(false)}
            />

            {/* Form Dialog */}
            <NotificationFormDialog
                open={formOpen}
                notification={editingNotification}
                isEdit={!!editingNotification}
                loading={loading}
                onClose={() => { setFormOpen(false); setEditingNotification(null); }}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
};

export default React.memo(Notifications);
