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
import { SellerVerification } from '../../../../types/sellerVerificationTypes';

interface SellerDetailDialogProps {
    open: boolean;
    onClose: () => void;
    seller: SellerVerification | null;
    onApprove?: (sellerId: string) => void;
    onReject?: (sellerId: string) => void;
    onSuspend?: (sellerId: string) => void;
    onRestore?: (sellerId: string) => void;
}

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
        <p className="w-36 pr-4 text-sm text-gray-500">{label}</p>
        <Divider orientation="vertical" flexItem />
        <div className="pl-4 font-medium">{value}</div>
    </div>
);

const SellerDetailDialog: React.FC<SellerDetailDialogProps> = ({
    open,
    onClose,
    seller,
    onApprove,
    onReject,
    onSuspend,
    onRestore,
}) =>
{
    if (!seller) return null;

    const isPending = seller.verificationStatus === 'PENDING';
    const isApproved = seller.accountStatus === 'ACTIVE';
    const isSuspended = seller.accountStatus === 'SUSPENDED';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    Seller Details
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box className="flex flex-col items-center mb-6">
                    <Avatar
                        sx={{ width: 80, height: 80, mb: 2 }}
                        src={seller.profileImage || undefined}
                    >
                        {!seller.profileImage && seller.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                        {seller.fullName}
                    </Typography>
                    <div className="flex gap-2 mt-2">
                        {seller.verificationStatus && (
                            <Chip
                                size="small"
                                label={`Verification: ${seller.verificationStatus}`}
                                color={getVerificationChipColor(seller.verificationStatus)}
                            />
                        )}
                        {seller.accountStatus && (
                            <Chip
                                size="small"
                                label={`Account: ${seller.accountStatus.replace(/_/g, ' ')}`}
                                color={getAccountChipColor(seller.accountStatus)}
                            />
                        )}
                    </div>
                </Box>

                <Box className="space-y-1">
                    <Typography variant="subtitle2" className="px-4 pb-1 text-gray-500">
                        Personal Information
                    </Typography>
                    <FieldRow label="Full Name" value={seller.fullName} />
                    <FieldRow label="Email" value={seller.email} />
                    <FieldRow label="Mobile" value={seller.mobile || 'Not provided'} />

                    <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                        Business Information
                    </Typography>
                    <FieldRow label="Business Name" value={seller.businessName || 'N/A'} />
                    <FieldRow label="GSTIN" value={seller.gstNumber || 'N/A'} />
                    <FieldRow
                        label="Email Verified"
                        value={seller.isEmailVerified ? 'Yes' : 'No'}
                    />

                    <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                        Account Details
                    </Typography>
                    <FieldRow label="Joined" value={formatDate(seller.createdAt)} />
                    <FieldRow label="Last Updated" value={formatDateTime(seller.updatedAt)} />
                </Box>
            </DialogContent>

            <DialogActions className="px-4 py-3 flex flex-wrap gap-2">
                {isPending && onApprove && (
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => onApprove(seller.id)}
                    >
                        Approve
                    </Button>
                )}
                {isPending && onReject && (
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => onReject(seller.id)}
                    >
                        Reject
                    </Button>
                )}
                {isApproved && onSuspend && (
                    <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={() => onSuspend(seller.id)}
                    >
                        Suspend
                    </Button>
                )}
                {isSuspended && onRestore && (
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => onRestore(seller.id)}
                    >
                        Restore
                    </Button>
                )}
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(SellerDetailDialog);
