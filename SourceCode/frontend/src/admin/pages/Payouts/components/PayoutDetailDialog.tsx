import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    Divider,
    Grid,
} from '@mui/material';
import { AdminPayout, ADMIN_PAYOUT_STATUS_LABELS } from '../../../../types/adminPayoutTypes';

interface PayoutDetailDialogProps {
    open: boolean;
    payout: AdminPayout | null;
    onClose: () => void;
}

const PayoutDetailDialog: React.FC<PayoutDetailDialogProps> = ({
    open,
    payout,
    onClose,
}) => {
    if (!payout) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'info';
            case 'REJECTED': return 'error';
            case 'COMPLETED': return 'success';
            default: return 'default';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        Payout — {payout.id.slice(-8).toUpperCase()}
                    </Typography>
                    <Chip
                        label={ADMIN_PAYOUT_STATUS_LABELS[payout.status]}
                        color={getStatusColor(payout.status) as any}
                    />
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box className="space-y-4">
                    {/* Seller Information */}
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Seller Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Company Name</Typography>
                            <Typography>{payout.seller?.companyName || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                            <Typography>{payout.seller?.email || 'N/A'}</Typography>
                        </Grid>
                    </Grid>

                    <Divider />

                    {/* Financial Information */}
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Financial Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <Typography variant="h5" fontWeight={700} color="text.primary">
                                    ₹{payout.amount.toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Payout Amount</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <Typography variant="body1" fontWeight={600}>
                                    {new Date(payout.requestedAt).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Requested Date</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <Typography variant="body1" fontWeight={600}>
                                    {payout.processedAt ? new Date(payout.processedAt).toLocaleString() : '—'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Processed Date</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider />

                    {/* Audit Information */}
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Audit
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Approved By</Typography>
                            <Typography>{payout.approvedBy || '—'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Rejection Reason</Typography>
                            <Typography color={payout.rejectionReason ? 'error.main' : 'text.secondary'}>
                                {payout.rejectionReason || '—'}
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Transaction Reference — future ready */}
                    {payout.transactions && payout.transactions.length > 0 && (
                        <>
                            <Divider />
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Transaction References
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {payout.transactions.length} transaction(s) linked
                            </Typography>
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(PayoutDetailDialog);
