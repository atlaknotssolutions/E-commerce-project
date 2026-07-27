import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Chip, Typography, Box, TablePagination, Menu, MenuItem,
    ListItemIcon, ListItemText, CircularProgress,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PaymentIcon from '@mui/icons-material/Payment';
import {
    AdminPayout,
    ADMIN_PAYOUT_STATUS_LABELS,
} from '../../../../types/adminPayoutTypes';

interface PayoutTableProps {
    payouts: AdminPayout[];
    pagination: { page: number; limit: number; total: number; totalPages: number } | null;
    loading: boolean;
    onView: (payout: AdminPayout) => void;
    onApprove: (payout: AdminPayout) => void;
    onReject: (payout: AdminPayout) => void;
    onMarkPaid: (payout: AdminPayout) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (limit: number) => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING': return 'warning';
        case 'APPROVED': return 'info';
        case 'REJECTED': return 'error';
        case 'COMPLETED': return 'success';
        default: return 'default';
    }
};

const PayoutTable: React.FC<PayoutTableProps> = ({
    payouts,
    pagination,
    loading,
    onView,
    onApprove,
    onReject,
    onMarkPaid,
    onPageChange,
    onRowsPerPageChange,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, payout: AdminPayout) => {
        setAnchorEl(event.currentTarget);
        setSelectedPayout(payout);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedPayout(null);
    };

    return (
        <Paper elevation={1}>
            <TableContainer sx={{ maxHeight: "calc(100vh - 290px)" }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Request ID</strong></TableCell>
                            <TableCell><strong>Seller</strong></TableCell>
                            <TableCell><strong>Requested Date</strong></TableCell>
                            <TableCell align="right"><strong>Amount</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Processed Date</strong></TableCell>
                            <TableCell><strong>Approved By</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && payouts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={24} />
                                    <Typography variant="body2" color="text.secondary" mt={1}>Loading payouts...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : payouts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">No payout records found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            payouts.map((p) => (
                                <TableRow key={p.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                            {p.id.slice(-8).toUpperCase()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{p.seller?.companyName || 'N/A'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{p.seller?.email || ''}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{new Date(p.requestedAt).toLocaleDateString()}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" fontWeight={600}>
                                            ₹{p.amount.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={ADMIN_PAYOUT_STATUS_LABELS[p.status]}
                                            color={getStatusColor(p.status) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {p.processedAt ? new Date(p.processedAt).toLocaleDateString() : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {p.approvedBy?.fullName || p.approvedBy?.email || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, p)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => { if (selectedPayout) onView(selectedPayout); handleMenuClose(); }}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                </MenuItem>
                {selectedPayout?.status === 'PENDING' && (
                    <MenuItem onClick={() => { if (selectedPayout) onApprove(selectedPayout); handleMenuClose(); }}>
                        <ListItemIcon><CheckCircleOutlineIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText>Approve</ListItemText>
                    </MenuItem>
                )}
                {selectedPayout?.status === 'PENDING' && (
                    <MenuItem onClick={() => { if (selectedPayout) onReject(selectedPayout); handleMenuClose(); }}>
                        <ListItemIcon><CancelOutlinedIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Reject</ListItemText>
                    </MenuItem>
                )}
                {selectedPayout?.status === 'APPROVED' && (
                    <MenuItem onClick={() => { if (selectedPayout) onMarkPaid(selectedPayout); handleMenuClose(); }}>
                        <ListItemIcon><PaymentIcon fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText>Mark Paid</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </Paper>
    );
};

export default React.memo(PayoutTable);
