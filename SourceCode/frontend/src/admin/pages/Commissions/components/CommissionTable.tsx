import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Chip, Typography, Box, TablePagination, Menu, MenuItem,
    ListItemIcon, ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    Commission,
    COMMISSION_STATUS_LABELS,
} from '../../../../types/adminCommissionTypes';

interface CommissionTableProps {
    commissions: Commission[];
    pagination: { page: number; limit: number; total: number; totalPages: number } | null;
    onView: (commission: Commission) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (limit: number) => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'CALCULATED': return 'info';
        case 'APPROVED': return 'success';
        case 'SETTLED': return 'primary';
        case 'CANCELLED': return 'error';
        default: return 'default';
    }
};

const CommissionTable: React.FC<CommissionTableProps> = ({
    commissions,
    pagination,
    onView,
    onPageChange,
    onRowsPerPageChange,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commission: Commission) => {
        setAnchorEl(event.currentTarget);
        setSelectedCommission(commission);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedCommission(null);
    };

    return (
        <Paper elevation={1}>
            <TableContainer sx={{ maxHeight: "calc(100vh - 290px)" }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Order ID</strong></TableCell>
                            <TableCell><strong>Seller</strong></TableCell>
                            <TableCell align="right"><strong>Order Amount</strong></TableCell>
                            <TableCell align="right"><strong>Commission</strong></TableCell>
                            <TableCell align="right"><strong>GST</strong></TableCell>
                            <TableCell align="right"><strong>Seller Amount</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Calculated</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {commissions.map((c) => (
                            <TableRow key={c.id || c._id} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={500}>{c.orderId}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {c.seller?.companyName || c.seller?.email || 'N/A'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">₹{c.orderAmount.toLocaleString()}</TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" color="error.main">
                                        ₹{c.commissionAmount.toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" color="warning.main">
                                        ₹{c.gstAmount.toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" color="success.main" fontWeight={600}>
                                        ₹{c.sellerAmount.toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={COMMISSION_STATUS_LABELS[c.status]}
                                        color={getStatusColor(c.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {new Date(c.calculatedAt).toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, c)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {commissions.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No commission records found</Typography>
                </Box>
            )}

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
                <MenuItem onClick={() => { if (selectedCommission) onView(selectedCommission); handleMenuClose(); }}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                </MenuItem>
            </Menu>
        </Paper>
    );
};

export default React.memo(CommissionTable);
