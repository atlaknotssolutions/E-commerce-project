import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

interface SettingsCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ icon, title, description, children }) => {
  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: 3,
        border: '1px solid',
        borderColor: '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.07)' },
      }}
    >
      <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3.5, pb: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {icon && (
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 2, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              bgcolor: '#EEF2FF', color: '#4F46E5',
              '& .MuiSvgIcon-root': { fontSize: 22 },
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 16, color: '#111827', letterSpacing: '-0.3px' }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" sx={{ mt: 0.4, color: '#6B7280', fontSize: 13.5, lineHeight: 1.5 }}>
              {description}
            </Typography>
          )}
        </Box>
      </Box>
      <Divider sx={{ borderColor: '#F3F4F6' }} />
      <Box sx={{ px: { xs: 3, sm: 4 }, py: 3.5 }}>
        {children}
      </Box>
    </Box>
  );
};

export default SettingsCard;
