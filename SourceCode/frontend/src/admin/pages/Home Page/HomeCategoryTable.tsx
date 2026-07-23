import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, IconButton, Modal, styled, Button, TextField, MenuItem,
  Autocomplete,
  Chip, Switch, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Snackbar, TablePagination, Skeleton,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import Checkbox from "@mui/material/Checkbox";
import {
  DragDropContext, Droppable, Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { HomeCategory } from "../../../types/homeDataTypes";
import { Category } from "../../../types/categoryTypes";
import {
  createHomeCategory, deleteHomeCategory, updateHomeCategory,
  fetchHomeCategories, clearMessages,
  toggleHomeCategoryStatus, reorderHomeCategories,
} from "../../../Redux Toolkit/Admin/AdminSlice";
import { fetchCategoryTree } from "../../../Redux Toolkit/Customer/Customer/AsyncThunk";
import UpdateHomeCategoryForm from "./UpdateHomeCategoryForm";
import ImageUpload from "../../components/ImageUpload";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": { backgroundColor: theme.palette.action.hover },
  "&:last-child td, &:last-child th": { border: 0 },
}));

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const ROWS_PER_PAGE = 10;

const SECTION_LIMITS: Record<string, number> = {
  GRID: 8,
  DEALS: 20,
  ELECTRIC_CATEGORIES: 12,
  SHOP_BY_CATEGORIES: 16,
};

interface Props {
  section: string;
}

