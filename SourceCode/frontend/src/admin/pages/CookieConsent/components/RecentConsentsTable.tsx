import React, { useState, useMemo, useCallback } from 'react';
import {
    Box, Typography, TextField, InputAdornment, Chip, Tabs, Tab,
    TablePagination, IconButton, Tooltip, Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { StyledTableCell, StyledTableRow, LoadingRow, EmptyRow } from '../../../../components/shared/Table';
import {
    CookieConsent, ConsentPagination, ConsentStatus, PopulatedUser,
} from '../../../../types/cookieConsentTypes';

type SortField = 'acceptedAt' | 'country' | 'browser' | 'userType';
type SortOrder = 'asc' | 'desc';

interface RecentConsentsTableProps {
    consents: CookieConsent[];
    pagination: ConsentPagination | null;
    loading: boolean;
    onViewDetail: (consent: CookieConsent) => void;
}

const computeStatus = (c: CookieConsent): ConsentStatus => {
    const count = [c.analyticsAccepted, c.marketingAccepted, c.preferencesAccepted].filter(Boolean).length;
    if (count === 3) return 'accepted';
    if (count === 0) return 'rejected';
    return 'customized';
};

const STATUS_CONFIG: Record<ConsentStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
    accepted: { label: 'Accepted', color: 'success' },
    customized: { label: 'Customized', color: 'warning' },
    rejected: { label: 'Rejected', color: 'error' },
};

const USER_TYPE_MAP: Record<string, string> = {
    ROLE_CUSTOMER: 'Customer',
    ROLE_SELLER: 'Seller',
    ROLE_ADMIN: 'Admin',
};

const getUserDisplay = (consent: CookieConsent) => {
    const user = consent.userId as PopulatedUser | null;
    if (user && typeof user === 'object' && '_id' in user) {
        return { name: user.fullName, email: user.email, isRegistered: true, role: user.role };
    }
    return { name: 'Anonymous Visitor', email: null, isRegistered: false, role: null };
};

const getUserTypeLabel = (consent: CookieConsent): string => {
    const user = consent.userId as PopulatedUser | null;
    if (user && typeof user === 'object' && '_id' in user) {
        return USER_TYPE_MAP[user.role] || user.role;
    }
    return 'Guest';
};

const USER_TYPE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'info' | 'warning'> = {
    Guest: 'default',
    Customer: 'primary',
    Seller: 'secondary',
    Admin: 'info',
};

const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
        date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
};

