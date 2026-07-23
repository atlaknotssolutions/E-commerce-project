import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../../../Redux Toolkit/Store';
import { fetchCouponUsage, clearCouponUsage } from '../../../../Redux Toolkit/Admin/AdminCouponSlice';

interface CouponUsageDialogProps {
    open: boolean;
    onClose: () => void;
    couponId: string | null;
    couponCode: string;
}

const CouponUsageDialog: React.FC<CouponUsageDialogProps> = ({
    open,
    onClose,
    couponId,
    couponCode,
}) =>
{
    const dispatch = useAppDispatch();
    const { usage, loading } = useAppSelector((store) => store.adminCoupon);

    useEffect(() =>
    {
        if (open && couponId)
        {
            dispatch(fetchCouponUsage(couponId));
        }
        return () =>
        {
            if (!open) dispatch(clearCouponUsage());
        };
    }, [open, couponId, dispatch]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    Usage Details — {couponCode}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {loading && !usage ? (
                    <Box className="flex justify-center py-8">
                        <CircularProgress />
                    </Box>
                ) : usage ? (
                    <Box>
                        <Box className="mb-4 flex gap-6">
                            <Typography>
                                <strong>Total Uses:</strong> {usage.usageCount}
                            </Typography>
                            <Typography>
                                <strong>Unique Users:</strong> {usage.usedByUsers?.length || 0}
                            </Typography>
                        </Box>

                        {usage.usedByUsers && usage.usedByUsers.length > 0 ? (
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Mobile</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {usage.usedByUsers.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell>{user.fullName}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.mobile || '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography color="text.secondary" className="text-center py-4">
                                No users have used this coupon yet.
                            </Typography>
                        )}
                    </Box>
                ) : null}
            </DialogContent>

            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(CouponUsageDialog);
