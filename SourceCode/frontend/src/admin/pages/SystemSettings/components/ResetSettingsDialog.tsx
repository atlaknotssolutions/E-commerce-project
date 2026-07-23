import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
    Alert,
} from '@mui/material';

interface ResetSettingsDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

const ResetSettingsDialog: React.FC<ResetSettingsDialogProps> = ({ open, onClose, onConfirm, loading }) => {
    const [confirmText, setConfirmText] = useState('');
    const isConfirmDisabled = confirmText !== 'RESET';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Reset All Settings</DialogTitle>
            <DialogContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    This action will reset all system settings to their default values. This cannot be undone.
                </Alert>
                <DialogContentText sx={{ mb: 2 }}>
                    Type <strong>RESET</strong> to confirm:
                </DialogContentText>
                <TextField
                    fullWidth
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="RESET"
                    size="small"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={isConfirmDisabled || loading}
                >
                    {loading ? 'Resetting...' : 'Reset Settings'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(ResetSettingsDialog);
