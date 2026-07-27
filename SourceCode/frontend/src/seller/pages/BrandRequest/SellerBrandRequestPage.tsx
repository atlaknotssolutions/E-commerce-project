import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
    Grid,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
    createBrandRequest,
    fetchSellerBrandRequests,
    clearSellerBrandRequestError,
} from "../../../Redux Toolkit/Seller/sellerBrandRequestSlice";
import SendIcon from "@mui/icons-material/Send";
import { StyledTableCell, StyledTableRow } from '../../../components/shared/Table';

const statusColors: Record<string, "warning" | "success" | "error"> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "error",
};

const SellerBrandRequestPage = () => {
    const dispatch = useAppDispatch();

    const { requests, loading, error, requestsLoaded } = useAppSelector(
        (state) => state.sellerBrandRequest
    );

    const [form, setForm] = useState({
        name: "",
        description: "",
        website: "",
    });
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    useEffect(() => {
        if (!requestsLoaded) dispatch(fetchSellerBrandRequests());
    }, [dispatch, requestsLoaded]);

    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: "error" });
            dispatch(clearSellerBrandRequestError());
        }
    }, [error, dispatch]);

    const handleSubmit = async () => {
        if (!form.name.trim()) return;
        const payload: any = { name: form.name.trim() };
        if (form.description.trim()) payload.description = form.description.trim();
        if (form.website.trim()) payload.website = form.website.trim();
        const result = await dispatch(createBrandRequest(payload));
        if (createBrandRequest.fulfilled.match(result)) {
            setSnackbar({
                open: true,
                message: "Brand request submitted successfully.",
                severity: "success",
            });
            setForm({ name: "", description: "", website: "" });
            dispatch(fetchSellerBrandRequests());
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} mb={3}>
                Request New Brand
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Brand Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            fullWidth
                            required
                            placeholder="e.g. Nike, Adidas..."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Website"
                            value={form.website}
                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                            fullWidth
                            placeholder="https://example.com"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Description"
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            multiline
                            rows={3}
                            fullWidth
                            placeholder="Brief description of the brand..."
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            onClick={handleSubmit}
                            disabled={loading || !form.name.trim()}
                        >
                            {loading ? <CircularProgress size={20} /> : "Submit Request"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h5" fontWeight={600} mb={2}>
                My Brand Requests
            </Typography>

            {loading && requests.length === 0 ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 290px)" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Brand Name</StyledTableCell>
                                <StyledTableCell>Description</StyledTableCell>
                                <StyledTableCell>Website</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Rejection Reason</StyledTableCell>
                                <StyledTableCell>Date</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((req) => (
                                <StyledTableRow key={req._id} hover>
                                    <StyledTableCell>{req.name}</StyledTableCell>
                                    <StyledTableCell
                                        sx={{
                                            maxWidth: 200,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {req.description || "—"}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {req.website ? (
                                            <Typography
                                                component="a"
                                                href={req.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                color="primary"
                                                sx={{ textDecoration: "none" }}
                                            >
                                                {req.website}
                                            </Typography>
                                        ) : (
                                            "—"
                                        )}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            size="small"
                                            color={statusColors[req.status]}
                                            label={req.status}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell
                                        sx={{
                                            maxWidth: 200,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {req.rejectionReason || "—"}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                            {requests.length === 0 && (
                                <StyledTableRow>
                                    <StyledTableCell colSpan={6} align="center">
                                        <Typography py={2} color="text.secondary">
                                            No brand requests yet.
                                        </Typography>
                                    </StyledTableCell>
                                </StyledTableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

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

export default SellerBrandRequestPage;
