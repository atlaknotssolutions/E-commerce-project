import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Typography,
    Box,
    TablePagination,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArchiveIcon from '@mui/icons-material/Archive';
import {
    AdminNotification,
    NOTIFICATION_TYPE_LABELS,
    AUDIENCE_LABELS,
    STATUS_LABELS,
    NotificationStatus,
} from '../../../../types/adminNotificationTypes';

interface NotificationTableProps {
    notifications: AdminNotification[];
    pagination: { page: number; limit: number; total: number; totalPages: number } | null;
    onView: (notification: AdminNotification) => void;
    onEdit: (notification: AdminNotification) => void;
    onDelete: (notification: AdminNotification) => void;
    onPublish: (notification: AdminNotification) => void;
    onSchedule: (notification: AdminNotification) => void;
    onArchive: (notification: AdminNotification) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (limit: number) => void;
}

const getStatusColor = (status: NotificationStatus) => {
    switch (status) {
        case 'PUBLISHED': return 'success';
        case 'SCHEDULED': return 'info';
        case 'DRAFT': return 'warning';
        case 'FAILED': return 'error';
        case 'DELIVERED': return 'primary';
        case 'ARCHIVED': return 'default';
        default: return 'default';
    }
};

const NotificationTable: React.FC<NotificationTableProps> = ({
    notifications,
    pagination,
    onView,
    onEdit,
    onDelete,
    onPublish,
    onSchedule,
    onArchive,
    onPageChange,
    onRowsPerPageChange,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notification: AdminNotification) => {
        setAnchorEl(event.currentTarget);
        setSelectedNotification(notification);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedNotification(null);
    };

    const handleAction = (action: string) => {
        if (!selectedNotification) return;
        switch (action) {
            case 'view': onView(selectedNotification); break;
            case 'edit': onEdit(selectedNotification); break;
            case 'delete': onDelete(selectedNotification); break;
            case 'publish': onPublish(selectedNotification); break;
            case 'schedule': onSchedule(selectedNotification); break;
            case 'archive': onArchive(selectedNotification); break;
        }
        handleMenuClose();
    };

    return (
        <Paper elevation={1}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Title</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Audience</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Created By</strong></TableCell>
                            <TableCell><strong>Created</strong></TableCell>
                            <TableCell><strong>Scheduled</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {notifications.map((notification) => (
                            <TableRow key={notification._id} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={500}>
                                        {notification.title}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {NOTIFICATION_TYPE_LABELS[notification.notificationType]}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {AUDIENCE_LABELS[notification.targetAudience]}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={STATUS_LABELS[notification.status]}
                                        color={getStatusColor(notification.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {notification.createdBy?.fullName || 'System'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {notification.scheduledAt
                                            ? new Date(notification.scheduledAt).toLocaleString()
                                            : '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, notification)}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {notifications.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No notifications found</Typography>
                </Box>
            )}

            {pagination && (
                <TablePagination
                    component="div"
                    count={pagination.total}
                    page={pagination.page - 1}
                    onPageChange={(_, page) => onPageChange(page + 1)}
                    rowsPerPage={pagination.limit}
                    onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
                    rowsPerPageOptions={[10, 20, 50]}
                />
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleAction('view')}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleAction('edit')}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                {selectedNotification?.status === 'DRAFT' && (
                    <MenuItem onClick={() => handleAction('publish')}>
                        <ListItemIcon><SendIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText>Publish Now</ListItemText>
                    </MenuItem>
                )}
                {selectedNotification?.status === 'DRAFT' && (
                    <MenuItem onClick={() => handleAction('schedule')}>
                        <ListItemIcon><ScheduleIcon fontSize="small" color="info" /></ListItemIcon>
                        <ListItemText>Schedule</ListItemText>
                    </MenuItem>
                )}
                {selectedNotification?.status !== 'DRAFT' && selectedNotification?.status !== 'ARCHIVED' && (
                    <MenuItem onClick={() => handleAction('archive')}>
                        <ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Archive</ListItemText>
                    </MenuItem>
                )}
                {selectedNotification?.status !== 'DELIVERED' && (
                    <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </Paper>
    );
};

export default React.memo(NotificationTable);
