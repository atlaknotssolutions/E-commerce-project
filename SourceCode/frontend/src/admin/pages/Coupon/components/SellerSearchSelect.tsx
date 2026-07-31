import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete, TextField, Avatar, Box, Typography, Chip, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { api } from '../../../../Config/Api';

interface SellerOption {
    _id: string;
    sellerName: string;
    email: string;
    avatar?: string | null;
    businessDetails?: { businessName?: string };
    accountStatus?: string;
    isEmailVerified?: boolean;
    productCount?: number;
    activeCouponCount?: number;
}

interface SellerSearchSelectProps {
    value: string;
    onChange: (sellerId: string) => void;
    error?: boolean;
    helperText?: string;
}

const SellerSearchSelect: React.FC<SellerSearchSelectProps> = ({ value, onChange, error, helperText }) => {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<SellerOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState<SellerOption | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    const selectedSellerRef = useRef(selectedSeller);
    selectedSellerRef.current = selectedSeller;

    const fetchSellers = async (search: string) => {
        setLoading(true);
        try {
            const params: any = { search, page: 1, limit: 20 };
            const response = await api.get('/sellers', { params });
            const data = response.data.data || [];
            setOptions(data);
        } catch {
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSellerById = async (id: string) => {
        try {
            const response = await api.get(`/sellers/${id}`);
            const body = response.data;
            const seller = body?.data;
            if (seller) {
                setSelectedSeller({
                    _id: seller.id || seller._id,
                    sellerName: seller.sellerName,
                    email: seller.email,
                    avatar: seller.avatar,
                    businessDetails: seller.businessDetails,
                    accountStatus: seller.accountStatus,
                    isEmailVerified: seller.isEmailVerified,
                    productCount: seller.productCount,
                    activeCouponCount: seller.activeCouponCount,
                });
            }
        } catch {
            // silently fail
        }
    };

    useEffect(() => {
        if (value && !selectedSellerRef.current) {
            fetchSellerById(value);
        }
    }, [value]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchSellers(inputValue);
        }, 400);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [inputValue]);

    return (
        <Autocomplete
            fullWidth
            size="small"
            value={selectedSeller}
            inputValue={inputValue}
            onInputChange={(_, newInput) => setInputValue(newInput)}
            onChange={(_, newValue) => {
                setSelectedSeller(newValue);
                onChange(newValue?._id || '');
            }}
            options={options}
            loading={loading}
            getOptionLabel={(option) => `${option.sellerName} (${option.email})`}
            isOptionEqualToValue={(option, val) => option._id === val._id}
            noOptionsText="No sellers found"
            renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                    <Avatar src={option.avatar || undefined} sx={{ width: 36, height: 36, fontSize: 14 }}>
                        {option.sellerName?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                                {option.sellerName}
                            </Typography>
                            {option.isEmailVerified && (
                                <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                            )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {option.email}
                        </Typography>
                        {option.businessDetails?.businessName && (
                            <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                {option.businessDetails.businessName}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.25 }}>
                            {option.productCount !== undefined && (
                                <Typography variant="caption" color="info.main">
                                    {option.productCount} products
                                </Typography>
                            )}
                            {option.activeCouponCount !== undefined && (
                                <Typography variant="caption" color="success.main">
                                    {option.activeCouponCount} active coupons
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Chip
                        label={option.accountStatus || 'ACTIVE'}
                        size="small"
                        color={option.accountStatus === 'ACTIVE' ? 'success' : 'warning'}
                        variant="outlined"
                        sx={{ height: 20, fontSize: 10 }}
                    />
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search Seller"
                    placeholder="Search by name, email, or business name..."
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

export default React.memo(SellerSearchSelect);
