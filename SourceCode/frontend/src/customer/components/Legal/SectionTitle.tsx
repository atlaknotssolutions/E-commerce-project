import React from 'react';
import { Typography, Box } from '@mui/material';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  sx?: object;
}

const SectionTitle = ({ title, subtitle, align = 'left', sx }: SectionTitleProps) => {
  return (
    <Box sx={{ mb: 4, textAlign: align, ...sx }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.4rem', md: '1.75rem' },
          color: '#1a1a2e',
          letterSpacing: '-0.01em',
          position: 'relative',
          display: 'inline-block',
          pb: 1.5,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: align === 'center' ? '50%' : 0,
            transform: align === 'center' ? 'translateX(-50%)' : 'none',
            width: 48,
            height: 3,
            borderRadius: 2,
            backgroundColor: '#00927c',
          },
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body1"
          sx={{
            color: '#6c757d',
            mt: 2,
            maxWidth: 700,
            lineHeight: 1.7,
            mx: align === 'center' ? 'auto' : undefined,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default SectionTitle;
