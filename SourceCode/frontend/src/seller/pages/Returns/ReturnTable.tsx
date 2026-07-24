import React, { useEffect, useState, useMemo } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    MenuItem, Snackbar, Alert, TextField, TablePagination,
    CircularProgress, Typography
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    fetchSellerReturns, approveReturn, rejectReturn,
    markItemReceived, processRefund
} from '../../../Redux Toolkit/Seller/sellerReturnSlice';
import { ReturnRequest, ReturnStatus } from '../../../types/orderTypes';
import { formatDate } from '../../../customer/util/fomateDate';
import { StyledTableCell, StyledTableRow } from '../../../components/shared/Table';

const STATUS_COLOR: Record<ReturnStatus, { bg: string; border: string; text: string }> = {
    [ReturnStatus.REQUESTED]: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    [ReturnStatus.APPROVED]: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    [ReturnStatus.REJECTED]: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    [ReturnStatus.ITEM_RECEIVED]: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    [ReturnStatus.REFUND_COMPLETED]: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
};

const STATUS_LABELS: Record<ReturnStatus, string> = {
    [ReturnStatus.REQUESTED]: 'Requested',
    [ReturnStatus.APPROVED]: 'Approved',
    [ReturnStatus.REJECTED]: 'Rejected',
    [ReturnStatus.ITEM_RECEIVED]: 'Item Received',
    [ReturnStatus.REFUND_COMPLETED]: 'Refund Completed',
};

const REASON_LABELS: Record<string, string> = {
    DEFECTIVE_PRODUCT: 'Defective Product',
    WRONG_ITEM_RECEIVED: 'Wrong Item',
    NOT_AS_DESCRIBED: 'Not As Described',
    CHANGE_OF_MIND: 'Change of Mind',
    DAMAGED_IN_TRANSIT: 'Damaged In Transit',
    SIZE_OR_FIT_ISSUE: 'Size / Fit Issue',
    MISSING_ACCESSORIES: 'Missing Accessories',
    QUALITY_ISSUE: 'Quality Issue',
    OTHER: 'Other',
};

