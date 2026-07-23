import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CouponDeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    couponCode: string;
    loading: boolean;
}

const CouponDeleteDialog: React.FC<CouponDeleteDialogProps> = ({
    open,
    onClose,
    onConfirm,
    couponCode,
    loading,
}) =>
{
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    Delete Coupon
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete coupon <strong>{couponCode}</strong>?
                    This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={loading}
                >
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(CouponDeleteDialog);
