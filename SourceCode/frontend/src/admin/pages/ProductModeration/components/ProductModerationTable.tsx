import React, { useEffect, useState, useCallback } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
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
    Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppDispatch, useAppSelector } from '../../../../Redux Toolkit/Store';
import {
    fetchPendingProducts,
    fetchApprovedProducts,
    fetchRejectedProducts,
    fetchPublishedProducts,
    fetchUnpublishedProducts,
    fetchFeaturedProducts,
    fetchProductDetails,
    fetchProductModerationStats,
    approveProductAction,
    rejectProductAction,
    publishProductAction,
    unpublishProductAction,
    featureProductAction,
    unfeatureProductAction,
    deleteProductAction,
    clearSelectedProduct,
} from '../../../../Redux Toolkit/Admin/adminProductModerationSlice';
import ProductDetailDialog from './ProductDetailDialog';
import {
    ApproveDialog,
    RejectDialog,
    PublishDialog,
    UnpublishDialog,
    UnfeatureDialog,
    DeleteDialog,
} from './ActionDialogs';
import { StyledTableCell, StyledTableRow, LoadingRow, EmptyRow } from '../../../../components/shared/Table';

const STATUS_TABS = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Published', value: 'published' },
    { label: 'Unpublished', value: 'unpublished' },
    { label: 'Featured', value: 'featured' },
];

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

