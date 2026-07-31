import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, TextField, Alert, Box, Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ResetSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const ResetSettingsDialog: React.FC<ResetSettingsDialogProps> = ({ open, onClose, onConfirm, loading }) => {
  const [confirmText, setConfirmText] = useState('');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}>
      <Box sx={{ px: 3, pt: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <WarningAmberIcon sx={{ color: '#EF4444', fontSize: 24 }} />
        <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: 17 }}>Reset All Settings</DialogTitle>
      </Box>
      <DialogContent sx={{ pt: 2 }}>
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5 }}>
          This action will reset all system settings to their default values. This cannot be undone.
        </Alert>
        <DialogContentText sx={{ mb: 1.5, color: '#6B7280', fontSize: 14 }}>
          Type <Typography component="span" fontWeight={700} sx={{ color: '#EF4444' }}>RESET</Typography> to confirm:
        </DialogContentText>
        <TextField
          fullWidth
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="RESET"
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}
          sx={{ textTransform: 'none', borderRadius: 1.5, color: '#6B7280' }}>
          Cancel
        </Button>
        <Button
          onClick={() => { onConfirm(); setConfirmText(''); }}
          color="error"
          variant="contained"
          disabled={confirmText !== 'RESET' || loading}
          sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
        >
          {loading ? 'Resetting...' : 'Reset Settings'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetSettingsDialog;
