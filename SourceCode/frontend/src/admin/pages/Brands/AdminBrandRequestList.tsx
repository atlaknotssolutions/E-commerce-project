import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    Paper,
    Chip,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
    fetchAllBrandRequests,
    approveBrandRequest,
    rejectBrandRequest,
    clearAdminBrandRequestError,
} from "../../../Redux Toolkit/Admin/adminBrandRequestSlice";
import { StyledTableCell, StyledTableRow, EmptyRow } from '../../../components/shared/Table';
import { notification } from '../../../services/notificationService';

const statusColors: Record<string, "warning" | "success" | "error"> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "error",
};

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const AdminBrandRequestList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { requests: rawRequests, loading, error } = useAppSelector(
        (store) => store.adminBrandRequest
    );
    const requests = Array.isArray(rawRequests) ? rawRequests : [];

    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");

    const [rejectDialog, setRejectDialog] = useState<{
        open: boolean;
        id: string;
        reason: string;
    }>({ open: false, id: "", reason: "" });

    useEffect(() => {
        dispatch(fetchAllBrandRequests());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            notification.error(error);
            dispatch(clearAdminBrandRequestError());
        }
    }, [error, dispatch]);

    const handleFilter = () => {
        dispatch(
            fetchAllBrandRequests({
                status: statusFilter || undefined,
                search: search || undefined,
            })
        );
    };

    const handleApprove = async (id: string) => {
        const result = await dispatch(approveBrandRequest(id));
        if (approveBrandRequest.fulfilled.match(result)) {
            notification.success("Request approved. Brand created.");
        }
    };

    const handleReject = async () => {
        if (!rejectDialog.reason.trim()) return;
        const result = await dispatch(
            rejectBrandRequest({
                id: rejectDialog.id,
                rejectionReason: rejectDialog.reason,
            })
        );
        if (rejectBrandRequest.fulfilled.match(result)) {
            notification.success("Request rejected.");
            setRejectDialog({ open: false, id: "", reason: "" });
        }
    };

    return (
        <Box>
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
                    placeholder="Search by brand name..."
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
                <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 290px)" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Seller</StyledTableCell>
                                <StyledTableCell>Brand Name</StyledTableCell>
                                <StyledTableCell>Description</StyledTableCell>
                                <StyledTableCell>Website</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Submitted</StyledTableCell>
                                <StyledTableCell align="center">Actions</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((req) => (
                                <StyledTableRow key={req.id || req._id} hover>
                                    <StyledTableCell sx={{ maxWidth: 200 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {req.seller?.businessName || req.seller?.name || "—"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {req.seller?.email || ""}
                                        </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {req.name}
                                        </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Tooltip title={req.description || ""}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    maxWidth: 200,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {req.description || "—"}
                                            </Typography>
                                        </Tooltip>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {req.website || "—"}
                                        </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            size="small"
                                            color={statusColors[req.status]}
                                            label={req.status}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>{formatDate(req.createdAt)}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        {req.status === "PENDING" && (
                                            <>
                                                <IconButton
                                                    color="success"
                                                    onClick={() => handleApprove(req.id || req._id || "")}
                                                    title="Approve"
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() =>
                                                        setRejectDialog({
                                                            open: true,
                                                            id: req.id || req._id || "",
                                                            reason: "",
                                                        })
                                                    }
                                                    title="Reject"
                                                >
                                                    <CancelIcon />
                                                </IconButton>
                                            </>
                                        )}
                                        {req.status !== "PENDING" && (
                                            <Typography variant="caption" color="text.secondary">
                                                —
                                            </Typography>
                                        )}
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                            {requests.length === 0 ? (<EmptyRow colSpan={7} message="No brand requests found." />) : null}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={rejectDialog.open}
                onClose={() => setRejectDialog({ open: false, id: "", reason: "" })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Reject Brand Request</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Rejection Reason"
                        value={rejectDialog.reason}
                        onChange={(e) =>
                            setRejectDialog({ ...rejectDialog, reason: e.target.value })
                        }
                        multiline
                        rows={3}
                        fullWidth
                        required
                        sx={{ mt: 1 }}
                        placeholder="Provide a reason for rejection..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setRejectDialog({ open: false, id: "", reason: "" })}
                    >
                        Cancel
                    </Button>
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

        </Box>
    );
};

export default React.memo(AdminBrandRequestList);
