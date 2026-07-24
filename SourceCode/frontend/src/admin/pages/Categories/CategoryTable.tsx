import React from "react";
import {
    Paper,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Category } from "../../../types/categoryTypes";
import { StyledTableCell, StyledTableRow } from '../../../components/shared/Table';

interface CategoryTableProps {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

const CategoryTable = ({
    categories,
    onEdit,
    onDelete,
}: CategoryTableProps) => {
    return (
        <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 290px)" }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Name</StyledTableCell>
                        <StyledTableCell>Category ID</StyledTableCell>
                        <StyledTableCell>Level</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                        <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {categories.map((category) => (
                        <StyledTableRow key={category._id} hover>
                            <StyledTableCell>{category.name}</StyledTableCell>
                            <StyledTableCell>{category.categoryId}</StyledTableCell>
                            <StyledTableCell>
                                <Chip size="small" label={`Level ${category.level}`} />
                            </StyledTableCell>
                            <StyledTableCell>
                                <Chip
                                    color={category.isActive ? "success" : "default"}
                                    size="small"
                                    label={category.isActive ? "Active" : "Inactive"}
                                />
                            </StyledTableCell>
                            <StyledTableCell align="center">
                                <IconButton onClick={() => onEdit(category)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton color="error" onClick={() => onDelete(category)}>
                                    <DeleteIcon />
                                </IconButton>
                            </StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CategoryTable;