const ReturnTable = () => {
    const dispatch = useAppDispatch();
    const { sellerReturn, auth } = useAppSelector(store => store);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const [detailDialog, setDetailDialog] = useState<ReturnRequest | null>(null);
    const [approveDialog, setApproveDialog] = useState<ReturnRequest | null>(null);
    const [rejectDialog, setRejectDialog] = useState<ReturnRequest | null>(null);
    const [receiveDialog, setReceiveDialog] = useState<ReturnRequest | null>(null);
    const [refundDialog, setRefundDialog] = useState<ReturnRequest | null>(null);

    const [rejectNote, setRejectNote] = useState('');
    const [approveNote, setApproveNote] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const jwt = auth.jwt || localStorage.getItem("jwt") || "";

    useEffect(() => {
        if (!sellerReturn.returnsLoaded) {
            dispatch(fetchSellerReturns(jwt));
        }
    }, [dispatch, sellerReturn.returnsLoaded, jwt]);

    const filteredReturns = useMemo(() => {
        let result = sellerReturn.returns;

        if (statusFilter !== 'ALL') {
            result = result.filter(r => r.returnStatus === statusFilter);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.returnId.toLowerCase().includes(q) ||
                r.order.orderId.toLowerCase().includes(q) ||
                r.orderItemId.toLowerCase().includes(q) ||
                r.reason.toLowerCase().includes(q)
            );
        }

        return result;
    }, [sellerReturn.returns, statusFilter, searchQuery]);

    const paginatedReturns = useMemo(() => {
        return filteredReturns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredReturns, page, rowsPerPage]);

    const handleApprove = async () => {
        if (!approveDialog) return;
        await dispatch(approveReturn({
            jwt,
            returnId: approveDialog.id,
            sellerNote: approveNote || undefined,
        }));
        setApproveDialog(null);
        setApproveNote('');
        setSnackbar({ open: true, message: 'Return approved', severity: 'success' });
    };

    const handleReject = async () => {
        if (!rejectDialog || !rejectNote.trim()) return;
        await dispatch(rejectReturn({
            jwt,
            returnId: rejectDialog.id,
            sellerNote: rejectNote,
        }));
        setRejectDialog(null);
        setRejectNote('');
        setSnackbar({ open: true, message: 'Return rejected', severity: 'success' });
    };

    const handleReceive = async () => {
        if (!receiveDialog) return;
        await dispatch(markItemReceived({
            jwt,
            returnId: receiveDialog.id,
        }));
        setReceiveDialog(null);
        setSnackbar({ open: true, message: 'Item received — inventory restocked', severity: 'success' });
    };

    const handleRefund = async () => {
        if (!refundDialog) return;
        await dispatch(processRefund({
            jwt,
            returnId: refundDialog.id,
        }));
        setRefundDialog(null);
        setSnackbar({ open: true, message: 'Refund processed', severity: 'success' });
    };

    const renderActions = (row: ReturnRequest) => {
        switch (row.returnStatus) {
            case ReturnStatus.REQUESTED:
                return (
                    <div className="flex gap-1">
                        <Button size="small" variant="contained" color="success"
                            onClick={() => setApproveDialog(row)}>Approve</Button>
                        <Button size="small" variant="contained" color="error"
                            onClick={() => setRejectDialog(row)}>Reject</Button>
                    </div>
                );
            case ReturnStatus.APPROVED:
                return (
                    <Button size="small" variant="contained" color="secondary"
                        onClick={() => setReceiveDialog(row)}>Mark Received</Button>
                );
            case ReturnStatus.ITEM_RECEIVED:
                return (
                    <Button size="small" variant="contained" color="primary"
                        onClick={() => setRefundDialog(row)}>Process Refund</Button>
                );
            default:
                return <span className="text-xs text-gray-400">—</span>;
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <h1 className="font-bold text-xl">Returns</h1>
                <div className="flex gap-3 flex-wrap">
                    <TextField
                        size="small"
                        placeholder="Search return ID, order..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                        sx={{ minWidth: 220 }}
                    />
                    <TextField
                        size="small"
                        select
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        sx={{ minWidth: 160 }}
                    >
                        <MenuItem value="ALL">All</MenuItem>
                        {Object.values(ReturnStatus).map(s => (
                            <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
                        ))}
                    </TextField>
                </div>
            </div>

            {sellerReturn.loading && sellerReturn.returns.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                    <CircularProgress />
                </div>
            ) : filteredReturns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                    <Typography variant="h6">No returns found</Typography>
                    <Typography variant="body2">
                        {sellerReturn.returns.length === 0
                            ? 'No return requests yet'
                            : 'No returns match the current filter'}
                    </Typography>
                </div>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 290px)" }}>
                        <Table stickyHeader sx={{ minWidth: 900 }} aria-label="returns table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>Return ID</StyledTableCell>
                                    <StyledTableCell>Order ID</StyledTableCell>
                                    <StyledTableCell>Reason</StyledTableCell>
                                    <StyledTableCell align="right">Refund</StyledTableCell>
                                    <StyledTableCell align="center">Status</StyledTableCell>
                                    <StyledTableCell>Requested</StyledTableCell>
                                    <StyledTableCell align="right">Actions</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedReturns.map((row) => {
                                    const sc = STATUS_COLOR[row.returnStatus];
                                    return (
                                        <StyledTableRow key={row.id}>
                                            <StyledTableCell>
                                                <span className="font-semibold text-gray-900 cursor-pointer hover:text-teal-600"
                                                    onClick={() => setDetailDialog(row)}>
                                                    {row.returnId}
                                                </span>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <span className="font-mono text-xs text-gray-600">
                                                    {row.order.orderId}
                                                </span>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <span className="text-sm">
                                                    {REASON_LABELS[row.reason] || row.reason}
                                                </span>
                                            </StyledTableCell>
                                            <StyledTableCell align="right">
                                                <span className="font-medium text-gray-800">
                                                    ₹{row.refundAmount}.00
                                                </span>
                                            </StyledTableCell>
                                            <StyledTableCell align="center">
                                                <Chip
                                                    label={STATUS_LABELS[row.returnStatus]}
                                                    size="small"
                                                    className={`${sc.bg} ${sc.border} ${sc.text} border font-medium`}
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(row.requestedAt)}
                                                </span>
                                            </StyledTableCell>
                                            <StyledTableCell align="right">
                                                {renderActions(row)}
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={filteredReturns.length}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </>
            )}

            {/* View Details Dialog */}
            <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Return Details</DialogTitle>
                <DialogContent>
                    {detailDialog && (
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Return ID</span>
                                <span className="font-semibold">{detailDialog.returnId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order ID</span>
                                <span className="font-mono text-xs">{detailDialog.order.orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Reason</span>
                                <span>{REASON_LABELS[detailDialog.reason] || detailDialog.reason}</span>
                            </div>
                            {detailDialog.description && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Description</span>
                                    <span className="text-right max-w-[60%]">{detailDialog.description}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Refund Amount</span>
                                <span className="font-medium">₹{detailDialog.refundAmount}.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Status</span>
                                <Chip
                                    label={STATUS_LABELS[detailDialog.returnStatus]}
                                    size="small"
                                    className={`${STATUS_COLOR[detailDialog.returnStatus].bg} ${STATUS_COLOR[detailDialog.returnStatus].border} ${STATUS_COLOR[detailDialog.returnStatus].text} border font-medium`}
                                />
                            </div>
                            {detailDialog.sellerNote && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Seller Note</span>
                                    <span className="text-right max-w-[60%]">{detailDialog.sellerNote}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Requested</span>
                                <span>{formatDate(detailDialog.requestedAt)}</span>
                            </div>
                            {detailDialog.resolvedAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Resolved</span>
                                    <span>{formatDate(detailDialog.resolvedAt)}</span>
                                </div>
                            )}
                            {detailDialog.images && detailDialog.images.length > 0 && (
                                <div>
                                    <span className="text-gray-500">Images</span>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                        {detailDialog.images.map((img, i) => (
                                            <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{img}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialog(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={!!approveDialog} onClose={() => setApproveDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Approve Return</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" className="mb-3">
                        Approve return <strong>{approveDialog?.returnId}</strong>?
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        label="Seller Note (optional)"
                        value={approveNote}
                        onChange={(e) => setApproveNote(e.target.value)}
                        multiline
                        rows={2}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setApproveDialog(null); setApproveNote(''); }}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleApprove}
                        disabled={sellerReturn.loading}>
                        {sellerReturn.loading ? <CircularProgress size={20} /> : 'Approve'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={!!rejectDialog} onClose={() => setRejectDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Return</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" className="mb-3">
                        Reject return <strong>{rejectDialog?.returnId}</strong>? Please provide a reason.
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        label="Rejection Reason *"
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        multiline
                        rows={2}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setRejectDialog(null); setRejectNote(''); }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleReject}
                        disabled={sellerReturn.loading || !rejectNote.trim()}>
                        {sellerReturn.loading ? <CircularProgress size={20} /> : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Mark Received Dialog */}
            <Dialog open={!!receiveDialog} onClose={() => setReceiveDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Item Receipt</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Mark item as received for return <strong>{receiveDialog?.returnId}</strong>? This will restock inventory.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReceiveDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={handleReceive}
                        disabled={sellerReturn.loading}>
                        {sellerReturn.loading ? <CircularProgress size={20} /> : 'Confirm Receipt'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Process Refund Dialog */}
            <Dialog open={!!refundDialog} onClose={() => setRefundDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Process Refund</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Process refund of <strong>₹{refundDialog?.refundAmount}.00</strong> for return{' '}
                        <strong>{refundDialog?.returnId}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRefundDialog(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleRefund}
                        disabled={sellerReturn.loading}>
                        {sellerReturn.loading ? <CircularProgress size={20} /> : 'Process Refund'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ReturnTable;
