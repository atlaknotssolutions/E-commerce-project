import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    IconButton,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// ==========================================
// APPROVE DIALOG
// ==========================================

interface ApproveDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (note: string) => void;
    sellerName: string;
    loading: boolean;
}

export const ApproveDialog: React.FC<ApproveDialogProps> = ({
    open,
    onClose,
    onConfirm,
    sellerName,
    loading,
}) =>
{
    const [note, setNote] = useState('');

    const handleConfirm = () =>
    {
        onConfirm(note);
        setNote('');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    Approve Seller
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography className="mb-4">
                    Are you sure you want to approve <strong>{sellerName}</strong>?
                    This will set their account status to Active.
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Note (optional)"
                    placeholder="Add any notes about this approval..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    size="small"
                />
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="success"
                    disabled={loading}
                >
                    {loading ? 'Approving...' : 'Approve'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ==========================================
// REJECT DIALOG
// ==========================================

interface RejectDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    sellerName: string;
    loading: boolean;
}

export const RejectDialog: React.FC<RejectDialogProps> = ({
    open,
    onClose,
    onConfirm,
    sellerName,
    loading,
}) =>
{
    const [reason, setReason] = useState('');

    const handleConfirm = () =>
    {
        if (reason.trim())
        {
            onConfirm(reason);
            setReason('');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    Reject Seller
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography className="mb-4">
                    Are you sure you want to reject <strong>{sellerName}</strong>?
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Reason (required)"
                    placeholder="Provide a reason for rejection..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    size="small"
                    required
                    error={false}
                    helperText="A reason is required to reject a seller."
                />
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="error"
                    disabled={loading || !reason.trim()}
                >
                    {loading ? 'Rejecting...' : 'Reject'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ==========================================
// SUSPEND DIALOG
// ==========================================

interface SuspendDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    sellerName: string;
    loading: boolean;
}

export const SuspendDialog: React.FC<SuspendDialogProps> = ({
    open,
    onClose,
    onConfirm,
    sellerName,
    loading,
}) =>
{
    const [reason, setReason] = useState('');

    const handleConfirm = () =>
    {
        if (reason.trim())
        {
            onConfirm(reason);
            setReason('');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    Suspend Seller
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography className="mb-4">
                    Are you sure you want to suspend <strong>{sellerName}</strong>?
                    Their account will be temporarily deactivated.
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Reason (required)"
                    placeholder="Provide a reason for suspension..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    size="small"
                    required
                    helperText="A reason is required to suspend a seller."
                />
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="warning"
                    disabled={loading || !reason.trim()}
                >
                    {loading ? 'Suspending...' : 'Suspend'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ==========================================
// RESTORE DIALOG
// ==========================================

interface RestoreDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    sellerName: string;
    loading: boolean;
}

export const RestoreDialog: React.FC<RestoreDialogProps> = ({
    open,
    onClose,
    onConfirm,
    sellerName,
    loading,
}) =>
{
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    Restore Seller
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to restore <strong>{sellerName}</strong>?
                    Their account will be reactivated and they can resume selling.
                </Typography>
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="success"
                    disabled={loading}
                >
                    {loading ? 'Restoring...' : 'Restore'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
