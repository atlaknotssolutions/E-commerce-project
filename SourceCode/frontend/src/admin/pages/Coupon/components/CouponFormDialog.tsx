import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    IconButton,
    Typography,
    MenuItem,
    Grid,
    Switch,
    FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Coupon } from '../../../../types/couponTypes';

interface CouponFormDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (coupon: any) => void;
    coupon?: Coupon | null;
    loading: boolean;
}

const CouponFormDialog: React.FC<CouponFormDialogProps> = ({
    open,
    onClose,
    onConfirm,
    coupon,
    loading,
}) =>
{
    const isEdit = !!coupon;

    const [code, setCode] = useState(coupon?.code || '');
    const [description, setDescription] = useState(coupon?.description || '');
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT'>(coupon?.discountType || 'PERCENTAGE');
    const [discountPercentage, setDiscountPercentage] = useState(coupon?.discountPercentage || 0);
    const [discountValue, setDiscountValue] = useState(coupon?.discountValue || 0);
    const [maximumDiscount, setMaximumDiscount] = useState(coupon?.maximumDiscount || 0);
    const [minimumOrderValue, setMinimumOrderValue] = useState(coupon?.minimumOrderValue || 0);
    const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit || 0);
    const [validityStartDate, setValidityStartDate] = useState<Dayjs | null>(
        coupon?.validityStartDate ? dayjs(coupon.validityStartDate) : null
    );
    const [validityEndDate, setValidityEndDate] = useState<Dayjs | null>(
        coupon?.validityEndDate ? dayjs(coupon.validityEndDate) : null
    );
    const [isActive, setIsActive] = useState(coupon?.isActive !== undefined ? coupon.isActive : true);

    const handleConfirm = () =>
    {
        const payload: any = {
            code,
            description,
            discountType,
            minimumOrderValue,
            maximumDiscount,
            usageLimit,
            validityStartDate: validityStartDate?.toISOString(),
            validityEndDate: validityEndDate?.toISOString(),
            isActive,
        };

        if (discountType === 'PERCENTAGE')
        {
            payload.discountPercentage = discountPercentage;
        }
        else
        {
            payload.discountValue = discountValue;
        }

        onConfirm(payload);
    };

    const isValid = code.trim().length >= 3
        && validityStartDate !== null
        && validityEndDate !== null
        && (discountType === 'FLAT' || (discountPercentage >= 0 && discountPercentage <= 100))
        && (discountType === 'PERCENTAGE' || discountValue > 0);

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
                            helperText="3-20 characters, auto-uppercased"
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

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <DatePicker
                                    sx={{ width: '100%' }}
                                    label="Start Date"
                                    value={validityStartDate}
                                    onChange={(date) => setValidityStartDate(date)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    sx={{ width: '100%' }}
                                    label="End Date"
                                    value={validityEndDate}
                                    onChange={(date) => setValidityEndDate(date)}
                                />
                            </Grid>
                        </Grid>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                            }
                            label="Active"
                        />
                    </Box>
                </LocalizationProvider>
            </DialogContent>

            <DialogActions className="px-4 py-3">
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="primary"
                    disabled={loading || !isValid}
                >
                    {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(CouponFormDialog);
