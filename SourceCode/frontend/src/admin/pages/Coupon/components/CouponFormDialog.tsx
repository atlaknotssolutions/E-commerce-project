import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent,     DialogActions, Button, TextField, Box, IconButton,
    Typography, MenuItem, Grid, Switch, FormControlLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Coupon, CouponTargetType, CouponScope } from '../../../../types/couponTypes';
import SellerSearchSelect from './SellerSearchSelect';
import ProductSearchSelect from './ProductSearchSelect';
import CategorySelect from './CategorySelect';

interface CouponFormDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (coupon: any) => void;
    coupon?: Coupon | null;
    loading: boolean;
}

const CouponFormDialog: React.FC<CouponFormDialogProps> = ({ open, onClose, onConfirm, coupon, loading }) => {
    const isEdit = !!coupon;

    const [code, setCode] = useState(coupon?.code || '');
    const [name, setName] = useState(coupon?.name || '');
    const [description, setDescription] = useState(coupon?.description || '');
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT'>(coupon?.discountType || 'PERCENTAGE');
    const [discountPercentage, setDiscountPercentage] = useState(coupon?.discountPercentage || 0);
    const [discountValue, setDiscountValue] = useState(coupon?.discountValue || 0);
    const [maximumDiscount, setMaximumDiscount] = useState(coupon?.maximumDiscount || 0);
    const [minimumOrderValue, setMinimumOrderValue] = useState(coupon?.minimumOrderValue || 0);
    const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit || 0);
    const [ownerType, setOwnerType] = useState<'PLATFORM' | 'SELLER'>(coupon?.ownerType || 'PLATFORM');
    const [sellerId, setSellerId] = useState(coupon?.sellerId || '');
    const [scope, setScope] = useState<CouponScope>(coupon?.scope || 'ORDER');
    const [scopeIds, setScopeIds] = useState<string[]>(coupon?.scopeIds || []);
    const [targetType, setTargetType] = useState<CouponTargetType>(coupon?.targetType || 'ALL_CUSTOMERS');
    const [priority, setPriority] = useState(coupon?.priority || 0);
    const [stackable, setStackable] = useState(coupon?.stackable || false);
    const [validityStartDate, setValidityStartDate] = useState<Dayjs | null>(
        coupon?.validityStartDate ? dayjs(coupon.validityStartDate) : null
    );
    const [validityEndDate, setValidityEndDate] = useState<Dayjs | null>(
        coupon?.validityEndDate ? dayjs(coupon.validityEndDate) : null
    );
    const [isActive, setIsActive] = useState(coupon?.isActive !== undefined ? coupon.isActive : true);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open && coupon) {
            setCode(coupon.code || '');
            setName(coupon.name || '');
            setDescription(coupon.description || '');
            setDiscountType(coupon.discountType || 'PERCENTAGE');
            setDiscountPercentage(coupon.discountPercentage || 0);
            setDiscountValue(coupon.discountValue || 0);
            setMaximumDiscount(coupon.maximumDiscount || 0);
            setMinimumOrderValue(coupon.minimumOrderValue || 0);
            setUsageLimit(coupon.usageLimit || 0);
            setOwnerType(coupon.ownerType || 'PLATFORM');
            setSellerId(coupon.sellerId || '');
            setScope(coupon.scope || 'ORDER');
            setScopeIds(coupon.scopeIds || []);
            setTargetType(coupon.targetType || 'ALL_CUSTOMERS');
            setPriority(coupon.priority || 0);
            setStackable(coupon.stackable || false);
            setValidityStartDate(coupon.validityStartDate ? dayjs(coupon.validityStartDate) : null);
            setValidityEndDate(coupon.validityEndDate ? dayjs(coupon.validityEndDate) : null);
            setIsActive(coupon.isActive !== undefined ? coupon.isActive : true);
            setFormErrors({});
        } else if (open && !coupon) {
            setCode('');
            setName('');
            setDescription('');
            setDiscountType('PERCENTAGE');
            setDiscountPercentage(0);
            setDiscountValue(0);
            setMaximumDiscount(0);
            setMinimumOrderValue(0);
            setUsageLimit(0);
            setOwnerType('PLATFORM');
            setSellerId('');
            setScope('ORDER');
            setScopeIds([]);
            setTargetType('ALL_CUSTOMERS');
            setPriority(0);
            setStackable(false);
            setValidityStartDate(null);
            setValidityEndDate(null);
            setIsActive(true);
            setFormErrors({});
        }
    }, [open, coupon]);

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!code.trim() || code.trim().length < 3) errors.code = 'Code must be at least 3 characters';
        if (!validityStartDate) errors.validityStartDate = 'Start date is required';
        if (!validityEndDate) errors.validityEndDate = 'End date is required';
        if (validityStartDate && validityEndDate && validityEndDate.isBefore(validityStartDate)) {
            errors.validityEndDate = 'End date must be after start date';
        }
        if (discountType === 'PERCENTAGE' && (discountPercentage < 0 || discountPercentage > 100)) {
            errors.discountPercentage = 'Must be between 0 and 100';
        }
        if (discountType === 'FLAT' && discountValue <= 0) {
            errors.discountValue = 'Must be greater than 0';
        }
        if (ownerType === 'SELLER' && !sellerId) {
            errors.sellerId = 'Please select a seller';
        }
        if (scope === 'CATEGORY' && scopeIds.length === 0) {
            errors.scopeIds = 'Please select at least one category';
        }
        if (scope === 'PRODUCT' && scopeIds.length === 0) {
            errors.scopeIds = 'Please select at least one product';
        }
        if (priority < 0) {
            errors.priority = 'Priority cannot be negative';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleConfirm = () => {
        if (!validate()) return;

        const payload: any = {
            code,
            name,
            description,
            discountType,
            minimumOrderValue,
            maximumDiscount,
            usageLimit,
            ownerType,
            scope,
            targetType,
            priority,
            stackable,
            validityStartDate: validityStartDate?.toISOString(),
            validityEndDate: validityEndDate?.toISOString(),
            isActive,
        };

        if (ownerType === 'SELLER' && sellerId) {
            payload.sellerId = sellerId;
        }

        if (scope === 'CATEGORY' || scope === 'PRODUCT') {
            payload.scopeIds = scopeIds;
        }

        if (discountType === 'PERCENTAGE') {
            payload.discountPercentage = discountPercentage;
        } else {
            payload.discountValue = discountValue;
        }

        onConfirm(payload);
    };

    const handleScopeChange = (newScope: CouponScope) => {
        setScope(newScope);
        setScopeIds([]);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                    {isEdit ? 'Edit Coupon' : 'Create Coupon'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box className="space-y-4 mt-2">
                        <TextField
                            fullWidth
                            label="Coupon Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            size="small"
                            disabled={isEdit}
                            required
                            error={!!formErrors.code}
                            helperText={formErrors.code || '3-20 characters, auto-uppercased'}
                        />

                        <TextField
                            fullWidth
                            label="Display Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            size="small"
                            helperText="Human-readable name for the coupon"
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            size="small"
                            multiline
                            rows={2}
                        />

                        <TextField
                            fullWidth
                            select
                            label="Discount Type"
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FLAT')}
                            size="small"
                        >
                            <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                            <MenuItem value="FLAT">Flat Amount (₹)</MenuItem>
                        </TextField>

                        {discountType === 'PERCENTAGE' ? (
                            <TextField
                                fullWidth
                                label="Discount Percentage"
                                type="number"
                                value={discountPercentage}
                                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                                size="small"
                                error={!!formErrors.discountPercentage}
                                helperText={formErrors.discountPercentage}
                                inputProps={{ min: 0, max: 100 }}
                            />
                        ) : (
                            <TextField
                                fullWidth
                                label="Discount Value (₹)"
                                type="number"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(Number(e.target.value))}
                                size="small"
                                error={!!formErrors.discountValue}
                                helperText={formErrors.discountValue}
                                inputProps={{ min: 0 }}
                            />
                        )}

                        <TextField
                            fullWidth
                            label="Maximum Discount Cap (₹)"
                            type="number"
                            value={maximumDiscount}
                            onChange={(e) => setMaximumDiscount(Number(e.target.value))}
                            size="small"
                            inputProps={{ min: 0 }}
                            helperText="Set 0 for no cap"
                        />

                        <TextField
                            fullWidth
                            label="Minimum Order Value (₹)"
                            type="number"
                            value={minimumOrderValue}
                            onChange={(e) => setMinimumOrderValue(Number(e.target.value))}
                            size="small"
                            inputProps={{ min: 0 }}
                        />

                        <TextField
                            fullWidth
                            label="Usage Limit"
                            type="number"
                            value={usageLimit}
                            onChange={(e) => setUsageLimit(Number(e.target.value))}
                            size="small"
                            inputProps={{ min: 0 }}
                            helperText="Set 0 for unlimited"
                        />

                        {/* Priority */}
                        <TextField
                            fullWidth
                            label="Priority"
                            type="number"
                            value={priority}
                            onChange={(e) => setPriority(Number(e.target.value))}
                            size="small"
                            inputProps={{ min: 0 }}
                            helperText="Higher value = applied first (for stacking)"
                        />

                        {/* Stackable */}
                        <FormControlLabel
                            control={
                                <Switch checked={stackable} onChange={(e) => setStackable(e.target.checked)} />
                            }
                            label="Stackable (can combine with other coupons)"
                        />

                        {/* Target Type */}
                        <TextField
                            fullWidth
                            select
                            label="Target Customers"
                            value={targetType}
                            onChange={(e) => setTargetType(e.target.value as CouponTargetType)}
                            size="small"
                        >
                            <MenuItem value="ALL_CUSTOMERS">All Customers</MenuItem>
                            <MenuItem value="NEW_CUSTOMERS">New Customers (&lt;30 days)</MenuItem>
                            <MenuItem value="EXISTING_CUSTOMERS">Existing Customers (have orders)</MenuItem>
                            <MenuItem value="FIRST_TIME">First-Time Customers</MenuItem>
                            <MenuItem divider />
                            <MenuItem disabled sx={{ opacity: 0.7, fontSize: '0.75rem' }}>— CUSTOMER SEGMENTS —</MenuItem>
                            <MenuItem value="SEGMENT_NEW_CUSTOMER">Segment: New Customer</MenuItem>
                            <MenuItem value="SEGMENT_RETURNING_CUSTOMER">Segment: Returning Customer</MenuItem>
                            <MenuItem value="SEGMENT_REGULAR_CUSTOMER">Segment: Regular Customer</MenuItem>
                            <MenuItem value="SEGMENT_FREQUENT_BUYER">Segment: Frequent Buyer</MenuItem>
                            <MenuItem value="SEGMENT_HIGH_SPENDER">Segment: High Spender</MenuItem>
                            <MenuItem value="SEGMENT_VIP_CUSTOMER">Segment: VIP Customer</MenuItem>
                            <MenuItem value="SEGMENT_TOP_CUSTOMER">Segment: Top Customer</MenuItem>
                            <MenuItem value="SEGMENT_INACTIVE_CUSTOMER">Segment: Inactive Customer</MenuItem>
                            <MenuItem divider />
                            <MenuItem disabled sx={{ opacity: 0.7, fontSize: '0.75rem' }}>— SELLER SEGMENTS —</MenuItem>
                            <MenuItem value="SEGMENT_NEW_SELLER">Segment: New Seller</MenuItem>
                            <MenuItem value="SEGMENT_ACTIVE_SELLER">Segment: Active Seller</MenuItem>
                            <MenuItem value="SEGMENT_TOP_SELLER">Segment: Top Seller</MenuItem>
                            <MenuItem value="SEGMENT_HIGH_REVENUE_SELLER">Segment: High Revenue Seller</MenuItem>
                            <MenuItem value="SEGMENT_FAST_GROWING_SELLER">Segment: Fast Growing Seller</MenuItem>
                            <MenuItem value="SEGMENT_PREMIUM_SELLER">Segment: Premium Seller</MenuItem>
                            <MenuItem value="SEGMENT_TRUSTED_SELLER">Segment: Trusted Seller</MenuItem>
                        </TextField>

                        {/* Owner Type */}
                        <TextField
                            fullWidth
                            select
                            label="Owner"
                            value={ownerType}
                            onChange={(e) => {
                                setOwnerType(e.target.value as 'PLATFORM' | 'SELLER');
                                if (e.target.value === 'PLATFORM') setSellerId('');
                            }}
                            size="small"
                        >
                            <MenuItem value="PLATFORM">Platform Coupon</MenuItem>
                            <MenuItem value="SELLER">Seller Coupon</MenuItem>
                        </TextField>

                        {/* Seller Search Select — only when SELLER */}
                        {ownerType === 'SELLER' && (
                            <Box>
                                <Typography variant="body2" fontWeight={500} mb={0.5}>
                                    Select Seller
                                </Typography>
                                <SellerSearchSelect
                                    value={sellerId}
                                    onChange={(id) => setSellerId(id)}
                                    error={!!formErrors.sellerId}
                                    helperText={formErrors.sellerId}
                                />
                            </Box>
                        )}

                        {/* Scope */}
                        <TextField
                            fullWidth
                            select
                            label="Scope"
                            value={scope}
                            onChange={(e) => handleScopeChange(e.target.value as CouponScope)}
                            size="small"
                        >
                            <MenuItem value="ORDER">Entire Order</MenuItem>
                            <MenuItem value="ALL">All Products (Across Sellers)</MenuItem>
                            <MenuItem value="SELLER_STORE">Seller Store (All Seller Products)</MenuItem>
                            <MenuItem value="CATEGORY">Categories</MenuItem>
                            <MenuItem value="PRODUCT">Products</MenuItem>
                        </TextField>

                        {/* Category Select — only when CATEGORY scope */}
                        {scope === 'CATEGORY' && (
                            <Box>
                                <Typography variant="body2" fontWeight={500} mb={0.5}>
                                    Select Categories
                                </Typography>
                                <CategorySelect
                                    value={scopeIds}
                                    onChange={(ids) => setScopeIds(ids)}
                                    sellerId={ownerType === 'SELLER' ? sellerId : null}
                                    disabled={ownerType === 'SELLER' && !sellerId}
                                    error={!!formErrors.scopeIds}
                                    helperText={formErrors.scopeIds}
                                />
                            </Box>
                        )}

                        {/* Product Select — only when PRODUCT scope */}
                        {scope === 'PRODUCT' && (
                            <Box>
                                <Typography variant="body2" fontWeight={500} mb={0.5}>
                                    Select Products
                                </Typography>
                                <ProductSearchSelect
                                    value={scopeIds}
                                    onChange={(ids) => setScopeIds(ids)}
                                    sellerId={ownerType === 'SELLER' ? sellerId : null}
                                    disabled={ownerType === 'SELLER' && !sellerId}
                                    error={!!formErrors.scopeIds}
                                    helperText={formErrors.scopeIds}
                                />
                            </Box>
                        )}

                        {/* Coupon Preview Panel */}
                        {(code || discountType || ownerType || scope) && (
                            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Coupon Preview
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" fontWeight={600} color="primary.main">
                                            {name || code || '[CODE]'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {discountType === 'PERCENTAGE'
                                                ? `${discountPercentage}% off`
                                                : `₹${discountValue} off`}
                                        </Typography>
                                        {maximumDiscount > 0 && (
                                            <Typography variant="body2" color="text.secondary">
                                                (up to ₹{maximumDiscount})
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {ownerType === 'SELLER' ? 'Seller Coupon' : 'Platform Coupon'} &middot;{' '}
                                        {scope === 'ORDER'
                                            ? 'Entire Order'
                                            : scope === 'ALL'
                                                ? 'All Products'
                                                : scope === 'SELLER_STORE'
                                                    ? 'Seller Store'
                                                    : scope === 'CATEGORY'
                                                        ? `${scopeIds.length} Category(ies)`
                                                        : `${scopeIds.length} Product(s)`}
                                        {minimumOrderValue > 0 && ` · Min. Order: ₹${minimumOrderValue}`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Targets: {targetType.replace(/_/g, ' ').toLowerCase()} &middot;
                                        Priority: {priority} &middot;
                                        {stackable ? 'Stackable' : 'Not stackable'}
                                    </Typography>
                                    {validityStartDate && validityEndDate && (
                                        <Typography variant="caption" color="text.secondary">
                                            Valid: {validityStartDate.format('DD MMM YYYY')} - {validityEndDate.format('DD MMM YYYY')}
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                        <Typography variant="caption" color={isActive ? 'success.main' : 'text.disabled'}>
                                            {isActive ? 'Active' : 'Inactive'}
                                        </Typography>
                                        {usageLimit > 0 && (
                                            <Typography variant="caption" color="text.secondary">
                                                Usage limit: {usageLimit}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {/* Validation Report */}
                        <Box sx={{ bgcolor: 'error.50', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'error.light' }}>
                            <Typography variant="caption" fontWeight={600} color="error.main" gutterBottom display="block">
                                Validation Report ({Object.keys(formErrors).length} issue{Object.keys(formErrors).length !== 1 ? 's' : ''})
                            </Typography>
                            {Object.keys(formErrors).length > 0 ? (
                                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                    {Object.entries(formErrors).map(([field, msg]) => (
                                        <Typography key={field} variant="caption" color="error.main" component="li">
                                            {msg}
                                        </Typography>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="caption" color="success.main">
                                    All validations passed
                                </Typography>
                            )}
                        </Box>

                        {/* Date Pickers */}
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <DatePicker
                                    sx={{ width: '100%' }}
                                    label="Start Date"
                                    value={validityStartDate}
                                    onChange={(date) => setValidityStartDate(date)}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            error: !!formErrors.validityStartDate,
                                            helperText: formErrors.validityStartDate,
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    sx={{ width: '100%' }}
                                    label="End Date"
                                    value={validityEndDate}
                                    onChange={(date) => setValidityEndDate(date)}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            error: !!formErrors.validityEndDate,
                                            helperText: formErrors.validityEndDate,
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <FormControlLabel
                            control={
                                <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                            }
                            label="Active"
                        />
                    </Box>
                </LocalizationProvider>
            </DialogContent>

            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="primary" disabled={loading}>
                    {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(CouponFormDialog);