const CategoryIcon: React.FC<{ accepted: boolean; label: string }> = ({ accepted, label }) => (
    <Tooltip title={`${label}: ${accepted ? 'Enabled' : 'Disabled'}`}>
        <Chip
            icon={accepted ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
            label={accepted ? 'On' : 'Off'}
            size="small"
            color={accepted ? 'success' : 'default'}
            variant={accepted ? 'filled' : 'outlined'}
            sx={{ minWidth: 52, '& .MuiChip-label': { fontSize: '0.7rem', px: 0.5 } }}
        />
    </Tooltip>
);

const RecentConsentsTable: React.FC<RecentConsentsTableProps> = ({
    consents,
    pagination,
    loading,
    onViewDetail,
}) => {
    const [search, setSearch] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortField, setSortField] = useState<SortField>('acceptedAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const handleSort = useCallback((field: SortField) => {
        setSortField((prev) => {
            if (prev === field) {
                setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                return prev;
            }
            setSortOrder('desc');
            return field;
        });
    }, []);

    const getSortIcon = useCallback((field: SortField) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc'
            ? <ArrowUpwardIcon sx={{ fontSize: 14, ml: 0.3 }} />
            : <ArrowDownwardIcon sx={{ fontSize: 14, ml: 0.3 }} />;
    }, [sortField, sortOrder]);

    const filtered = useMemo(() => {
        let result = [...consents];

        if (userTypeFilter !== 'all') {
            result = result.filter((c) => {
                const label = getUserTypeLabel(c);
                return label.toLowerCase() === userTypeFilter.toLowerCase();
            });
        }

        if (statusFilter !== 'all') {
            result = result.filter((c) => computeStatus(c) === statusFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase().trim();
            result = result.filter((c) => {
                const user = getUserDisplay(c);
                if (user.name?.toLowerCase().includes(q)) return true;
                if (user.email?.toLowerCase().includes(q)) return true;
                if (getUserTypeLabel(c).toLowerCase().includes(q)) return true;
                if (c.browser?.toLowerCase().includes(q)) return true;
                if (c.country?.toLowerCase().includes(q)) return true;
                return false;
            });
        }

        result.sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case 'acceptedAt':
                    cmp = new Date(a.acceptedAt).getTime() - new Date(b.acceptedAt).getTime();
                    break;
                case 'country':
                    cmp = (a.country || 'ZZZ').localeCompare(b.country || 'ZZZ');
                    break;
                case 'browser':
                    cmp = (a.browser || 'ZZZ').localeCompare(b.browser || 'ZZZ');
                    break;
                case 'userType':
                    cmp = getUserTypeLabel(a).localeCompare(getUserTypeLabel(b));
                    break;
            }
            return sortOrder === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [consents, search, userTypeFilter, statusFilter, sortField, sortOrder]);

    const paged = useMemo(() => {
        const start = page * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    const handlePageChange = useCallback((_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    }, []);

    const handleUserTypeFilterChange = useCallback((_: React.SyntheticEvent, value: string) => {
        setUserTypeFilter(value);
        setPage(0);
    }, []);

    return (
        <Paper elevation={1}>
            <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={1.5}>Consent Records</Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Search by name, email, browser, country..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        sx={{ minWidth: 320 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        size="small"
                        select
                        label="Consent Status"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        sx={{ minWidth: 160 }}
                    >
                        <Tab label="All" value="all" sx={{ minHeight: 36, textTransform: 'none' }} />
                        <Tab label="Accepted" value="accepted" sx={{ minHeight: 36, textTransform: 'none' }} />
                        <Tab label="Customized" value="customized" sx={{ minHeight: 36, textTransform: 'none' }} />
                        <Tab label="Rejected" value="rejected" sx={{ minHeight: 36, textTransform: 'none' }} />
                    </TextField>
                </Box>

                <Tabs
                    value={userTypeFilter}
                    onChange={handleUserTypeFilterChange}
                    sx={{ minHeight: 36, mb: 0.5 }}
                >
                    <Tab label="All Users" value="all" sx={{ minHeight: 36, textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }} />
                    <Tab label="Guests" value="guest" sx={{ minHeight: 36, textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }} />
                    <Tab label="Customers" value="customer" sx={{ minHeight: 36, textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }} />
                    <Tab label="Sellers" value="seller" sx={{ minHeight: 36, textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }} />
                    <Tab label="Admins" value="admin" sx={{ minHeight: 36, textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }} />
                </Tabs>
            </Box>

            <Box sx={{ px: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                    {filtered.length} record{filtered.length !== 1 ? 's' : ''} found
                </Typography>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {[
                                { label: 'User', field: null },
                                { label: 'User Type', field: 'userType' as SortField },
                                { label: 'Device', field: null },
                                { label: 'Browser', field: 'browser' as SortField },
                                { label: 'Country', field: 'country' as SortField },
                                { label: 'Status', field: null },
                                { label: 'Analytics', field: null },
                                { label: 'Marketing', field: null },
                                { label: 'Preferences', field: null },
                                { label: 'Version', field: null },
                                { label: 'Accepted At', field: 'acceptedAt' as SortField },
                                { label: '', field: null },
                            ].map((col) => (
                                <StyledTableCell
                                    key={col.label || 'actions'}
                                    sx={{
                                        cursor: col.field ? 'pointer' : 'default',
                                        userSelect: 'none',
                                        whiteSpace: 'nowrap',
                                        '&:hover': col.field ? { bgcolor: 'rgba(255,255,255,0.15)' } : {},
                                    }}
                                    onClick={col.field ? () => handleSort(col.field) : undefined}
                                >
                                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                            {col.label}
                                            {col.field && getSortIcon(col.field)}
                                        </Box>
                                </StyledTableCell>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && consents.length === 0 ? (
                            <LoadingRow colSpan={12} />
                        ) : paged.length === 0 ? (
                            <EmptyRow colSpan={12} message="No cookie consent records found." />
                        ) : (
                            paged.map((consent) => {
                                const user = getUserDisplay(consent);
                                const userType = getUserTypeLabel(consent);
                                const status = computeStatus(consent);
                                const statusCfg = STATUS_CONFIG[status];
                                const dt = formatDateTime(consent.acceptedAt);

                                return (
                                    <StyledTableRow
                                        key={consent._id}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => onViewDetail(consent)}
                                    >
                                        <StyledTableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {user.name}
                                                </Typography>
                                                {user.email && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {user.email}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Chip
                                                label={userType}
                                                size="small"
                                                color={USER_TYPE_COLORS[userType] || 'default'}
                                                variant="outlined"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Chip
                                                label={consent.deviceType}
                                                size="small"
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Typography variant="body2">{consent.browser || 'Unknown'}</Typography>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Typography variant="body2">{consent.country || 'Unknown'}</Typography>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Chip
                                                label={statusCfg.label}
                                                size="small"
                                                color={statusCfg.color}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <CategoryIcon accepted={consent.analyticsAccepted} label="Analytics" />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <CategoryIcon accepted={consent.marketingAccepted} label="Marketing" />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <CategoryIcon accepted={consent.preferencesAccepted} label="Preferences" />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Chip
                                                label={`v${consent.policyVersion}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Box>
                                                <Typography variant="body2">{dt.date}</Typography>
                                                <Typography variant="caption" color="text.secondary">{dt.time}</Typography>
                                            </Box>
                                        </StyledTableCell>
                                        <StyledTableCell align="right">
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); onViewDetail(consent); }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </Box>

            {pagination && (
                <TablePagination
                    component="div"
                    count={filtered.length}
                    page={page}
                    onPageChange={handlePageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[10, 20, 50]}
                />
            )}
        </Paper>
    );
};

export default React.memo(RecentConsentsTable);
