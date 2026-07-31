import React, { useEffect, useState, useCallback } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
    Button,
    Menu,
    MenuItem,
    Chip,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Box,
    Avatar,
    TablePagination,
    Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppDispatch, useAppSelector } from '../../../../Redux Toolkit/Store';
import {
    fetchAdminUsers,
    fetchAdminUserCounts,
    fetchAdminUserById,
    updateSellerAccountStatus,
    clearSelectedUser,
} from '../../../../Redux Toolkit/Admin/adminUserSlice';
import UserDetailDialog from './UserDetailDialog';
import { StyledTableCell, StyledTableRow, LoadingRow, EmptyRow } from '../../../../components/shared/Table';

const ACCOUNT_STATUSES = [
    { status: 'PENDING_VERIFICATION', title: 'Pending Verification' },
    { status: 'ACTIVE', title: 'Active' },
    { status: 'SUSPENDED', title: 'Suspended' },
    { status: 'BANNED', title: 'Banned' },
];

const ROLE_TABS = [
    { label: 'All', value: null },
    { label: 'Customers', value: 'ROLE_CUSTOMER' },
    { label: 'Sellers', value: 'ROLE_SELLER' },
    { label: 'Admins', value: 'ROLE_ADMIN' },
];

const getRoleChipColor = (role: string): 'primary' | 'secondary' | 'default' =>
{
    switch (role)
    {
        case 'ROLE_ADMIN': return 'secondary';
        case 'ROLE_SELLER': return 'primary';
        default: return 'default';
    }
};

const getStatusChipColor = (status: string | null): 'success' | 'warning' | 'error' | 'default' =>
{
    switch (status)
    {
        case 'ACTIVE': return 'success';
        case 'PENDING_VERIFICATION': return 'warning';
        case 'SUSPENDED':
        case 'BANNED': return 'error';
        default: return 'default';
    }
};

