import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    CircularProgress,
} from '@mui/material';
import {
    AdminNotification,
    NotificationType,
    TargetAudience,
    NOTIFICATION_TYPE_LABELS,
    AUDIENCE_LABELS,
} from '../../../../types/adminNotificationTypes';

interface NotificationFormDialogProps {
    open: boolean;
    notification: AdminNotification | null;
    isEdit: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<AdminNotification>) => void;
}

const NotificationFormDialog: React.FC<NotificationFormDialogProps> = ({
    open,
    notification,
    isEdit,
    loading,
    onClose,
    onSubmit,
}) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [notificationType, setNotificationType] = useState<NotificationType>('SYSTEM');
    const [targetAudience, setTargetAudience] = useState<TargetAudience>('ALL_USERS');

    useEffect(() => {
        if (isEdit && notification) {
            setTitle(notification.title);
            setMessage(notification.message);
            setNotificationType(notification.notificationType);
            setTargetAudience(notification.targetAudience);
        } else {
            setTitle('');
            setMessage('');
            setNotificationType('SYSTEM');
            setTargetAudience('ALL_USERS');
        }
    }, [isEdit, notification, open]);

    const handleSubmit = () => {
        onSubmit({ title, message, notificationType, targetAudience });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEdit ? 'Edit Notification' : 'Create Notification'}</DialogTitle>
            <DialogContent>
                <Box className="space-y-4 mt-2">
                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        multiline
                        rows={4}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Notification Type"
                        value={notificationType}
                        onChange={(e) => setNotificationType(e.target.value as NotificationType)}
                        select
                    >
                        {Object.entries(NOTIFICATION_TYPE_LABELS).map(([key, label]) => (
                            <MenuItem key={key} value={key}>{label}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        label="Target Audience"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                        select
                    >
                        {Object.entries(AUDIENCE_LABELS).map(([key, label]) => (
                            <MenuItem key={key} value={key}>{label}</MenuItem>
                        ))}
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!title || !message || loading}
                >
                    {loading ? <CircularProgress size={20} /> : isEdit ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(NotificationFormDialog);
