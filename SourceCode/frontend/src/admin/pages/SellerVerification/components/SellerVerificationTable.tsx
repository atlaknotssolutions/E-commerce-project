import React, { useEffect, useState, useCallback } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
    Button,
    Chip,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Box,
    Avatar,
    TablePagination,
    styled,
    CircularProgress,
    Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppDispatch, useAppSelector } from '../../../../Redux Toolkit/Store';
import {
    fetchPendingSellers,
    fetchApprovedSellers,
    fetchRejectedSellers,
    fetchSuspendedSellers,
    fetchSellerDetails,
    fetchSellerVerificationStats,
    approveSeller,
    rejectSeller,
    suspendSellerAction,
    restoreSellerAction,
    clearSelectedSeller,
} from '../../../../Redux Toolkit/Admin/sellerVerificationSlice';
import SellerDetailDialog from './SellerDetailDialog';
import { ApproveDialog, RejectDialog, SuspendDialog, RestoreDialog } from './ActionDialogs';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const STATUS_TABS = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Suspended', value: 'suspended' },
];

const getVerificationChipColor = (status: string | null): 'warning' | 'success' | 'error' | 'default' =>
{
    switch (status)
    {
        case 'PENDING': return 'warning';
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'error';
        default: return 'default';
    }
};

const getAccountChipColor = (status: string | null): 'success' | 'warning' | 'error' | 'default' =>
{
    switch (status)
    {
        case 'ACTIVE': return 'success';
        case 'PENDING_VERIFICATION': return 'warning';
        case 'SUSPENDED': return 'error';
        default: return 'default';
    }
};

