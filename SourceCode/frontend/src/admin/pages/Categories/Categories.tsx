import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Switch,
    FormControlLabel,
    CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
    fetchAllCategories,
    fetchCategoryTree,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
} from "../../../Redux Toolkit/Admin/AdminCategorySlice";
import CategoryTable from "./CategoryTable";
import { Category } from "../../../types/categoryTypes";
import { notification } from "../../../services/notificationService";

const Categories = () => {
    const dispatch = useAppDispatch();
    const {
        categories,
        categoryTree,
        loading,
        error,
    } = useAppSelector((state) => state.adminCategory);

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const [createForm, setCreateForm] = useState({
        name: "",
        description: "",
        parentCategory: "",
    });

    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        parentCategory: "",
        isActive: true,
    });

    useEffect(() => {
        dispatch(fetchAllCategories());
        dispatch(fetchCategoryTree());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            notification.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const resetCreateForm = () => {
        setCreateForm({ name: "", description: "", parentCategory: "" });
    };

    const handleOpenCreate = () => {
        resetCreateForm();
        setOpenCreate(true);
    };

    const handleCloseCreate = () => {
        setOpenCreate(false);
        resetCreateForm();
    };

    const handleCreateCategory = async () => {
        if (!createForm.name.trim()) return;
        const payload: any = { name: createForm.name.trim() };
        if (createForm.description.trim()) payload.description = createForm.description.trim();
        if (createForm.parentCategory) payload.parentCategory = createForm.parentCategory;
        const result = await dispatch(createCategory(payload));
        if (createCategory.fulfilled.match(result)) {
            notification.success("Category created successfully");
            handleCloseCreate();
        }
    };

    const handleOpenEdit = (category: Category) => {
        setSelectedCategory(category);
        setEditForm({
            name: category.name,
            description: category.description || "",
            parentCategory: category.parentCategory || "",
            isActive: category.isActive !== false,
        });
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        setSelectedCategory(null);
    };

    const handleUpdateCategory = async () => {
        if (!selectedCategory || !editForm.name.trim()) return;
        const payload: any = { name: editForm.name.trim() };
        if (editForm.description.trim()) payload.description = editForm.description.trim();
        payload.parentCategory = editForm.parentCategory || null;
        payload.isActive = editForm.isActive;
        const result = await dispatch(updateCategory({ id: selectedCategory._id, payload }));
        if (updateCategory.fulfilled.match(result)) {
            notification.success("Category updated successfully");
            handleCloseEdit();
        }
    };

    const handleOpenDelete = (category: Category) => {
        setSelectedCategory(category);
        setOpenDelete(true);
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
        setSelectedCategory(null);
    };

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;
        const result = await dispatch(deleteCategory(selectedCategory._id));
        if (deleteCategory.fulfilled.match(result)) {
            notification.success("Category deleted successfully");
            handleCloseDelete();
        }
    };

    const buildParentOptions = (categories: Category[], currentLevel: number = 0, path: string = ""): {
        value: string;
        label: string;
        disabled: boolean;
    }[] => {
        const options: { value: string; label: string; disabled: boolean }[] = [];
        for (const cat of categories) {
            const labelPath = path ? `${path} > ${cat.name}` : cat.name;
            const isLeaf = (currentLevel + 1) >= 3;
            const displayLabel = isLeaf ? `${labelPath} (Leaf - Max Depth)` : labelPath;
            options.push({
                value: cat._id,
                label: displayLabel,
                disabled: isLeaf,
            });
            if (cat.children && cat.children.length > 0) {
                options.push(...buildParentOptions(cat.children, currentLevel + 1, labelPath));
            }
        }
        return options;
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight={600}>
                    Categories
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Create Category
                </Button>
            </Box>

            <Typography mb={2}>Total Categories: {categories.length}</Typography>

            {loading && categories.length === 0 ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <CategoryTable
                    categories={categories}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                />
            )}

            <Dialog open={openCreate} onClose={handleCloseCreate} maxWidth="sm" fullWidth>
                <DialogTitle>Create Category</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} pt={1}>
                        <TextField
                            label="Name"
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={createForm.description}
                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Parent Category"
                            value={createForm.parentCategory}
                            onChange={(e) => setCreateForm({ ...createForm, parentCategory: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="">None (Top Level)</MenuItem>
                            {buildParentOptions(categoryTree).map((opt) => (
                                <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreate}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateCategory}
                        disabled={!createForm.name.trim() || loading}
                    >
                        {loading ? <CircularProgress size={20} /> : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} pt={1}>
                        <TextField
                            label="Name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Parent Category"
                            value={editForm.parentCategory}
                            onChange={(e) => setEditForm({ ...editForm, parentCategory: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="">None (Top Level)</MenuItem>
                            {buildParentOptions(categoryTree).map((opt) => (
                                <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editForm.isActive}
                                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                />
                            }
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateCategory}
                        disabled={!editForm.name.trim() || loading}
                    >
                        {loading ? <CircularProgress size={20} /> : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDelete} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Category</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?
                        {selectedCategory && (
                            <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                                Category ID: {selectedCategory.categoryId}
                            </Typography>
                        )}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteCategory}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={20} /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default Categories;