const UsersTable: React.FC = () =>
{
    const dispatch = useAppDispatch();
    const { users, pagination, loading, error, counts, selectedUser } = useAppSelector(
        (store) => store.adminUser
    );

    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

    // Detail dialog state
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Status menu state
    const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});

    useEffect(() =>
    {
        dispatch(fetchAdminUserCounts());
    }, [dispatch]);

    useEffect(() =>
    {
        const timer = setTimeout(() =>
        {
            setSearchDebounce(searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() =>
    {
        dispatch(fetchAdminUsers({
            role: roleFilter,
            page: page + 1,
            limit: rowsPerPage,
            search: searchDebounce || undefined,
        }));
    }, [dispatch, roleFilter, page, rowsPerPage, searchDebounce]);

    const handleRoleChange = (_: React.SyntheticEvent, newValue: number) =>
    {
        setRoleFilter(ROLE_TABS[newValue].value);
        setPage(0);
    };

    const handleChangePage = (_: unknown, newPage: number) =>
    {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetails = useCallback((userId: string) =>
    {
        dispatch(fetchAdminUserById(userId));
        setDetailDialogOpen(true);
    }, [dispatch]);

    const handleDetailDialogClose = useCallback(() =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedUser());
    }, [dispatch]);

    const handleStatusMenuClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>, userId: string) =>
        {
            setAnchorEl((prev) => ({ ...prev, [userId]: event.currentTarget }));
        },
        []
    );

    const handleStatusMenuClose = useCallback((userId: string) =>
    {
        setAnchorEl((prev) => ({ ...prev, [userId]: null }));
    }, []);

    const handleStatusChange = useCallback(
        (sellerId: string, status: string) =>
        {
            dispatch(updateSellerAccountStatus({ sellerId, status }));
            setAnchorEl((prev) => ({ ...prev, [sellerId]: null }));
        },
        [dispatch]
    );

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
            {/* Role Filter Tabs */}
            <Box className="mb-4">
                <Tabs
                    value={ROLE_TABS.findIndex((t) => t.value === roleFilter)}
                    onChange={handleRoleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {ROLE_TABS.map((tab, index) =>
                    {
                        let count = 0;
                        if (index === 0 && counts) count = counts.total;
                        else if (index === 1 && counts) count = counts.ROLE_CUSTOMER;
                        else if (index === 2 && counts) count = counts.ROLE_SELLER;
                        else if (index === 3 && counts) count = counts.ROLE_ADMIN;

                        return (
                            <Tab
                                key={tab.value || 'all'}
                                label={`${tab.label} (${count})`}
                            />
                        );
                    })}
                </Tabs>
            </Box>

            {/* Search Bar */}
            <Box className="mb-4">
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, email, or mobile..."
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
            <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 290px)" }}>
                <Table sx={{ minWidth: 900 }} aria-label="admin users table" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>User</StyledTableCell>
                            <StyledTableCell>Email</StyledTableCell>
                            <StyledTableCell>Mobile</StyledTableCell>
                            <StyledTableCell>Role</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell>Joined</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && users.length === 0 ? (
                            <LoadingRow colSpan={7} />
                        ) : users.length === 0 ? (
                            <EmptyRow colSpan={7} message="No users found." />
                        ) : (
                            users.map((user) => (
                                <StyledTableRow key={user.id}>
                                    <StyledTableCell>
                                        <Box className="flex items-center gap-3">
                                            <Avatar
                                                sx={{ width: 36, height: 36 }}
                                                src={user.profileImage || undefined}
                                            >
                                                {!user.profileImage &&
                                                    user.fullName?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <div className="font-medium text-sm">
                                                    {user.fullName}
                                                </div>
                                                {user.businessName && (
                                                    <div className="text-xs text-gray-500">
                                                        {user.businessName}
                                                    </div>
                                                )}
                                            </Box>
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell>{user.email}</StyledTableCell>
                                    <StyledTableCell>{user.mobile || '—'}</StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            size="small"
                                            label={user.role.replace('ROLE_', '')}
                                            color={getRoleChipColor(user.role)}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {user.accountStatus ? (
                                            <Chip
                                                size="small"
                                                label={user.accountStatus.replace(/_/g, ' ')}
                                                color={getStatusChipColor(user.accountStatus)}
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-sm">—</span>
                                        )}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {formatDate(user.createdAt)}
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Box className="flex items-center justify-end gap-1">
                                            <Button
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewDetails(user.id)}
                                            >
                                                View
                                            </Button>
                                            {user.sellerId && (
                                                <>
                                                    <Button
                                                        size="small"
                                                        onClick={(e) =>
                                                            handleStatusMenuClick(e, user.sellerId!)
                                                        }
                                                    >
                                                        Change Status
                                                    </Button>
                                                    <Menu
                                                        anchorEl={
                                                            user.sellerId
                                                                ? anchorEl[user.sellerId]
                                                                : null
                                                        }
                                                        open={
                                                            user.sellerId
                                                                ? Boolean(anchorEl[user.sellerId])
                                                                : false
                                                        }
                                                        onClose={() =>
                                                            user.sellerId &&
                                                            handleStatusMenuClose(user.sellerId)
                                                        }
                                                    >
                                                        {ACCOUNT_STATUSES.map((s) => (
                                                            <MenuItem
                                                                key={s.status}
                                                                disabled={
                                                                    user.accountStatus === s.status
                                                                }
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        user.sellerId!,
                                                                        s.status
                                                                    )
                                                                }
                                                            >
                                                                {s.title}
                                                            </MenuItem>
                                                        ))}
                                                    </Menu>
                                                </>
                                            )}
                                        </Box>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {pagination && (
                    <TablePagination
                        component="div"
                        count={pagination.total}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[10, 20, 50]}
                    />
                )}
            </TableContainer>

            {/* User Detail Dialog */}
            <UserDetailDialog
                open={detailDialogOpen}
                onClose={handleDetailDialogClose}
                user={selectedUser}
                onStatusChange={handleStatusChange}
            />
        </>
    );
};

export default React.memo(UsersTable);