function HomeCategoryTable({ section }: Props) {
  const dispatch = useAppDispatch();
  const {
    categories, loading, error,
    categoryCreated, categoryDeleted, categoryUpdated, categoryStatusUpdated,
  } = useAppSelector((store) => store.admin);
  const { categoryTree } = useAppSelector((store) => store.homePage);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<HomeCategory | undefined>();
  const [openEdit, setOpenEdit] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    image: "", section,
    category: "", category2: "", category3: "",
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [moveSection, setMoveSection] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false, message: "", severity: "success",
  });

  useEffect(() => {
    dispatch(fetchHomeCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categoryTree.length === 0) {
      dispatch(fetchCategoryTree());
    }
  }, [dispatch, categoryTree.length]);

  useEffect(() => {
    if (categoryCreated) {
      setSnackbar({ open: true, message: "Category created successfully.", severity: "success" });
      dispatch(clearMessages());
      handleCloseCreate();
      dispatch(fetchHomeCategories());
    }
    if (categoryDeleted) {
      setSnackbar({ open: true, message: "Category deleted successfully.", severity: "success" });
      dispatch(clearMessages());
      setDeleteTarget(null);
      dispatch(fetchHomeCategories());
    }
    if (categoryUpdated || categoryStatusUpdated) {
      setSnackbar({ open: true, message: "Category updated successfully.", severity: "success" });
      dispatch(clearMessages());
    }
    if (error) {
      setSnackbar({ open: true, message: friendlyError(error), severity: "error" });
      dispatch(clearMessages());
    }
  }, [categoryCreated, categoryDeleted, categoryUpdated, categoryStatusUpdated, error, dispatch]);

  const level1List = categoryTree.filter((c: Category) => c.level === 1);
  const selLevel1 = level1List.find((c: Category) => c.categoryId === createForm.category);
  const level2List = selLevel1?.children || [];
  const selLevel2 = level2List.find((c: Category) => c.categoryId === createForm.category2);
  const level3List = selLevel2?.children || [];
  const selLevel3 = level3List.find((c: Category) => c.categoryId === createForm.category3);

  const isLeafValid = !!selLevel3 && selLevel3.isActive !== false && selLevel3.level === 3;

  const sectionCategories = categories.filter(
    (c: HomeCategory) => c.section === section
  );

  const filtered = sectionCategories.filter(
    (c: HomeCategory) => c.name?.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  const sectionLimit = SECTION_LIMITS[section] ?? Infinity;
  const sectionCount = sectionCategories.length;
  const limitReached = sectionCount >= sectionLimit;

  const allSelected = paged.every((c: HomeCategory) => c.id && selectedIds.has(c.id));
  const someSelected = paged.some((c: HomeCategory) => c.id && selectedIds.has(c.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      const ids = new Set(selectedIds);
      paged.forEach((c: HomeCategory) => { if (c.id) ids.add(c.id); });
      setSelectedIds(ids);
    }
  };

  const handleSelectOne = (id: string) => {
    const ids = new Set(selectedIds);
    if (ids.has(id)) ids.delete(id); else ids.add(id);
    setSelectedIds(ids);
  };

  const friendlyError = (raw: string | null): string => {
    if (!raw) return "An unexpected error occurred.";
    if (raw.includes("DUPLICATE_HOME_CATEGORY") || raw.includes("already exists")) {
      return "This category already exists in this section. Duplicate entries are not allowed.";
    }
    if (raw.includes("SECTION_LIMIT_REACHED") || raw.includes("Maximum items reached")) {
      return "Section limit reached. Please remove some items before adding new ones.";
    }
    if (raw.includes("Network Error") || raw.includes("network")) {
      return "Network error. Please check your connection and try again.";
    }
    if (raw.includes("not found") || raw.includes("NOT_FOUND")) {
      return "Item not found. It may have been deleted by another admin.";
    }
    return raw;
  };

  const executeBulkAction = (action: string) => {
    const ids = Array.from(selectedIds);
    if (action === "enable") {
      ids.forEach((id) => dispatch(toggleHomeCategoryStatus({ id, isActive: true })));
      setSnackbar({ open: true, message: `${ids.length} item(s) enabled.`, severity: "success" });
    } else if (action === "disable") {
      ids.forEach((id) => dispatch(toggleHomeCategoryStatus({ id, isActive: false })));
      setSnackbar({ open: true, message: `${ids.length} item(s) disabled.`, severity: "success" });
    } else if (action === "delete") {
      ids.forEach((id) => dispatch(deleteHomeCategory(id)));
      setSnackbar({ open: true, message: `${ids.length} item(s) deleted.`, severity: "success" });
    } else if (action === "move" && moveSection) {
      ids.forEach((id) => dispatch(updateHomeCategory({ id, data: { section: moveSection } })));
      setSnackbar({ open: true, message: `${ids.length} item(s) moved to ${moveSection}.`, severity: "success" });
      setMoveSection("");
    }
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  const handleOpenEdit = (cat: HomeCategory) => {
    setSelectedCategory(cat);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedCategory(undefined);
  };

  const handleOpenCreate = () => {
    setCreateForm({ image: "", section, category: "", category2: "", category3: "" });
    setOpenCreate(true);
  };
  const handleCloseCreate = () => setOpenCreate(false);

  const handleCreate = () => {
    if (!createForm.image.trim() || !isLeafValid) return;
    dispatch(createHomeCategory({
      name: selLevel3.name,
      image: createForm.image,
      categoryId: createForm.category3,
      section,
    }));
  };

  const handleToggleStatus = (cat: HomeCategory) => {
    if (cat.id) {
      dispatch(toggleHomeCategoryStatus({ id: cat.id, isActive: !cat.isActive }));
    }
  };

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const reordered: HomeCategory[] = Array.from(filtered);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const items = reordered
      .filter((item): item is HomeCategory & { id: string } => !!item.id)
      .map((item, index) => ({
        id: item.id,
        displayOrder: index,
      }));
    dispatch(reorderHomeCategories(items));
  }, [dispatch, filtered]);

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <TextField
          size="small" placeholder="Search..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ minWidth: 240 }}
          inputProps={{ "aria-label": "Search categories" }}
        />
        <Box display="flex" alignItems="center" gap={1}>
          {limitReached && (
            <Typography variant="caption" color="text.secondary">
              Maximum items reached ({sectionLimit}).
            </Typography>
          )}
          <Button
            variant="contained" startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={limitReached}
          >
            Create
          </Button>
        </Box>
      </Box>

      {selectedIds.size > 0 && (
        <Paper sx={{ mb: 1, p: 1, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="body2">{selectedIds.size} selected</Typography>
          <Button size="small" variant="outlined" color="success"
            aria-label={`Enable ${selectedIds.size} selected items`}
            onClick={() => { setBulkAction("enable"); executeBulkAction("enable"); }}>
            Enable
          </Button>
          <Button size="small" variant="outlined" color="warning"
            aria-label={`Disable ${selectedIds.size} selected items`}
            onClick={() => { setBulkAction("disable"); executeBulkAction("disable"); }}>
            Disable
          </Button>
          <Button size="small" variant="outlined" color="error"
            aria-label={`Delete ${selectedIds.size} selected items`}
            onClick={() => setBulkAction("delete")}>
            Delete
          </Button>
          <Button size="small" variant="outlined"
            aria-label={`Move ${selectedIds.size} selected items`}
            onClick={() => setBulkAction("move")}>
            Move Section
          </Button>
        </Paper>
      )}

      {loading && categories.length === 0 ? (
        <Box>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 0.5, borderRadius: 1 }} />
          ))}
        </Box>
      ) : paged.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No {section.toLowerCase().replace(/_/g, " ")} items found.</Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell sx={{ width: 40 }}></StyledTableCell>
                    <StyledTableCell sx={{ width: 40 }}>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={!allSelected && someSelected}
                        onChange={handleSelectAll}
                        size="small"
                        sx={{ color: "#fff" }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>#</StyledTableCell>
                    <StyledTableCell>Image</StyledTableCell>
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell>Category ID</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell align="right">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <Droppable droppableId="home-category-table" type="ROW">
                  {(provided) => (
                    <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                      {paged.map((category: HomeCategory, index: number) => (
                        <Draggable
                          key={category.id || index}
                          draggableId={category.id || String(index)}
                          index={index}
                        >
                          {(dragProvided) => (
                            <StyledTableRow
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              sx={{
                                "&:hover .drag-handle": { opacity: 1 },
                              }}
                            >
                              <StyledTableCell sx={{ width: 40 }}>
                                <Box
                                  {...dragProvided.dragHandleProps}
                                  className="drag-handle"
                                  sx={{
                                    display: "flex",
                                    cursor: "grab",
                                    opacity: 0.3,
                                    transition: "opacity 0.2s",
                                    color: "text.secondary",
                                  }}
                                >
                                  <DragIndicatorIcon fontSize="small" />
                                </Box>
                              </StyledTableCell>
                              <StyledTableCell sx={{ width: 40 }}>
                                <Checkbox
                                  checked={!!category.id && selectedIds.has(category.id)}
                                  onChange={() => category.id && handleSelectOne(category.id)}
                                  size="small"
                                />
                              </StyledTableCell>
                              <StyledTableCell>{page * ROWS_PER_PAGE + index + 1}</StyledTableCell>
                              <StyledTableCell>
                                <img className="w-20 rounded-md" src={category.image} alt="" />
                              </StyledTableCell>
                              <StyledTableCell>{category.name}</StyledTableCell>
                              <StyledTableCell>
                                <Chip size="small" label={category.categoryId} />
                              </StyledTableCell>
                              <StyledTableCell>
                                <Switch
                                  checked={category.isActive !== false}
                                  onChange={() => handleToggleStatus(category)}
                                  size="small"
                                />
                                <Chip
                                  size="small"
                                  color={category.isActive !== false ? "success" : "default"}
                                  label={category.isActive !== false ? "Active" : "Inactive"}
                                  sx={{ ml: 1 }}
                                />
                              </StyledTableCell>
                              <StyledTableCell align="right">
                              <IconButton
                                onClick={() => handleOpenEdit(category)}
                                size="small"
                                aria-label={`Edit ${category.name}`}
                              >
                                <EditIcon className="text-orange-400" />
                              </IconButton>
                              <IconButton
                                onClick={() => setDeleteTarget(category.id || null)}
                                size="small" color="error"
                                aria-label={`Delete ${category.name}`}
                              >
                                <DeleteIcon />
                              </IconButton>
                              </StyledTableCell>
                            </StyledTableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  )}
                </Droppable>
              </Table>
            </DragDropContext>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={ROWS_PER_PAGE}
            rowsPerPageOptions={[ROWS_PER_PAGE]}
          />
        </>
      )}

      <Modal open={openEdit} onClose={handleCloseEdit}>
        <Box sx={style}>
          <UpdateHomeCategoryForm category={selectedCategory} handleClose={handleCloseEdit} />
        </Box>
      </Modal>

      <Dialog open={openCreate} onClose={handleCloseCreate} maxWidth="sm" fullWidth>
        <DialogTitle>Create {section.replace(/_/g, " ")} Item</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <ImageUpload
              value={createForm.image}
              onChange={(url) => setCreateForm({ ...createForm, image: url })}
            />

            <Autocomplete
              fullWidth
              options={level1List}
              getOptionLabel={(o: Category) => `${o.name} (Parent)`}
              value={selLevel1 || null}
              onChange={(_, v) => setCreateForm({ ...createForm, category: v?.categoryId || "", category2: "", category3: "" })}
              renderInput={(params) => <TextField {...params} label="Level 1" />}
              isOptionEqualToValue={(o, v) => o.categoryId === v.categoryId}
              clearOnEscape blurOnSelect
            />

            <Autocomplete
              fullWidth
              options={level2List}
              getOptionLabel={(o: Category) => `  ${o.name} (Parent)`}
              value={selLevel2 || null}
              onChange={(_, v) => setCreateForm({ ...createForm, category2: v?.categoryId || "", category3: "" })}
              renderInput={(params) => <TextField {...params} label="Level 2" />}
              isOptionEqualToValue={(o, v) => o.categoryId === v.categoryId}
              clearOnEscape blurOnSelect
              disabled={!selLevel1}
            />

            <Autocomplete
              fullWidth
              options={level3List}
              getOptionLabel={(o: Category) => `    ${o.name}`}
              value={selLevel3 || null}
              onChange={(_, v) => setCreateForm({ ...createForm, category3: v?.categoryId || "" })}
              renderInput={(params) => <TextField {...params} label="Level 3 (Leaf)" />}
              isOptionEqualToValue={(o, v) => o.categoryId === v.categoryId}
              clearOnEscape blurOnSelect
              disabled={!selLevel2}
            />

            {selLevel3 && !isLeafValid && (
              <Typography variant="caption" color="error">Please select a valid leaf category.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={loading || !createForm.image.trim() || !isLeafValid}>
            {loading ? <CircularProgress size={20} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {(() => {
        const delCategory = deleteTarget
          ? categories.find((c: HomeCategory) => c.id === deleteTarget)
          : undefined;
        return (
          <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="sm" fullWidth>
            <DialogTitle>Delete Homepage Item</DialogTitle>
            <DialogContent>
              {delCategory && (
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      component="img"
                      src={delCategory.image}
                      alt=""
                      sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">{delCategory.name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Category ID: {delCategory.categoryId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Section: {delCategory.section?.replace(/_/g, " ")}
                      </Typography>
                      <Chip
                        size="small"
                        color={delCategory.isActive !== false ? "success" : "default"}
                        label={delCategory.isActive !== false ? "Active" : "Inactive"}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  {delCategory.createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(delCategory.createdAt).toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    This action cannot be undone.
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="contained" color="error" disabled={loading} onClick={() => {
                if (deleteTarget) dispatch(deleteHomeCategory(deleteTarget));
              }}>
                {loading ? <CircularProgress size={20} /> : "Delete"}
              </Button>
            </DialogActions>
          </Dialog>
        );
      })()}

      <Dialog open={bulkAction === "delete"} onClose={() => setBulkAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {selectedIds.size} item(s)?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAction(null)}>Cancel</Button>
          <Button variant="contained" color="error"
            onClick={() => executeBulkAction("delete")}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkAction === "move"} onClose={() => setBulkAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Move {selectedIds.size} item(s) to Section</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth label="Target Section" value={moveSection}
            onChange={(e) => setMoveSection(e.target.value)}
            sx={{ mt: 1 }}
          >
            {["GRID", "DEALS", "ELECTRIC_CATEGORIES", "SHOP_BY_CATEGORIES"]
              .filter((s) => s !== section)
              .map((s) => (
                <MenuItem key={s} value={s}>{s.replace(/_/g, " ")}</MenuItem>
              ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setBulkAction(null); setMoveSection(""); }}>Cancel</Button>
          <Button variant="contained" onClick={() => { if (moveSection) executeBulkAction("move"); }}
            disabled={!moveSection}>
            Move
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}

export default HomeCategoryTable;
