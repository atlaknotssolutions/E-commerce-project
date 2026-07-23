import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Avatar,
    Chip,
    Divider,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdminUser } from '../../../../types/adminUserTypes';

interface UserDetailDialogProps {
    open: boolean;
    onClose: () => void;
    user: AdminUser | null;
    onStatusChange?: (sellerId: string, status: string) => void;
}

const ACCOUNT_STATUSES = [
    { status: 'PENDING_VERIFICATION', title: 'Pending Verification', color: 'warning' as const },
    { status: 'ACTIVE', title: 'Active', color: 'success' as const },
    { status: 'SUSPENDED', title: 'Suspended', color: 'error' as const },
    { status: 'BANNED', title: 'Banned', color: 'error' as const },
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

const formatDate = (dateStr?: string | null) =>
{
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatDateTime = (dateStr?: string | null) =>
{
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const FieldRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="p-4 flex items-center bg-slate-50">
        <p className="w-32 pr-4 text-sm text-gray-500">{label}</p>
        <Divider orientation="vertical" flexItem />
        <div className="pl-4 font-medium">{value}</div>
    </div>
);

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
    open,
    onClose,
    user,
    onStatusChange,
}) =>
{
    if (!user) return null;

    const isSeller = user.role === 'ROLE_SELLER';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            scroll="paper"
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    User Details
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box className="flex flex-col items-center mb-6">
                    <Avatar
                        sx={{ width: 80, height: 80, mb: 2 }}
                        src={user.profileImage || undefined}
                    >
                        {!user.profileImage && user.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                        {user.fullName}
                    </Typography>
                    <div className="flex gap-2 mt-2">
                        <Chip
                            size="small"
                            label={user.role.replace('ROLE_', '')}
                            color={getRoleChipColor(user.role)}
                        />
                        {isSeller && user.accountStatus && (
                            <Chip
                                size="small"
                                label={user.accountStatus.replace(/_/g, ' ')}
                                color={getStatusChipColor(user.accountStatus)}
                            />
                        )}
                    </div>
                </Box>

                <Box className="space-y-1">
                    <Typography variant="subtitle2" className="px-4 pb-1 text-gray-500">
                        Personal Information
                    </Typography>
                    <FieldRow label="Full Name" value={user.fullName} />
                    <FieldRow label="Email" value={user.email} />
                    <FieldRow label="Mobile" value={user.mobile || 'Not provided'} />

                    <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                        Account Details
                    </Typography>
                    <FieldRow label="Role" value={user.role.replace('ROLE_', '')} />
                    <FieldRow label="Joined" value={formatDate(user.createdAt)} />
                    <FieldRow label="Last Updated" value={formatDateTime(user.updatedAt)} />

                    {isSeller && (
                        <>
                            <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                                Business Information
                            </Typography>
                            <FieldRow label="Business Name" value={user.businessName || 'N/A'} />
                            <FieldRow label="GSTIN" value={user.gstNumber || 'N/A'} />
                            <FieldRow
                                label="Email Verified"
                                value={user.isEmailVerified ? 'Yes' : 'No'}
                            />
                        </>
                    )}
                </Box>
            </DialogContent>

            <DialogActions className="px-4 py-3">
                {isSeller && onStatusChange && (
                    <Box className="flex gap-2">
                        {ACCOUNT_STATUSES.map((s) =>
                        {
                            const isCurrentStatus = user.accountStatus === s.status;
                            return (
                                <Button
                                    key={s.status}
                                    variant={isCurrentStatus ? 'contained' : 'outlined'}
                                    color={s.color}
                                    size="small"
                                    disabled={isCurrentStatus}
                                    onClick={() => onStatusChange(user.sellerId!, s.status)}
                                >
                                    {s.title}
                                </Button>
                            );
                        })}
                    </Box>
                )}
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(UserDetailDialog);
