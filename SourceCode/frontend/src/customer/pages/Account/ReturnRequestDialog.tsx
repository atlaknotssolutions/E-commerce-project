import React, { useState } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, FormControl, InputLabel, Select, MenuItem,
    TextField, CircularProgress, Typography
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { requestReturn } from '../../../Redux Toolkit/Customer/OrderSlice';
import { ReturnReason } from '../../../types/orderTypes';

interface ReturnRequestDialogProps {
    open: boolean;
    onClose: () => void;
    orderId: string;
    orderItemId: string;
    productId: string;
}

const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
    [ReturnReason.DEFECTIVE_PRODUCT]: "Defective Product",
    [ReturnReason.WRONG_ITEM_RECEIVED]: "Wrong Item Received",
    [ReturnReason.NOT_AS_DESCRIBED]: "Not As Described",
    [ReturnReason.CHANGE_OF_MIND]: "Change of Mind",
    [ReturnReason.DAMAGED_IN_TRANSIT]: "Damaged In Transit",
    [ReturnReason.SIZE_OR_FIT_ISSUE]: "Size / Fit Issue",
    [ReturnReason.MISSING_ACCESSORIES]: "Missing Accessories",
    [ReturnReason.QUALITY_ISSUE]: "Quality Issue",
    [ReturnReason.OTHER]: "Other",
};

const ReturnRequestDialog: React.FC<ReturnRequestDialogProps> = ({
    open, onClose, orderId, orderItemId, productId
}) => {
    const dispatch = useAppDispatch();
    const { auth, orders } = useAppSelector(store => store);

    const [reason, setReason] = useState<ReturnReason | ''>('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const jwt = auth.jwt || localStorage.getItem("jwt") || "";
    const alreadyRequested = orders.returns.some(r => r.orderItemId === orderItemId);

    const handleClose = () => {
        setReason('');
        setDescription('');
        setImages([]);
        onClose();
    };

    const handleSubmit = async () => {
        if (!reason || !jwt) return;

        await dispatch(requestReturn({
            jwt,
            orderId,
            orderItemId,
            productId,
            reason,
            description: description || undefined,
            images: images.length > 0 ? images : undefined,
        }));

        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Request Return</DialogTitle>
            <DialogContent className="space-y-4 pt-2">
                {alreadyRequested && (
                    <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
                        A return request has already been submitted for this item.
                    </Typography>
                )}

                <FormControl fullWidth size="small">
                    <InputLabel>Return Reason *</InputLabel>
                    <Select
                        value={reason}
                        label="Return Reason *"
                        onChange={(e) => setReason(e.target.value as ReturnReason)}
                        disabled={alreadyRequested}
                    >
                        {Object.values(ReturnReason).map((r) => (
                            <MenuItem key={r} value={r}>
                                {RETURN_REASON_LABELS[r]}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    label="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={alreadyRequested}
                />

                <div>
                    <Button
                        variant="outlined"
                        component="label"
                        size="small"
                        disabled={alreadyRequested}
                    >
                        Upload Images (optional)
                        <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                    const urls = Array.from(files).map(f => f.name);
                                    setImages(prev => [...prev, ...urls]);
                                }
                            }}
                        />
                    </Button>
                    {images.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {images.map((img, i) => (
                                <Typography key={i} variant="caption" className="bg-gray-100 px-2 py-1 rounded">
                                    {img}
                                </Typography>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!reason || orders.returnLoading || alreadyRequested}
                    startIcon={orders.returnLoading ? <CircularProgress size={16} /> : undefined}
                >
                    {orders.returnLoading ? "Submitting..." : "Submit Request"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReturnRequestDialog;
