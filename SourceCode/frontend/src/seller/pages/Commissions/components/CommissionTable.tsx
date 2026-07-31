import React, { useState } from 'react';
import {
    Table, TableBody, TableContainer, TableHead, TableRow,
    Paper, IconButton, Chip, Typography, Box, TablePagination, Menu, MenuItem,
    ListItemIcon, ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Commission, COMMISSION_STATUS_LABELS } from '../../../../types/adminCommissionTypes';
import { StyledTableCell, StyledTableRow } from '../../../../components/shared/Table';

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
    commissions, pagination, onView, onPageChange, onRowsPerPageChange,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selected, setSelected] = useState<Commission | null>(null);

    return (
        <Paper elevation={1}>
            <TableContainer sx={{ maxHeight: "calc(100vh - 290px)" }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell><strong>Order ID</strong></StyledTableCell>
                            <StyledTableCell align="right"><strong>Order Amount</strong></StyledTableCell>
                            <StyledTableCell align="right"><strong>Commission</strong></StyledTableCell>
                            <StyledTableCell align="right"><strong>GST</strong></StyledTableCell>
                            <StyledTableCell align="right"><strong>You Receive</strong></StyledTableCell>
                            <StyledTableCell><strong>Status</strong></StyledTableCell>
                            <StyledTableCell><strong>Date</strong></StyledTableCell>
                            <StyledTableCell align="center"><strong>Actions</strong></StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {commissions.map((c) => (
                            <StyledTableRow key={c.id || c._id} hover>
                                <StyledTableCell>
                                    <Typography variant="body2" fontWeight={500}>{c.orderId}</Typography>
                                </StyledTableCell>
                                <StyledTableCell align="right">₹{c.orderAmount.toLocaleString()}</StyledTableCell>
                                <StyledTableCell align="right">
                                    <Typography variant="body2" color="error.main">
                                        ₹{c.commissionAmount.toLocaleString()}
                                    </Typography>
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                    <Typography variant="body2" color="warning.main">
                                        ₹{c.gstAmount.toLocaleString()}
                                    </Typography>
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                    <Typography variant="body2" color="success.main" fontWeight={600}>
                                        ₹{c.sellerAmount.toLocaleString()}
                                    </Typography>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Chip label={COMMISSION_STATUS_LABELS[c.status]} color={getStatusColor(c.status) as any} size="small" />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Typography variant="caption">{new Date(c.calculatedAt).toLocaleDateString()}</Typography>
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                    <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelected(c); }}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </StyledTableCell>
                            </StyledTableRow>
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
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            )}

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => { setAnchorEl(null); setSelected(null); }}>
                <MenuItem onClick={() => { if (selected) onView(selected); setAnchorEl(null); setSelected(null); }}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                </MenuItem>
            </Menu>
        </Paper>
    );
};

export default React.memo(CommissionTable);
