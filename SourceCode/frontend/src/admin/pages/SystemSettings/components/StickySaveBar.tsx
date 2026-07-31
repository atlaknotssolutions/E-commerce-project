import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface StickySaveBarProps {
  hasChanges: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

const StickySaveBar: React.FC<StickySaveBarProps> = ({ hasChanges, saving, onSave, onDiscard }) => {
  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 1100,
        bgcolor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid',
        borderColor: '#E5E7EB',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        px: { xs: 3, sm: 4 },
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        borderRadius: '0 0 12px 12px',
        mt: -0.5,
        mx: { xs: -3, sm: -4 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {hasChanges ? (
          <>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B', flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, fontSize: 13 }}>
              Unsaved changes
            </Typography>
          </>
        ) : (
          <>
            <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />
            <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 500, fontSize: 13 }}>
              All changes saved
            </Typography>
          </>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {hasChanges && (
          <Button
            variant="outlined"
            size="small"
            onClick={onDiscard}
            disabled={saving}
            sx={{
              textTransform: 'none', borderRadius: 2, fontWeight: 500,
              color: '#6B7280', borderColor: '#D1D5DB',
              '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' },
            }}
          >
            Discard
          </Button>
        )}
        <Button
          variant="contained"
          size="small"
          onClick={onSave}
          disabled={!hasChanges || saving}
          sx={{
            textTransform: 'none', borderRadius: 2, fontWeight: 600,
            bgcolor: '#4F46E5', boxShadow: '0 1px 3px rgba(79,70,229,0.3)',
            '&:hover': { bgcolor: '#4338CA', boxShadow: '0 2px 8px rgba(79,70,229,0.4)' },
            '&.Mui-disabled': { bgcolor: '#4F46E5', color: '#FFFFFF', opacity: 0.45, boxShadow: 'none' },
            minWidth: 120,
          }}
        >
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default StickySaveBar;
