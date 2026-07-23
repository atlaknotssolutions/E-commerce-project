import React from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Category } from "../../../types/categoryTypes";

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
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Category ID</TableCell>
                        <TableCell>Level</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category._id} hover>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>{category.categoryId}</TableCell>
                            <TableCell>
                                <Chip size="small" label={`Level ${category.level}`} />
                            </TableCell>
                            <TableCell>
                                <Chip
                                    color={category.isActive ? "success" : "default"}
                                    size="small"
                                    label={category.isActive ? "Active" : "Inactive"}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <IconButton onClick={() => onEdit(category)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton color="error" onClick={() => onDelete(category)}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CategoryTable;
