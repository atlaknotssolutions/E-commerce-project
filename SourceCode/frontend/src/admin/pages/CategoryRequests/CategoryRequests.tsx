import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    MenuItem,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Snackbar,
    Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
    fetchAllRequests,
    approveRequest,
    rejectRequest,
    clearError,
} from "../../../Redux Toolkit/Admin/AdminCategoryRequestSlice";
import { fetchCategoryTree } from "../../../Redux Toolkit/Admin/AdminCategorySlice";
import { Category } from "../../../types/categoryTypes";

const statusColors: Record<string, "warning" | "success" | "error"> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "error",
};

const buildHierarchyPath = (
    categoryId: string | null | undefined,
    tree: Category[],
    level: number = 0,
    path: string = ""
): string => {
    if (!categoryId) return "—";
    const idStr = typeof categoryId === 'object' ? (categoryId as any)._id || '' : categoryId;
    if (!idStr) return "—";
    for (const cat of tree) {
        if (cat._id === idStr) {
            const label = path ? `${path} > ${cat.name}` : cat.name;
            return `${"  ".repeat(level)}${label}`;
        }
        if (cat.children) {
            const found = buildHierarchyPath(idStr, cat.children, level + 1, path ? `${path} > ${cat.name}` : cat.name);
            if (found !== "—") return found;
        }
    }
    return idStr;
};

const CategoryRequests = () => {
    const dispatch = useAppDispatch();
    const { requests, loading, error } = useAppSelector((state) => state.adminCategoryRequest);
    const { categoryTree } = useAppSelector((state) => state.adminCategory);

    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");

    const [approveDialog, setApproveDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string; reason: string }>({
        open: false,
        id: "",
        reason: "",
    });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        dispatch(fetchAllRequests());
        dispatch(fetchCategoryTree());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: "error" });
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleFilter = () => {
        dispatch(fetchAllRequests({ status: statusFilter || undefined, search: search || undefined }));
    };

    const handleDirectApprove = async (id: string) => {
        const result = await dispatch(approveRequest(id));
        if (approveRequest.fulfilled.match(result)) {
            setSnackbar({ open: true, message: "Request approved. Category created.", severity: "success" });
        }
    };

    const handleDialogApprove = async () => {
        const result = await dispatch(approveRequest(approveDialog.id));
        if (approveRequest.fulfilled.match(result)) {
            setSnackbar({ open: true, message: "Request approved. Category created.", severity: "success" });
            setApproveDialog({ open: false, id: "" });
        }
    };

    const handleReject = async () => {
        if (!rejectDialog.reason.trim()) return;
        const result = await dispatch(rejectRequest({ id: rejectDialog.id, rejectionReason: rejectDialog.reason }));
        if (rejectRequest.fulfilled.match(result)) {
            setSnackbar({ open: true, message: "Request rejected.", severity: "success" });
            setRejectDialog({ open: false, id: "", reason: "" });
        }
    };

    const getParentPath = useCallback(
        (parentId: string | undefined | null) => buildHierarchyPath(parentId, categoryTree),
        [categoryTree]
    );

    return (
        <Box p={3}>
            <Typography variant="h4" fontWeight={600} mb={3}>
                Category Requests
            </Typography>

            <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
                <TextField
                    select
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 140 }}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                </TextField>
                <TextField
                    label="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    sx={{ minWidth: 200 }}
                    placeholder="Search by category name..."
                />
                <Button variant="outlined" onClick={handleFilter}>
                    Apply
                </Button>
            </Box>

            {loading && requests.length === 0 ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Seller</TableCell>
                                <TableCell>Requested Name</TableCell>
                                <TableCell>Parent Hierarchy</TableCell>
                                <TableCell>Level</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Audit</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={req._id} hover>
                                    <TableCell sx={{ maxWidth: 150 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {req.seller?.sellerName || "—"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {req.seller?.email || ""}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {req.requestedName}
                                        </Typography>
                                        {req.reason && (
                                            <Tooltip title={req.reason}>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    "{req.reason}"
                                                </Typography>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                            {getParentPath(
                                                typeof req.parentCategory === 'object' && req.parentCategory?._id
                                                    ? req.parentCategory._id
                                                    : req.parentCategory as string | null | undefined
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="small" label={`Level ${req.requestedLevel}`} />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            color={statusColors[req.status]}
                                            label={req.status}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 200 }}>
                                        <Typography variant="caption" display="block">
                                            <strong>Requested:</strong> {new Date(req.createdAt).toLocaleDateString()}
                                        </Typography>
                                        {req.status === "APPROVED" && (
                                            <Typography variant="caption" display="block" color="success.main">
                                                <strong>Approved by:</strong> {req.approvedBy?.name || "—"} on {req.approvedAt ? new Date(req.approvedAt).toLocaleDateString() : "—"}
                                            </Typography>
                                        )}
                                        {req.status === "REJECTED" && (
                                            <>
                                                <Typography variant="caption" display="block" color="error.main">
                                                    <strong>Rejected by:</strong> {req.rejectedBy?.name || "—"} on {req.rejectedAt ? new Date(req.rejectedAt).toLocaleDateString() : "—"}
                                                </Typography>
                                                {req.rejectionReason && (
                                                    <Typography variant="caption" display="block" color="error.main">
                                                        <strong>Reason:</strong> {req.rejectionReason}
                                                    </Typography>
                                                )}
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {req.status === "PENDING" && (
                                            <>
                                                <IconButton
                                                    color="success"
                                                    onClick={() => handleDirectApprove(req._id)}
                                                    title="Approve Now"
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="info"
                                                    onClick={() => setApproveDialog({ open: true, id: req._id })}
                                                    title="Approve with Edit"
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => setRejectDialog({ open: true, id: req._id, reason: "" })}
                                                    title="Reject"
                                                >
                                                    <CancelIcon />
                                                </IconButton>
                                            </>
                                        )}
                                        {req.status !== "PENDING" && (
                                            <Typography variant="caption" color="text.secondary">—</Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {requests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography py={2} color="text.secondary">No requests found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={approveDialog.open} onClose={() => setApproveDialog({ open: false, id: "" })} maxWidth="xs" fullWidth>
                <DialogTitle>Approve Request</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to approve this request?</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        The category will be created automatically.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApproveDialog({ open: false, id: "" })}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleDialogApprove} disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : "Approve"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: "", reason: "" })} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Request</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Rejection Reason"
                        value={rejectDialog.reason}
                        onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
                        multiline
                        rows={3}
                        fullWidth
                        required
                        sx={{ mt: 1 }}
                        placeholder="Provide a reason for rejection..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialog({ open: false, id: "", reason: "" })}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleReject}
                        disabled={loading || !rejectDialog.reason.trim()}
                    >
                        {loading ? <CircularProgress size={20} /> : "Reject"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CategoryRequests;
