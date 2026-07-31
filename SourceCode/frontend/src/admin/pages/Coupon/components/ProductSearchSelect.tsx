import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Autocomplete, TextField, Avatar, Box, Typography, Chip, CircularProgress
} from '@mui/material';
import { api } from '../../../../Config/Api';

interface ProductOption {
    _id: string;
    title: string;
    images?: { url: string; isPrimary?: boolean }[];
    brand?: string;
    sellingPrice: number;
    quantity: number;
    seller?: { _id: string; sellerName: string };
    variants?: { sku: string }[];
    category?: { _id?: string; id?: string; name: string };
    discountPercent?: number;
    approvalStatus?: string;
    publishStatus?: string;
}

interface ProductSearchSelectProps {
    value: string[];
    onChange: (productIds: string[]) => void;
    sellerId?: string | null;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
}

const ProductSearchSelect: React.FC<ProductSearchSelectProps> = ({ value, onChange, sellerId, disabled, error, helperText }) => {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<ProductOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    const initializedRef = useRef(false);

    const fetchProducts = useCallback(async (search: string) => {
        setLoading(true);
        try {
            const params: any = {
                pageNumber: 0,
                sizeLimit: 20,
                sort: 'newest',
            };
            if (search.trim()) params.brand = search.trim();
            if (sellerId) params.sellerId = sellerId;

            const response = await api.get('/products', { params });
            const content: ProductOption[] = response.data.content || [];

            if (search.trim()) {
                const lower = search.toLowerCase();
                const filtered = content.filter(
                    (p) =>
                        p.title?.toLowerCase().includes(lower) ||
                        p.brand?.toLowerCase().includes(lower) ||
                        p.variants?.some((v) => v.sku?.toLowerCase().includes(lower))
                );
                setOptions(filtered.length > 0 ? filtered : content.slice(0, 10));
            } else {
                setOptions(content.slice(0, 20));
            }
        } catch {
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    const isDisabled = disabled || (sellerId === null || sellerId === undefined || sellerId === '');

    useEffect(() => {
        if (!initializedRef.current && value.length > 0) {
            const fetchSelected = async () => {
                try {
                    const results = await Promise.all(
                        value.map((id) => api.get(`/products/${id}`).then((r) => r.data))
                    );
                    setSelectedProducts(results.filter(Boolean));
                    initializedRef.current = true;
                } catch {
                    // silently fail
                }
            };
            fetchSelected();
        }
    }, [value]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchProducts(inputValue);
        }, 400);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [inputValue, sellerId, fetchProducts]);

    return (
        <Autocomplete
            fullWidth
            size="small"
            multiple
            disabled={isDisabled}
            value={selectedProducts}
            inputValue={inputValue}
            onInputChange={(_, newInput) => setInputValue(newInput)}
            onChange={(_, newValue) => {
                setSelectedProducts(newValue);
                onChange(newValue.map((p) => p._id));
            }}
            options={options}
            loading={loading}
            getOptionLabel={(option) => `${option.title}${option.brand ? ` - ${option.brand}` : ''}`}
            isOptionEqualToValue={(option, val) => option._id === val._id}
            noOptionsText={isDisabled ? 'Select a seller first' : 'No products found'}
            filterSelectedOptions
            renderOption={(props, option) => {
                const primaryImage = option.images?.find((img) => img.isPrimary) || option.images?.[0];
                const sku = option.variants?.[0]?.sku || '';
                return (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                        <Avatar
                            src={primaryImage?.url || undefined}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                        >
                            {option.title?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                                {option.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                {sku && (
                                    <Typography variant="caption" color="text.secondary">
                                        SKU: {sku}
                                    </Typography>
                                )}
                                {option.brand && (
                                    <Typography variant="caption" color="text.secondary">
                                        {option.brand}
                                    </Typography>
                                )}
                                {option.category?.name && (
                                    <Typography variant="caption" color="primary.main">
                                        {option.category.name}
                                    </Typography>
                                )}
                                {option.discountPercent != null && option.discountPercent > 0 && (
                                    <Typography variant="caption" color="error.main">
                                        {option.discountPercent}% off
                                    </Typography>
                                )}
                            </Box>
                            {option.seller && (
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    Seller: {option.seller.sellerName}
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight={600}>
                                ₹{option.sellingPrice}
                            </Typography>
                            <Chip
                                label={option.quantity > 0 ? `${option.quantity} in stock` : 'Out of stock'}
                                size="small"
                                color={option.quantity > 0 ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ height: 18, fontSize: 9 }}
                            />
                            {option.approvalStatus && option.approvalStatus !== 'APPROVED' && (
                                <Chip
                                    label={option.approvalStatus}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    sx={{ height: 16, fontSize: 8, mt: 0.25 }}
                                />
                            )}
                        </Box>
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search Products"
                    placeholder="Search by name, SKU, or brand..."
                    error={error}
                    helperText={isDisabled ? 'Please select a seller first' : helperText}
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

export default React.memo(ProductSearchSelect);
