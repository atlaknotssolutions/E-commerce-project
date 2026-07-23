import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, Chip, Divider, Grid,
} from '@mui/material';
import { Commission, COMMISSION_STATUS_LABELS } from '../../../../types/adminCommissionTypes';

interface CommissionDetailsDialogProps {
    open: boolean;
    commission: Commission | null;
    onClose: () => void;
}

const CommissionDetailsDialog: React.FC<CommissionDetailsDialogProps> = ({
    open, commission, onClose,
}) => {
    if (!commission) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CALCULATED': return 'info';
            case 'APPROVED': return 'success';
            case 'SETTLED': return 'primary';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Commission — {commission.orderId}</Typography>
                    <Chip label={COMMISSION_STATUS_LABELS[commission.status]} color={getStatusColor(commission.status) as any} />
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box className="space-y-4">
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Order ID</Typography>
                            <Typography>{commission.orderId}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Calculated At</Typography>
                            <Typography>{new Date(commission.calculatedAt).toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                            <Typography>{commission.customer?.fullName || commission.customer?.email || 'N/A'}</Typography>
                        </Grid>
                    </Grid>

                    <Divider />

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <Typography variant="h5" fontWeight={700} color="text.primary">
                                    ₹{commission.orderAmount.toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Order Amount</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <Typography variant="h5" fontWeight={700} color="error.main">
                                    −₹{(commission.commissionAmount + commission.gstAmount).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Platform Fee ({commission.commissionPercentage}% + {commission.gstPercentage}% GST)
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: 'success.light', color: 'success.contrastText' }}>
                                <Typography variant="h5" fontWeight={700}>
                                    ₹{commission.sellerAmount.toLocaleString()}
                                </Typography>
                                <Typography variant="caption">Your Earning</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Calculation Breakdown</Typography>
                        <Typography variant="body2">Commission = ₹{commission.orderAmount.toLocaleString()} × {commission.commissionPercentage}% = ₹{commission.commissionAmount.toLocaleString()}</Typography>
                        <Typography variant="body2">GST on Commission = ₹{commission.commissionAmount.toLocaleString()} × {commission.gstPercentage}% = ₹{commission.gstAmount.toLocaleString()}</Typography>
                        <Typography variant="body2" fontWeight={600}>You Receive = ₹{commission.orderAmount.toLocaleString()} − ₹{commission.commissionAmount.toLocaleString()} − ₹{commission.gstAmount.toLocaleString()} = ₹{commission.sellerAmount.toLocaleString()}</Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(CommissionDetailsDialog);
