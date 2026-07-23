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

interface CouponToggleDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    couponCode: string;
    action: 'enable' | 'disable';
    loading: boolean;
}

const CouponToggleDialog: React.FC<CouponToggleDialogProps> = ({
    open,
    onClose,
    onConfirm,
    couponCode,
    action,
    loading,
}) =>
{
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    {action === 'enable' ? 'Enable Coupon' : 'Disable Coupon'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to {action} coupon <strong>{couponCode}</strong>?
                </Typography>
            </DialogContent>
            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={action === 'enable' ? 'success' : 'warning'}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : action === 'enable' ? 'Enable' : 'Disable'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(CouponToggleDialog);
