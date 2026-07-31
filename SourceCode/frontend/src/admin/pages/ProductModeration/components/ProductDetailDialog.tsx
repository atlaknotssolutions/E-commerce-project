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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ProductModeration } from '../../../../types/productModerationTypes';

interface ProductDetailDialogProps {
    open: boolean;
    onClose: () => void;
    product: ProductModeration | null;
    onApprove?: (productId: string) => void;
    onReject?: (productId: string) => void;
    onPublish?: (productId: string) => void;
    onUnpublish?: (productId: string) => void;
    onFeature?: (productId: string) => void;
    onUnfeature?: (productId: string) => void;
    onDelete?: (productId: string) => void;
}

const getApprovalChipColor = (status: string): 'warning' | 'success' | 'error' | 'default' =>
{
    switch (status)
    {
        case 'PENDING': return 'warning';
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'error';
        default: return 'default';
    }
};

const getPublishChipColor = (status: string): 'info' | 'success' | 'warning' | 'default' =>
{
    switch (status)
    {
        case 'PUBLISHED': return 'success';
        case 'UNPUBLISHED': return 'warning';
        case 'DRAFT': return 'info';
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

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
    open,
    onClose,
    product,
    onApprove,
    onReject,
    onPublish,
    onUnpublish,
    onFeature,
    onUnfeature,
    onDelete,
}) =>
{
    if (!product) return null;

    const isPending = product.approvalStatus === 'PENDING';
    const isApproved = product.approvalStatus === 'APPROVED';
    const isPublished = product.publishStatus === 'PUBLISHED';
    const isFeatured = product.isFeatured;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    Product Details
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box className="flex flex-col items-center mb-6">
                    <Avatar
                        sx={{ width: 80, height: 80, mb: 2 }}
                        src={product.images?.[0]?.url || undefined}
                        variant="rounded"
                    >
                        {!product.images?.length && product.title?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                        {product.title}
                    </Typography>
                    <div className="flex gap-2 mt-2 flex-wrap justify-center">
                        <Chip
                            size="small"
                            label={`Approval: ${product.approvalStatus}`}
                            color={getApprovalChipColor(product.approvalStatus)}
                        />
                        <Chip
                            size="small"
                            label={`Publish: ${product.publishStatus}`}
                            color={getPublishChipColor(product.publishStatus)}
                        />
                        {product.isFeatured && (
                            <Chip size="small" label="Featured" color="warning" />
                        )}
                    </div>
                </Box>

                <Box className="space-y-1">
                    <Typography variant="subtitle2" className="px-4 pb-1 text-gray-500">
                        Product Information
                    </Typography>
                    <FieldRow label="Title" value={product.title} />
                    <FieldRow label="Description" value={
                        <span className="text-sm max-w-md line-clamp-3">{product.description}</span>
                    } />
                    <FieldRow label="Brand" value={product.brand || 'N/A'} />
                    <FieldRow label="Color" value={product.color || 'N/A'} />
                    <FieldRow label="MRP Price" value={`₹${product.mrpPrice}`} />
                    <FieldRow label="Selling Price" value={`₹${product.sellingPrice}`} />
                    <FieldRow label="Discount" value={`${product.discountPercent}%`} />
                    <FieldRow label="Stock" value={product.quantity} />
                    <FieldRow label="Category" value={product.category?.name || product.category?.categoryId || 'N/A'} />

                    <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                        Seller Information
                    </Typography>
                    <FieldRow label="Seller Name" value={product.seller?.sellerName || 'N/A'} />
                    <FieldRow label="Business" value={product.seller?.businessDetails?.businessName || 'N/A'} />
                    <FieldRow label="Email" value={product.seller?.email || 'N/A'} />

                    <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                        Dates
                    </Typography>
                    <FieldRow label="Created" value={formatDate(product.createdAt)} />
                    <FieldRow label="Last Updated" value={formatDateTime(product.updatedAt)} />
                    {product.featuredAt && (
                        <FieldRow label="Featured At" value={formatDateTime(product.featuredAt)} />
                    )}

                    {/* Moderation History */}
                    {product.moderationHistory && product.moderationHistory.length > 0 && (
                        <>
                            <Typography variant="subtitle2" className="px-4 pt-4 pb-1 text-gray-500">
                                Moderation History
                            </Typography>
                            <Box className="px-4 py-2">
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Action</TableCell>
                                                <TableCell>Previous</TableCell>
                                                <TableCell>New</TableCell>
                                                <TableCell>Reason</TableCell>
                                                <TableCell>Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {product.moderationHistory.map((entry, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>
                                                        <Chip size="small" label={entry.action} />
                                                    </TableCell>
                                                    <TableCell>{entry.previousStatus || '—'}</TableCell>
                                                    <TableCell>{entry.newStatus || '—'}</TableCell>
                                                    <TableCell>{entry.reason || '—'}</TableCell>
                                                    <TableCell>{formatDateTime(entry.timestamp)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </>
                    )}
                </Box>
            </DialogContent>

            <DialogActions className="px-4 py-3 flex flex-wrap gap-2">
                {isPending && onApprove && (
                    <Button variant="contained" color="success" size="small" onClick={() => onApprove(product._id)}>
                        Approve
                    </Button>
                )}
                {isPending && onReject && (
                    <Button variant="contained" color="error" size="small" onClick={() => onReject(product._id)}>
                        Reject
                    </Button>
                )}
                {isApproved && !isPublished && onPublish && (
                    <Button variant="contained" color="primary" size="small" onClick={() => onPublish(product._id)}>
                        Publish
                    </Button>
                )}
                {isPublished && onUnpublish && (
                    <Button variant="contained" color="secondary" size="small" onClick={() => onUnpublish(product._id)}>
                        Unpublish
                    </Button>
                )}
                {isPublished && !isFeatured && onFeature && (
                    <Button variant="contained" color="warning" size="small" onClick={() => onFeature(product._id)}>
                        Feature
                    </Button>
                )}
                {isFeatured && onUnfeature && (
                    <Button variant="contained" color="secondary" size="small" onClick={() => onUnfeature(product._id)}>
                        Unfeature
                    </Button>
                )}
                {onDelete && (
                    <Button variant="contained" color="error" size="small" onClick={() => onDelete(product._id)}>
                        Delete
                    </Button>
                )}
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(ProductDetailDialog);
