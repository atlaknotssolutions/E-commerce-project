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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// ==========================================
// APPROVE DIALOG
// ==========================================

interface ApproveDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (note: string) => void;
    productName: string;
    loading: boolean;
}

export const ApproveDialog: React.FC<ApproveDialogProps> = ({
    open,
    onClose,
    onConfirm,
    productName,
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
                <Typography variant="h6" fontWeight={600}>Approve Product</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography className="mb-4">
                    Are you sure you want to approve <strong>{productName}</strong>?
                    The product can then be published to the marketplace.
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
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="success" disabled={loading}>
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
    productName: string;
    loading: boolean;
}

export const RejectDialog: React.FC<RejectDialogProps> = ({
    open,
    onClose,
    onConfirm,
    productName,
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
                <Typography variant="h6" fontWeight={600}>Reject Product</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography className="mb-4">
                    Are you sure you want to reject <strong>{productName}</strong>?
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
                    helperText="A reason is required to reject a product."
                />
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading || !reason.trim()}>
                    {loading ? 'Rejecting...' : 'Reject'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ==========================================
// PUBLISH DIALOG
// ==========================================

interface PublishDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    productName: string;
    loading: boolean;
}

export const PublishDialog: React.FC<PublishDialogProps> = ({
    open,
    onClose,
    onConfirm,
    productName,
    loading,
}) =>
{
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>Publish Product</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to publish <strong>{productName}</strong>?
                    It will become visible to customers on the marketplace.
                </Typography>
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={onConfirm} variant="contained" color="primary" disabled={loading}>
                    {loading ? 'Publishing...' : 'Publish'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ==========================================
// UNPUBLISH DIALOG
// ==========================================

interface UnpublishDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    productName: string;
    loading: boolean;
}

export const UnpublishDialog: React.FC<UnpublishDialogProps> = ({
    open,
    onClose,
    onConfirm,
    productName,
    loading,
}) =>
{
    const [reason, setReason] = useState('');

    const handleConfirm = () =>
    {
        onConfirm(reason);
        setReason('');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>Unpublish Product</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography className="mb-4">
                    Are you sure you want to unpublish <strong>{productName}</strong>?
                    It will be removed from the public marketplace.
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Reason (optional)"
                    placeholder="Add a reason for unpublishing..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    size="small"
                />
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="secondary" disabled={loading}>
                    {loading ? 'Unpublishing...' : 'Unpublish'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ==========================================
// UNFEATURE DIALOG
// ==========================================

interface UnfeatureDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    productName: string;
    loading: boolean;
}

export const UnfeatureDialog: React.FC<UnfeatureDialogProps> = ({
    open,
    onClose,
    onConfirm,
    productName,
    loading,
}) =>
{
    const [reason, setReason] = useState('');

    const handleConfirm = () =>
    {
        onConfirm(reason);
        setReason('');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>Unfeature Product</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography className="mb-4">
                    Are you sure you want to remove <strong>{productName}</strong> from featured products?
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Reason (optional)"
                    placeholder="Add a reason for unfeaturing..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    size="small"
                />
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="secondary" disabled={loading}>
                    {loading ? 'Removing...' : 'Unfeature'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ==========================================
// DELETE DIALOG
// ==========================================

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    productName: string;
    loading: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
    open,
    onClose,
    onConfirm,
    productName,
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
                <Typography variant="h6" fontWeight={600}>Delete Product</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography className="mb-4">
                    Are you sure you want to delete <strong>{productName}</strong>?
                    This action will soft-delete the product and remove it from the marketplace.
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Reason (required)"
                    placeholder="Provide a reason for deletion..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    size="small"
                    required
                    helperText="A reason is required to delete a product."
                />
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading || !reason.trim()}>
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
