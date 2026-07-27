import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Box,
} from '@mui/material';

interface ConfirmActionDialogProps {
    open: boolean;
    title: string;
    message: string;
    actionLabel: string;
    actionColor?: 'primary' | 'success' | 'error' | 'warning';
    requireReason?: boolean;
    reason?: string;
    onReasonChange?: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
    open,
    title,
    message,
    actionLabel,
    actionColor = 'primary',
    requireReason = false,
    reason = '',
    onReasonChange,
    onConfirm,
    onCancel,
    loading = false,
}) => {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6">{title}</Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {message}
                </Typography>
                {requireReason && (
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        label="Rejection Reason (required)"
                        value={reason}
                        onChange={(e) => onReasonChange?.(e.target.value)}
                        placeholder="Enter the reason for rejection..."
                    />
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} disabled={loading}>Cancel</Button>
                <Button
                    variant="contained"
                    color={actionColor}
                    onClick={onConfirm}
                    disabled={loading || (requireReason && !reason.trim())}
                >
                    {actionLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(ConfirmActionDialog);
