import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    Typography,
    MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const TRANSITION_MAP: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    PLACED: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PACKED', 'CANCELLED'],
    PACKED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['OUT_FOR_DELIVERY'],
    OUT_FOR_DELIVERY: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pending',
    PLACED: 'Placed',
    CONFIRMED: 'Confirmed',
    PACKED: 'Packed',
    SHIPPED: 'Shipped',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
};

interface UpdateStatusDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (orderStatus: string, adminNote: string) => void;
    currentStatus: string;
    orderId: string;
    loading: boolean;
}

const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({
    open,
    onClose,
    onConfirm,
    currentStatus,
    orderId,
    loading,
}) =>
{
    const [newStatus, setNewStatus] = useState('');
    const [adminNote, setAdminNote] = useState('');

    const validTransitions = TRANSITION_MAP[currentStatus] || [];
    const isTerminal = currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED';
    const isUnchanged = newStatus === currentStatus;

    const handleConfirm = () =>
    {
        if (newStatus && !isUnchanged)
        {
            onConfirm(newStatus, adminNote);
            setNewStatus('');
            setAdminNote('');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    Update Order Status
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography className="mb-4">
                    Order <strong>{orderId}</strong> is currently{' '}
                    <strong>{STATUS_LABELS[currentStatus] || currentStatus}</strong>.
                </Typography>

                {isTerminal ? (
                    <Typography color="warning.main" sx={{ mb: 2 }}>
                        This order is in a terminal state and cannot be updated.
                    </Typography>
                ) : (
                    <>
                        <TextField
                            fullWidth
                            select
                            label="New Status"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            size="small"
                            sx={{ mb: 3 }}
                        >
                            {validTransitions.length === 0 ? (
                                <MenuItem value="" disabled>
                                    No valid transitions available
                                </MenuItem>
                            ) : (
                                validTransitions.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {STATUS_LABELS[status] || status}
                                    </MenuItem>
                                ))
                            )}
                        </TextField>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Admin Note (optional)"
                            placeholder="Add any notes about this status update..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            size="small"
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                {!isTerminal && (
                    <Button
                        onClick={handleConfirm}
                        variant="contained"
                        color="primary"
                        disabled={loading || !newStatus || isUnchanged}
                    >
                        {loading ? 'Updating...' : 'Update Status'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(UpdateStatusDialog);
