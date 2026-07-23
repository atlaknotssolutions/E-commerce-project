import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    Divider,
} from '@mui/material';
import {
    AdminNotification,
    NOTIFICATION_TYPE_LABELS,
    AUDIENCE_LABELS,
    STATUS_LABELS,
} from '../../../../types/adminNotificationTypes';

interface NotificationDetailsDialogProps {
    open: boolean;
    notification: AdminNotification | null;
    onClose: () => void;
}

const NotificationDetailsDialog: React.FC<NotificationDetailsDialogProps> = ({
    open,
    notification,
    onClose,
}) => {
    if (!notification) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'success';
            case 'SCHEDULED': return 'info';
            case 'DRAFT': return 'warning';
            case 'FAILED': return 'error';
            case 'DELIVERED': return 'primary';
            default: return 'default';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{notification.title}</Typography>
                    <Chip
                        label={STATUS_LABELS[notification.status]}
                        color={getStatusColor(notification.status) as any}
                    />
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box className="space-y-4">
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                        <Typography>{NOTIFICATION_TYPE_LABELS[notification.notificationType]}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Target Audience</Typography>
                        <Typography>{AUDIENCE_LABELS[notification.targetAudience]}</Typography>
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Message</Typography>
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{notification.message}</Typography>
                    </Box>
                    <Divider />
                    <Box className="grid grid-cols-2 gap-4">
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                            <Typography>{notification.createdBy?.fullName || 'System'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                            <Typography>{new Date(notification.createdAt).toLocaleString()}</Typography>
                        </Box>
                        {notification.publishedAt && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Published At</Typography>
                                <Typography>{new Date(notification.publishedAt).toLocaleString()}</Typography>
                            </Box>
                        )}
                        {notification.scheduledAt && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Scheduled At</Typography>
                                <Typography>{new Date(notification.scheduledAt).toLocaleString()}</Typography>
                            </Box>
                        )}
                        {notification.deliveredAt && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Delivered At</Typography>
                                <Typography>{new Date(notification.deliveredAt).toLocaleString()}</Typography>
                            </Box>
                        )}
                    </Box>
                    <Divider />
                    <Box className="grid grid-cols-3 gap-4">
                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Typography variant="h5" fontWeight={700}>{notification.deliveredCount}</Typography>
                            <Typography variant="caption" color="text.secondary">Delivered</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Typography variant="h5" fontWeight={700}>{notification.readCount}</Typography>
                            <Typography variant="caption" color="text.secondary">Read</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Typography variant="h5" fontWeight={700}>{notification.failedCount}</Typography>
                            <Typography variant="caption" color="text.secondary">Failed</Typography>
                        </Box>
                    </Box>
                    {notification.errorLog && (
                        <Box>
                            <Typography variant="subtitle2" color="error">Error Log</Typography>
                            <Typography variant="body2" color="error">{notification.errorLog}</Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(NotificationDetailsDialog);
