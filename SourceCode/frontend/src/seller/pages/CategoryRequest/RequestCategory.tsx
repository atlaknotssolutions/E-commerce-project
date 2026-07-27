import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Autocomplete,
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
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
    createRequest,
    fetchMyRequests,
    clearError,
} from "../../../Redux Toolkit/Seller/sellerCategoryRequestSlice";
import { fetchCategoryTree } from "../../../Redux Toolkit/Admin/AdminCategorySlice";
import { Category } from "../../../types/categoryTypes";
import SendIcon from "@mui/icons-material/Send";
import { StyledTableCell, StyledTableRow } from '../../../components/shared/Table';

interface LocationState {
    parentCategoryId?: string;
    parentCategoryName?: string;
}

const statusColors: Record<string, "warning" | "success" | "error"> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "error",
};

const RequestCategory = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const locationState = location.state as LocationState | null;

    const { requests, loading, error, requestsLoaded } = useAppSelector((state) => state.sellerCategoryRequest);
    const { categoryTree, treeLoaded } = useAppSelector((state) => state.adminCategory);

    const [form, setForm] = useState({
        requestedName: "",
        parentCategory: locationState?.parentCategoryId || "",
        reason: "",
    });
    const [parentInputValue, setParentInputValue] = useState(locationState?.parentCategoryName || "");
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        if (!requestsLoaded) dispatch(fetchMyRequests());
        if (!treeLoaded) dispatch(fetchCategoryTree());
    }, [dispatch, requestsLoaded, treeLoaded]);

    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: "error" });
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const buildParentOptions = (
        categories: Category[],
        currentLevel: number = 0,
        path: string = ""
    ): { value: string; label: string; disabled: boolean }[] => {
        const options: { value: string; label: string; disabled: boolean }[] = [];
        for (const cat of categories) {
            const labelPath = path ? `${path} > ${cat.name}` : cat.name;
            const isLeaf = currentLevel + 1 >= 3;
            const displayLabel = isLeaf ? `${labelPath} (Leaf - Max Depth)` : labelPath;
            options.push({ value: cat._id, label: displayLabel, disabled: isLeaf });
            if (cat.children && cat.children.length > 0) {
                options.push(...buildParentOptions(cat.children, currentLevel + 1, labelPath));
            }
        }
        return options;
    };

    const parentOptions = buildParentOptions(categoryTree);

    const selectedParent = parentOptions.find((o) => o.value === form.parentCategory);

    const handleSubmit = async () => {
        if (!form.requestedName.trim()) return;
        const payload: any = { requestedName: form.requestedName.trim() };
        if (form.parentCategory) payload.parentCategory = form.parentCategory;
        if (form.reason.trim()) payload.reason = form.reason.trim();
        const result = await dispatch(createRequest(payload));
        if (createRequest.fulfilled.match(result)) {
            setSnackbar({ open: true, message: "Request submitted successfully.", severity: "success" });
            setForm({ requestedName: "", parentCategory: "", reason: "" });
            setParentInputValue("");
            dispatch(fetchMyRequests());
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} mb={3}>
                Request New Category
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Requested Category Name"
                            value={form.requestedName}
                            onChange={(e) => setForm({ ...form, requestedName: e.target.value })}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            value={selectedParent || null}
                            inputValue={parentInputValue}
                            onInputChange={(_, newValue) => setParentInputValue(newValue)}
                            onChange={(_, newValue) => {
                                setForm({
                                    ...form,
                                    parentCategory: newValue?.value || "",
                                });
                            }}
                            options={parentOptions}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            disableClearable={false}
                            renderOption={(props, option) => (
                                <li {...props} key={option.value}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                                        <span>{option.label}</span>
                                        {option.disabled && (
                                            <Chip size="small" label="Leaf" color="default" sx={{ ml: 1 }} />
                                        )}
                                    </Box>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Parent Category"
                                    placeholder="Search category..."
                                />
                            )}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Reason for Request"
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            multiline
                            rows={3}
                            fullWidth
                            placeholder="Explain why this category is needed..."
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            onClick={handleSubmit}
                            disabled={loading || !form.requestedName.trim()}
                        >
                            {loading ? <CircularProgress size={20} /> : "Submit Request"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h5" fontWeight={600} mb={2}>
                My Requests
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
                                <StyledTableCell>Requested Name</StyledTableCell>
                                <StyledTableCell>Parent Category</StyledTableCell>
                                <StyledTableCell>Level</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Reason</StyledTableCell>
                                <StyledTableCell>Date</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((req) => (
                                <StyledTableRow key={req._id} hover>
                                    <StyledTableCell>{req.requestedName}</StyledTableCell>
                                    <StyledTableCell>{req.parentCategory?.name || "—"}</StyledTableCell>
                                    <StyledTableCell>
                                        <Chip size="small" label={`Level ${req.requestedLevel}`} />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip size="small" color={statusColors[req.status]} label={req.status} />
                                    </StyledTableCell>
                                    <StyledTableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {req.reason || "—"}
                                    </StyledTableCell>
                                    <StyledTableCell>{new Date(req.createdAt).toLocaleDateString()}</StyledTableCell>
                                </StyledTableRow>
                            ))}
                            {requests.length === 0 && (
                                <StyledTableRow>
                                    <StyledTableCell colSpan={6} align="center">
                                        <Typography py={2} color="text.secondary">No requests yet.</Typography>
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

export default RequestCategory;