const SellerVerificationTable: React.FC = () =>
{
    const dispatch = useAppDispatch();
    const {
        pendingSellers,
        approvedSellers,
        rejectedSellers,
        suspendedSellers,
        pendingPagination,
        approvedPagination,
        rejectedPagination,
        suspendedPagination,
        selectedSeller,
        loading,
        error,
        actionSuccess,
    } = useAppSelector((store) => store.sellerVerification);

    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

    // Dialog states
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [actionSellerId, setActionSellerId] = useState<string | null>(null);

    const fetchSeller = useCallback((tabIndex: number, p: number, limit: number, search: string) =>
    {
        const params = { page: p + 1, limit, search: search || undefined };

        switch (tabIndex)
        {
            case 0: dispatch(fetchPendingSellers(params)); break;
            case 1: dispatch(fetchApprovedSellers(params)); break;
            case 2: dispatch(fetchRejectedSellers(params)); break;
            case 3: dispatch(fetchSuspendedSellers(params)); break;
        }
    }, [dispatch]);

    useEffect(() =>
    {
        dispatch(fetchSellerVerificationStats());
    }, [dispatch]);

    useEffect(() =>
    {
        const timer = setTimeout(() => setSearchDebounce(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() =>
    {
        fetchSeller(activeTab, page, rowsPerPage, searchDebounce);
    }, [fetchSeller, activeTab, page, rowsPerPage, searchDebounce]);

    useEffect(() =>
    {
        if (actionSuccess)
        {
            dispatch(fetchSellerVerificationStats());
            fetchSeller(activeTab, page, rowsPerPage, searchDebounce);
        }
    }, [actionSuccess, dispatch, fetchSeller, activeTab, page, rowsPerPage, searchDebounce]);

    const currentSellers = [pendingSellers, approvedSellers, rejectedSellers, suspendedSellers][activeTab];
    const currentPagination = [pendingPagination, approvedPagination, rejectedPagination, suspendedPagination][activeTab];

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) =>
    {
        setActiveTab(newValue);
        setPage(0);
        setSearchTerm('');
        setSearchDebounce('');
    };

    const handleViewDetails = useCallback((sellerId: string) =>
    {
        dispatch(fetchSellerDetails(sellerId));
        setDetailDialogOpen(true);
    }, [dispatch]);

    const handleDetailDialogClose = useCallback(() =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedSeller());
    }, [dispatch]);

    const openActionDialog = (sellerId: string, dialog: 'approve' | 'reject' | 'suspend' | 'restore') =>
    {
        setActionSellerId(sellerId);
        switch (dialog)
        {
            case 'approve': setApproveDialogOpen(true); break;
            case 'reject': setRejectDialogOpen(true); break;
            case 'suspend': setSuspendDialogOpen(true); break;
            case 'restore': setRestoreDialogOpen(true); break;
        }
    };

    const handleApproveFromDetail = useCallback((sellerId: string) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedSeller());
        openActionDialog(sellerId, 'approve');
    }, [dispatch]);

    const handleRejectFromDetail = useCallback((sellerId: string) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedSeller());
        openActionDialog(sellerId, 'reject');
    }, [dispatch]);

    const handleSuspendFromDetail = useCallback((sellerId: string) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedSeller());
        openActionDialog(sellerId, 'suspend');
    }, [dispatch]);

    const handleRestoreFromDetail = useCallback((sellerId: string) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedSeller());
        openActionDialog(sellerId, 'restore');
    }, [dispatch]);

    const formatDate = (dateStr?: string | null) =>
    {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            {/* Status Tabs */}
            <Box className="mb-4">
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {STATUS_TABS.map((tab) => (
                        <Tab key={tab.value} label={tab.label} />
                    ))}
                </Tabs>
            </Box>

            {/* Search Bar */}
            <Box className="mb-4">
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by seller name, business name, email, or mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ maxWidth: 500 }}
                />
            </Box>

            {/* Error Banner */}
            {error && (
                <Alert severity="error" className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Data Table */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 1000 }} aria-label="seller verification table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Seller Name</StyledTableCell>
                            <StyledTableCell>Business Name</StyledTableCell>
                            <StyledTableCell>Email</StyledTableCell>
                            <StyledTableCell>Mobile</StyledTableCell>
                            <StyledTableCell>Verification</StyledTableCell>
                            <StyledTableCell>Account</StyledTableCell>
                            <StyledTableCell>Joined</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && currentSellers.length === 0 ? (
                            <TableRow>
                                <StyledTableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <CircularProgress />
                                </StyledTableCell>
                            </TableRow>
                        ) : currentSellers.length === 0 ? (
                            <TableRow>
                                <StyledTableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    No sellers found.
                                </StyledTableCell>
                            </TableRow>
                        ) : (
                            currentSellers.map((seller) => (
                                <StyledTableRow key={seller.id}>
                                    <StyledTableCell>
                                        <Box className="flex items-center gap-3">
                                            <Avatar
                                                sx={{ width: 36, height: 36 }}
                                                src={seller.profileImage || undefined}
                                            >
                                                {!seller.profileImage &&
                                                    seller.fullName?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <div className="font-medium text-sm">
                                                {seller.fullName}
                                            </div>
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell>{seller.businessName || '—'}</StyledTableCell>
                                    <StyledTableCell>{seller.email}</StyledTableCell>
                                    <StyledTableCell>{seller.mobile || '—'}</StyledTableCell>
                                    <StyledTableCell>
                                        {seller.verificationStatus && (
                                            <Chip
                                                size="small"
                                                label={seller.verificationStatus}
                                                color={getVerificationChipColor(seller.verificationStatus)}
                                            />
                                        )}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {seller.accountStatus && (
                                            <Chip
                                                size="small"
                                                label={seller.accountStatus.replace(/_/g, ' ')}
                                                color={getAccountChipColor(seller.accountStatus)}
                                            />
                                        )}
                                    </StyledTableCell>
                                    <StyledTableCell>{formatDate(seller.createdAt)}</StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Box className="flex items-center justify-end gap-1">
                                            <Button
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewDetails(seller.id)}
                                            >
                                                View
                                            </Button>
                                            {seller.verificationStatus === 'PENDING' && (
                                                <>
                                                    <Button
                                                        size="small"
                                                        color="success"
                                                        onClick={() => openActionDialog(seller.id, 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => openActionDialog(seller.id, 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {seller.accountStatus === 'ACTIVE' && (
                                                <Button
                                                    size="small"
                                                    color="warning"
                                                    onClick={() => openActionDialog(seller.id, 'suspend')}
                                                >
                                                    Suspend
                                                </Button>
                                            )}
                                            {seller.accountStatus === 'SUSPENDED' && (
                                                <Button
                                                    size="small"
                                                    color="success"
                                                    onClick={() => openActionDialog(seller.id, 'restore')}
                                                >
                                                    Restore
                                                </Button>
                                            )}
                                        </Box>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {currentPagination && (
                    <TablePagination
                        component="div"
                        count={currentPagination.total}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) =>
                        {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                    />
                )}
            </TableContainer>

            {/* Seller Detail Dialog */}
            <SellerDetailDialog
                open={detailDialogOpen}
                onClose={handleDetailDialogClose}
                seller={selectedSeller}
                onApprove={handleApproveFromDetail}
                onReject={handleRejectFromDetail}
                onSuspend={handleSuspendFromDetail}
                onRestore={handleRestoreFromDetail}
            />

            {/* Action Dialogs */}
            <ApproveDialog
                open={approveDialogOpen}
                onClose={() => { setApproveDialogOpen(false); setActionSellerId(null); }}
                onConfirm={(note) =>
                {
                    if (actionSellerId)
                    {
                        dispatch(approveSeller({ sellerId: actionSellerId, note }));
                    }
                    setApproveDialogOpen(false);
                    setActionSellerId(null);
                }}
                sellerName={currentSellers.find((s) => s.id === actionSellerId)?.fullName || ''}
                loading={loading}
            />
            <RejectDialog
                open={rejectDialogOpen}
                onClose={() => { setRejectDialogOpen(false); setActionSellerId(null); }}
                onConfirm={(reason) =>
                {
                    if (actionSellerId)
                    {
                        dispatch(rejectSeller({ sellerId: actionSellerId, reason }));
                    }
                    setRejectDialogOpen(false);
                    setActionSellerId(null);
                }}
                sellerName={currentSellers.find((s) => s.id === actionSellerId)?.fullName || ''}
                loading={loading}
            />
            <SuspendDialog
                open={suspendDialogOpen}
                onClose={() => { setSuspendDialogOpen(false); setActionSellerId(null); }}
                onConfirm={(reason) =>
                {
                    if (actionSellerId)
                    {
                        dispatch(suspendSellerAction({ sellerId: actionSellerId, reason }));
                    }
                    setSuspendDialogOpen(false);
                    setActionSellerId(null);
                }}
                sellerName={currentSellers.find((s) => s.id === actionSellerId)?.fullName || ''}
                loading={loading}
            />
            <RestoreDialog
                open={restoreDialogOpen}
                onClose={() => { setRestoreDialogOpen(false); setActionSellerId(null); }}
                onConfirm={() =>
                {
                    if (actionSellerId)
                    {
                        dispatch(restoreSellerAction(actionSellerId));
                    }
                    setRestoreDialogOpen(false);
                    setActionSellerId(null);
                }}
                sellerName={currentSellers.find((s) => s.id === actionSellerId)?.fullName || ''}
                loading={loading}
            />
        </>
    );
};

export default React.memo(SellerVerificationTable);
