import React, { useState, useEffect, useRef } from 'react';
import {
    Autocomplete, TextField, Box, Typography, Chip, CircularProgress, Checkbox
} from '@mui/material';
import { api } from '../../../../Config/Api';
import { Category } from '../../../../types/categoryTypes';

interface CategorySelectProps {
    value: string[];
    onChange: (categoryIds: string[]) => void;
    sellerId?: string | null;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
}

const flattenTree = (nodes: Category[], depth = 0): (Category & { depth: number })[] => {
    const result: (Category & { depth: number })[] = [];
    for (const node of nodes) {
        result.push({ ...node, depth });
        if (node.children && node.children.length > 0) {
            result.push(...flattenTree(node.children, depth + 1));
        }
    }
    return result;
};

const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange, sellerId, disabled, error, helperText }) => {
    const [flatOptions, setFlatOptions] = useState<(Category & { depth: number })[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<(Category & { depth: number })[]>([]);
    const initializedRef = useRef(false);

    useEffect(() => {
        const fetchTree = async () => {
            setLoading(true);
            try {
                const params: any = {};
                if (sellerId) params.sellerId = sellerId;
                const response = await api.get('/categories/tree', { params });
                const data: Category[] = response.data.data || [];
                setFlatOptions(flattenTree(data));
            } catch {
                setFlatOptions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTree();
    }, [sellerId]);

    useEffect(() => {
        if (!initializedRef.current && value.length > 0 && flatOptions.length > 0) {
            const matched = flatOptions.filter((cat) => value.includes(cat._id));
            setSelectedCategories(matched);
            initializedRef.current = true;
        }
    }, [value, flatOptions]);

    const filteredOptions = flatOptions.filter((opt) => {
        if (!inputValue.trim()) return true;
        const lower = inputValue.toLowerCase();
        return opt.name?.toLowerCase().includes(lower);
    });

    return (
        <Autocomplete
            fullWidth
            size="small"
            multiple
            disabled={disabled}
            value={selectedCategories}
            inputValue={inputValue}
            onInputChange={(_, newInput) => setInputValue(newInput)}
            onChange={(_, newValue) => {
                setSelectedCategories(newValue);
                onChange(newValue.map((cat) => cat._id));
            }}
            options={filteredOptions}
            loading={loading}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, val) => option._id === val._id}
            noOptionsText="No categories found"
            filterSelectedOptions
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => {
                const indent = option.depth * 20;
                return (
                    <Box
                        component="li"
                        {...props}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1 + indent }}
                    >
                        <Checkbox checked={selected} size="small" />
                        <Typography variant="body2" fontWeight={option.depth === 0 ? 700 : 400}>
                            {option.name}
                        </Typography>
                        <Chip
                            label={`L${option.level}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 16, fontSize: 9, ml: 'auto' }}
                        />
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Select Categories"
                    placeholder="Search categories..."
                    error={error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
};

export default React.memo(CategorySelect);