const ProductModerationTable: React.FC = () =>
{
    const dispatch = useAppDispatch();
    const {
        pendingProducts,
        approvedProducts,
        rejectedProducts,
        publishedProducts,
        unpublishedProducts,
        featuredProducts,
        pendingPagination,
        approvedPagination,
        rejectedPagination,
        publishedPagination,
        unpublishedPagination,
        featuredPagination,
        selectedProduct,
        loading,
        error,
        actionSuccess,
    } = useAppSelector((store) => store.adminProductModeration || {
        pendingProducts: [],
        approvedProducts: [],
        rejectedProducts: [],
        publishedProducts: [],
        unpublishedProducts: [],
        featuredProducts: [],
        pendingPagination: null,
        approvedPagination: null,
        rejectedPagination: null,
        publishedPagination: null,
        unpublishedPagination: null,
        featuredPagination: null,
        selectedProduct: null,
        loading: false,
        error: null,
        actionSuccess: false,
    });

    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

    // Dialog states
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
    const [unfeatureDialogOpen, setUnfeatureDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actionProductId, setActionProductId] = useState<string | null>(null);

    const fetchProducts = useCallback((tabIndex: number, p: number, limit: number, search: string) =>
    {
        const params = { page: p + 1, limit, search: search || undefined };

        switch (tabIndex)
        {
            case 0: dispatch(fetchPendingProducts(params)); break;
            case 1: dispatch(fetchApprovedProducts(params)); break;
            case 2: dispatch(fetchRejectedProducts(params)); break;
            case 3: dispatch(fetchPublishedProducts(params)); break;
            case 4: dispatch(fetchUnpublishedProducts(params)); break;
            case 5: dispatch(fetchFeaturedProducts(params)); break;
        }
    }, [dispatch]);

    useEffect(() =>
    {
        dispatch(fetchProductModerationStats());
    }, [dispatch]);

    useEffect(() =>
    {
        const timer = setTimeout(() => setSearchDebounce(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() =>
    {
        fetchProducts(activeTab, page, rowsPerPage, searchDebounce);
    }, [fetchProducts, activeTab, page, rowsPerPage, searchDebounce]);

    useEffect(() =>
    {
        if (actionSuccess)
        {
            dispatch(fetchProductModerationStats());
            fetchProducts(activeTab, page, rowsPerPage, searchDebounce);
        }
    }, [actionSuccess, dispatch, fetchProducts, activeTab, page, rowsPerPage, searchDebounce]);

    const allProductsArrays = [pendingProducts, approvedProducts, rejectedProducts, publishedProducts, unpublishedProducts, featuredProducts];
    const allPagination = [pendingPagination, approvedPagination, rejectedPagination, publishedPagination, unpublishedPagination, featuredPagination];
    const currentProducts = allProductsArrays[activeTab];
    const currentPagination = allPagination[activeTab];

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) =>
    {
        setActiveTab(newValue);
        setPage(0);
        setSearchTerm('');
        setSearchDebounce('');
    };

    const handleViewDetails = useCallback((productId: string) =>
    {
        dispatch(fetchProductDetails(productId));
        setDetailDialogOpen(true);
    }, [dispatch]);

    const handleDetailDialogClose = useCallback(() =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedProduct());
    }, [dispatch]);

    const openActionDialog = (productId: string, dialog: 'approve' | 'reject' | 'publish' | 'unpublish' | 'unfeature' | 'delete') =>
    {
        setActionProductId(productId);
        switch (dialog)
        {
            case 'approve': setApproveDialogOpen(true); break;
            case 'reject': setRejectDialogOpen(true); break;
            case 'publish': setPublishDialogOpen(true); break;
            case 'unpublish': setUnpublishDialogOpen(true); break;
            case 'unfeature': setUnfeatureDialogOpen(true); break;
            case 'delete': setDeleteDialogOpen(true); break;
        }
    };

    const handleApproveFromDetail = useCallback((productId: string) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedProduct());
        openActionDialog(productId, 'approve');
    }, [dispatch]);

    const handleRejectFromDetail = useCallback((productId: string) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedProduct());
        openActionDialog(productId, 'reject');
    }, [dispatch]);

    const handlePublishFromDetail = useCallback((productId: string) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedProduct());
        openActionDialog(productId, 'publish');
    }, [dispatch]);

    const handleUnpublishFromDetail = useCallback((productId: string) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedProduct());
        openActionDialog(productId, 'unpublish');
    }, [dispatch]);

    const handleFeatureFromDetail = useCallback((productId: string) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedProduct());
        dispatch(featureProductAction(productId));
    }, [dispatch]);

    const handleUnfeatureFromDetail = useCallback((productId: string) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedProduct());
        openActionDialog(productId, 'unfeature');
    }, [dispatch]);

    const handleDeleteFromDetail = useCallback((productId: string) =>
    {
        setDetailDialogOpen(false);
        dispatch(clearSelectedProduct());
        openActionDialog(productId, 'delete');
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
                    placeholder="Search by product title or brand..."
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
                <Table sx={{ minWidth: 1100 }} aria-label="product moderation table" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Product</StyledTableCell>
                            <StyledTableCell>Brand</StyledTableCell>
                            <StyledTableCell>Seller</StyledTableCell>
                            <StyledTableCell>Price</StyledTableCell>
                            <StyledTableCell>Approval</StyledTableCell>
                            <StyledTableCell>Publish</StyledTableCell>
                            <StyledTableCell>Featured</StyledTableCell>
                            <StyledTableCell>Created</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && currentProducts.length === 0 ? (
                            <LoadingRow colSpan={9} />
                        ) : currentProducts.length === 0 ? (
                            <EmptyRow colSpan={9} message="No products found." />
                        ) : (
                            currentProducts.map((product) => (
                                <StyledTableRow key={product._id}>
                                    <StyledTableCell>
                                        <Box className="flex items-center gap-3">
                                            <Avatar
                                                sx={{ width: 36, height: 36 }}
                                                src={product.images?.[0]?.url || undefined}
                                                variant="rounded"
                                            >
                                                {!product.images?.length &&
                                                    product.title?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <div className="font-medium text-sm max-w-[200px] truncate">
                                                {product.title}
                                            </div>
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell>{product.brand || '—'}</StyledTableCell>
                                    <StyledTableCell>
                                        {product.seller?.sellerName || product.seller?.businessDetails?.businessName || '—'}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <div className="text-sm">
                                            <span className="font-semibold">₹{product.sellingPrice}</span>
                                            {product.mrpPrice > product.sellingPrice && (
                                                <span className="text-gray-400 line-through text-xs ml-1">
                                                    ₹{product.mrpPrice}
                                                </span>
                                            )}
                                        </div>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            size="small"
                                            label={product.approvalStatus}
                                            color={getApprovalChipColor(product.approvalStatus)}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            size="small"
                                            label={product.publishStatus}
                                            color={getPublishChipColor(product.publishStatus)}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {product.isFeatured ? (
                                            <Chip size="small" label="Featured" color="warning" />
                                        ) : (
                                            <Chip size="small" label="No" variant="outlined" />
                                        )}
                                    </StyledTableCell>
                                    <StyledTableCell>{formatDate(product.createdAt)}</StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Box className="flex items-center justify-end gap-1">
                                            <Button
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewDetails(product._id)}
                                            >
                                                View
                                            </Button>
                                            {product.approvalStatus === 'PENDING' && (
                                                <>
                                                    <Button
                                                        size="small"
                                                        color="success"
                                                        onClick={() => openActionDialog(product._id, 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => openActionDialog(product._id, 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {product.approvalStatus === 'APPROVED' && product.publishStatus !== 'PUBLISHED' && (
                                                <Button
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => openActionDialog(product._id, 'publish')}
                                                >
                                                    Publish
                                                </Button>
                                            )}
                                            {product.publishStatus === 'PUBLISHED' && (
                                                <>
                                                    {!product.isFeatured && (
                                                        <Button
                                                            size="small"
                                                            color="warning"
                                                            onClick={() => dispatch(featureProductAction(product._id))}
                                                        >
                                                            Feature
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="small"
                                                        color="secondary"
                                                        onClick={() => openActionDialog(product._id, 'unpublish')}
                                                    >
                                                        Unpublish
                                                    </Button>
                                                </>
                                            )}
                                            {product.isFeatured && (
                                                <Button
                                                    size="small"
                                                    color="secondary"
                                                    onClick={() => openActionDialog(product._id, 'unfeature')}
                                                >
                                                    Unfeature
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

            {/* Product Detail Dialog */}
            <ProductDetailDialog
                open={detailDialogOpen}
                onClose={handleDetailDialogClose}
                product={selectedProduct}
                onApprove={handleApproveFromDetail}
                onReject={handleRejectFromDetail}
                onPublish={handlePublishFromDetail}
                onUnpublish={handleUnpublishFromDetail}
                onFeature={handleFeatureFromDetail}
                onUnfeature={handleUnfeatureFromDetail}
                onDelete={handleDeleteFromDetail}
            />

            {/* Action Dialogs */}
            <ApproveDialog
                open={approveDialogOpen}
                onClose={() => { setApproveDialogOpen(false); setActionProductId(null); }}
                onConfirm={(note) =>
                {
                    if (actionProductId)
                    {
                        dispatch(approveProductAction({ productId: actionProductId, note }));
                    }
                    setApproveDialogOpen(false);
                    setActionProductId(null);
                }}
                productName={currentProducts.find((p) => p._id === actionProductId)?.title || ''}
                loading={loading}
            />
            <RejectDialog
                open={rejectDialogOpen}
                onClose={() => { setRejectDialogOpen(false); setActionProductId(null); }}
                onConfirm={(reason) =>
                {
                    if (actionProductId)
                    {
                        dispatch(rejectProductAction({ productId: actionProductId, reason }));
                    }
                    setRejectDialogOpen(false);
                    setActionProductId(null);
                }}
                productName={currentProducts.find((p) => p._id === actionProductId)?.title || ''}
                loading={loading}
            />
            <PublishDialog
                open={publishDialogOpen}
                onClose={() => { setPublishDialogOpen(false); setActionProductId(null); }}
                onConfirm={() =>
                {
                    if (actionProductId)
                    {
                        dispatch(publishProductAction(actionProductId));
                    }
                    setPublishDialogOpen(false);
                    setActionProductId(null);
                }}
                productName={currentProducts.find((p) => p._id === actionProductId)?.title || ''}
                loading={loading}
            />
            <UnpublishDialog
                open={unpublishDialogOpen}
                onClose={() => { setUnpublishDialogOpen(false); setActionProductId(null); }}
                onConfirm={(reason) =>
                {
                    if (actionProductId)
                    {
                        dispatch(unpublishProductAction({ productId: actionProductId, reason }));
                    }
                    setUnpublishDialogOpen(false);
                    setActionProductId(null);
                }}
                productName={currentProducts.find((p) => p._id === actionProductId)?.title || ''}
                loading={loading}
            />
            <UnfeatureDialog
                open={unfeatureDialogOpen}
                onClose={() => { setUnfeatureDialogOpen(false); setActionProductId(null); }}
                onConfirm={(reason) =>
                {
                    if (actionProductId)
                    {
                        dispatch(unfeatureProductAction({ productId: actionProductId, reason }));
                    }
                    setUnfeatureDialogOpen(false);
                    setActionProductId(null);
                }}
                productName={currentProducts.find((p) => p._id === actionProductId)?.title || ''}
                loading={loading}
            />
            <DeleteDialog
                open={deleteDialogOpen}
                onClose={() => { setDeleteDialogOpen(false); setActionProductId(null); }}
                onConfirm={(reason) =>
                {
                    if (actionProductId)
                    {
                        dispatch(deleteProductAction({ productId: actionProductId, reason }));
                    }
                    setDeleteDialogOpen(false);
                    setActionProductId(null);
                }}
                productName={currentProducts.find((p) => p._id === actionProductId)?.title || ''}
                loading={loading}
            />
        </>
    );
};

export default React.memo(ProductModerationTable);
