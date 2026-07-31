import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
    fetchAllBrands,
    deleteBrand,
    updateBrandStatus,
    updateBrandFeatured,
    restoreBrand,
    clearAdminBrandError,
} from "../../../Redux Toolkit/Admin/adminBrandSlice";
import { Brand } from "../../../types/brandTypes";
import AdminBrandForm from "./AdminBrandForm";
import { StyledTableCell, StyledTableRow, EmptyRow } from '../../../components/shared/Table';
import { notification } from '../../../services/notificationService';

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const AdminBrandTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const { brands, loading, error } = useAppSelector(
        (store) => store.adminBrand
    );

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchDebounce, setSearchDebounce] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const [formOpen, setFormOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; brand: Brand | null }>({
        open: false,
        brand: null,
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuBrand, setMenuBrand] = useState<Brand | null>(null);

    const fetchPage = useCallback(() => {
        const params: any = {
            page: page + 1,
            limit: rowsPerPage,
        };
        if (searchDebounce) params.search = searchDebounce;
        if (statusFilter === "active") params.isActive = true;
        if (statusFilter === "inactive") params.isActive = false;
        dispatch(fetchAllBrands(params));
    }, [dispatch, page, rowsPerPage, searchDebounce, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => setSearchDebounce(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchPage();
    }, [fetchPage]);

    useEffect(() => {
        if (error) {
            notification.error(error);
            dispatch(clearAdminBrandError());
        }
    }, [error, dispatch]);

    const handleToggleStatus = async (brand: Brand) => {
        const result = await dispatch(
            updateBrandStatus({ id: brand._id, isActive: !brand.isActive })
        );
        if (updateBrandStatus.fulfilled.match(result)) {
            notification.success(`Brand ${brand.isActive ? "deactivated" : "activated"} successfully.`);
        }
    };

    const handleToggleFeatured = async (brand: Brand) => {
        const result = await dispatch(
            updateBrandFeatured({ id: brand._id, isFeatured: !brand.isFeatured })
        );
        if (updateBrandFeatured.fulfilled.match(result)) {
            notification.success(`Brand ${brand.isFeatured ? "unfeatured" : "featured"} successfully.`);
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.brand) return;
        const result = await dispatch(deleteBrand({ id: deleteDialog.brand._id }));
        if (deleteBrand.fulfilled.match(result)) {
            notification.success("Brand deleted successfully.");
            setDeleteDialog({ open: false, brand: null });
        }
    };

    const handleRestore = async (brand: Brand) => {
        const result = await dispatch(restoreBrand({ id: brand._id }));
        if (restoreBrand.fulfilled.match(result)) {
            notification.success("Brand restored successfully.");
        }
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setFormOpen(true);
        setAnchorEl(null);
    };

    const handleCreate = () => {
        setEditingBrand(null);
        setFormOpen(true);
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setEditingBrand(null);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        fetchPage();
        notification.success("Brand saved successfully.");
    };

    return (
        <Box>
            <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
                <TextField
                    label="Search brands"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ minWidth: 250 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    select
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value as any);
                        setPage(0);
                    }}
                    size="small"
                    sx={{ minWidth: 140 }}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" onClick={handleCreate}>
                    Add Brand
                </Button>
            </Box>

            {loading && brands.length === 0 ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 290px)" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Brand</StyledTableCell>
                                <StyledTableCell>Slug</StyledTableCell>
                                <StyledTableCell>Active</StyledTableCell>
                                <StyledTableCell>Featured</StyledTableCell>
                                <StyledTableCell>Order</StyledTableCell>
                                <StyledTableCell>Created</StyledTableCell>
                                <StyledTableCell align="center">Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {brands.map((brand) => (
                                <StyledTableRow key={brand._id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {brand.logo && (
                                                <Box
                                                    component="img"
                                                    src={brand.logo}
                                                    alt={brand.name}
                                                    sx={{ width: 36, height: 36, borderRadius: 1, objectFit: "cover" }}
                                                />
                                            )}
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {brand.name}
                                                </Typography>
                                                {brand.website && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {brand.website}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {brand.slug}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={brand.isActive}
                                            onChange={() => handleToggleStatus(brand)}
                                            size="small"
                                            color="success"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleToggleFeatured(brand)}
                                            color={brand.isFeatured ? "warning" : "default"}
                                        >
                                            {brand.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>{brand.displayOrder ?? 0}</TableCell>
                                    <TableCell>{formatDate(brand.createdAt)}</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                setAnchorEl(e.currentTarget);
                                                setMenuBrand(brand);
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </StyledTableRow>
                            ))}
                            {brands.length === 0 ? (<EmptyRow colSpan={7} message="No brands found." />) : null}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={brands.length}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                    />
                </TableContainer>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {
                    setAnchorEl(null);
                    setMenuBrand(null);
                }}
            >
                <MenuItem onClick={() => menuBrand && handleEdit(menuBrand)}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                {menuBrand?.isDeleted ? (
                    <MenuItem onClick={() => menuBrand && handleRestore(menuBrand)}>
                        <ListItemIcon><RestoreIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Restore</ListItemText>
                    </MenuItem>
                ) : (
                    <MenuItem
                        onClick={() => {
                            setDeleteDialog({ open: true, brand: menuBrand });
                            setAnchorEl(null);
                        }}
                    >
                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
                    </MenuItem>
                )}
            </Menu>

            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, brand: null })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete Brand</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{deleteDialog.brand?.name}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, brand: null })}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDelete} disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

            <AdminBrandForm
                open={formOpen}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
                brand={editingBrand}
            />

        </Box>
    );
};

export default React.memo(AdminBrandTable);
