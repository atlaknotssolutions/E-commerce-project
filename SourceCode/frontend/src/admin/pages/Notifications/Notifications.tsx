import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Button, Snackbar, Box } from '@mui/material';
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
import NotificationStatsCards from './components/NotificationStatistics';
import NotificationFilters from './components/NotificationFilters';
import NotificationTable from './components/NotificationTable';
import NotificationDetailsDialog from './components/NotificationDetailsDialog';
import NotificationFormDialog from './components/NotificationFormDialog';

const Notifications: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        notifications,
        selectedNotification,
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
    const [confirmDelete, setConfirmDelete] = useState<AdminNotification | null>(null);
    const [confirmPublish, setConfirmPublish] = useState<AdminNotification | null>(null);
    const [confirmSchedule, setConfirmSchedule] = useState<AdminNotification | null>(null);
    const [confirmArchive, setConfirmArchive] = useState<AdminNotification | null>(null);

    useEffect(() => {
        dispatch(fetchNotifications(filters));
        dispatch(fetchNotificationStatistics());
    }, [dispatch, filters.page, filters.limit]);

    useEffect(() => {
        if (actionSuccess) {
            dispatch(fetchNotifications(filters));
            dispatch(fetchNotificationStatistics());
            dispatch(clearAdminNotificationActionSuccess());
            setFormOpen(false);
            setEditingNotification(null);
            setConfirmDelete(null);
            setConfirmPublish(null);
            setConfirmSchedule(null);
            setConfirmArchive(null);
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

    const handleDelete = useCallback((notification: AdminNotification) => {
        setConfirmDelete(notification);
    }, []);

    const handlePublish = useCallback((notification: AdminNotification) => {
        setConfirmPublish(notification);
    }, []);

    const handleSchedule = useCallback((notification: AdminNotification) => {
        setConfirmSchedule(notification);
    }, []);

    const handleArchive = useCallback((notification: AdminNotification) => {
        setConfirmArchive(notification);
    }, []);

    const handleFormSubmit = useCallback((data: Partial<AdminNotification>) => {
        if (editingNotification) {
            dispatch(updateNotification({ id: editingNotification._id, data }));
        } else {
            dispatch(createNotification(data));
        }
    }, [dispatch, editingNotification]);

    const handleConfirmDelete = useCallback(() => {
        if (confirmDelete) {
            dispatch(deleteNotification(confirmDelete._id));
        }
    }, [dispatch, confirmDelete]);

    const handleConfirmPublish = useCallback(() => {
        if (confirmPublish) {
            dispatch(publishNotification(confirmPublish._id));
        }
    }, [dispatch, confirmPublish]);

    const handleConfirmSchedule = useCallback(() => {
        if (confirmSchedule) {
            const scheduledAt = prompt('Enter scheduled date/time (ISO format):');
            if (scheduledAt) {
                dispatch(scheduleNotification({ id: confirmSchedule._id, scheduledAt }));
            }
        }
    }, [dispatch, confirmSchedule]);

    const handleConfirmArchive = useCallback(() => {
        if (confirmArchive) {
            dispatch(archiveNotification(confirmArchive._id));
        }
    }, [dispatch, confirmArchive]);

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

            {/* Delete Confirmation */}
            <Snackbar
                open={!!confirmDelete}
                autoHideDuration={null}
                onClose={() => setConfirmDelete(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="warning"
                    action={
                        <Box className="flex gap-2">
                            <Button color="inherit" size="small" onClick={handleConfirmDelete}>
                                Delete
                            </Button>
                            <Button color="inherit" size="small" onClick={() => setConfirmDelete(null)}>
                                Cancel
                            </Button>
                        </Box>
                    }
                >
                    Delete "{confirmDelete?.title}"?
                </Alert>
            </Snackbar>

            {/* Publish Confirmation */}
            <Snackbar
                open={!!confirmPublish}
                autoHideDuration={null}
                onClose={() => setConfirmPublish(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="info"
                    action={
                        <Box className="flex gap-2">
                            <Button color="inherit" size="small" onClick={handleConfirmPublish}>
                                Publish
                            </Button>
                            <Button color="inherit" size="small" onClick={() => setConfirmPublish(null)}>
                                Cancel
                            </Button>
                        </Box>
                    }
                >
                    Publish "{confirmPublish?.title}" now?
                </Alert>
            </Snackbar>

            {/* Schedule Confirmation */}
            <Snackbar
                open={!!confirmSchedule}
                autoHideDuration={null}
                onClose={() => setConfirmSchedule(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="info"
                    action={
                        <Box className="flex gap-2">
                            <Button color="inherit" size="small" onClick={handleConfirmSchedule}>
                                Schedule
                            </Button>
                            <Button color="inherit" size="small" onClick={() => setConfirmSchedule(null)}>
                                Cancel
                            </Button>
                        </Box>
                    }
                >
                    Schedule "{confirmSchedule?.title}"?
                </Alert>
            </Snackbar>

            {/* Archive Confirmation */}
            <Snackbar
                open={!!confirmArchive}
                autoHideDuration={null}
                onClose={() => setConfirmArchive(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="warning"
                    action={
                        <Box className="flex gap-2">
                            <Button color="inherit" size="small" onClick={handleConfirmArchive}>
                                Archive
                            </Button>
                            <Button color="inherit" size="small" onClick={() => setConfirmArchive(null)}>
                                Cancel
                            </Button>
                        </Box>
                    }
                >
                    Archive "{confirmArchive?.title}"?
                </Alert>
            </Snackbar>
        </div>
    );
};

export default React.memo(Notifications);
