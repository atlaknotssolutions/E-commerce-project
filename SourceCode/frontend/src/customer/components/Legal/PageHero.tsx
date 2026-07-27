import React, { useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; path?: string }[];
}

const PageHero = ({ title, subtitle, breadcrumbs }: PageHeroProps) => {
  useEffect(() => {
    document.title = `${title} | AI Knots Marketplace`;
    return () => { document.title = 'AI Knots Marketplace'; };
  }, [title]);

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #00927c 0%, #007a6a 50%, #005f52 100%)',
        py: { xs: 5, md: 7 },
        mt: '-1px',
      }}
    >
      <Container maxWidth="lg">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {breadcrumbs.map((crumb, i) => (
              <Typography
                key={i}
                variant="body2"
                component={crumb.path ? 'a' : 'span'}
                href={crumb.path}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  '&:hover': crumb.path ? { color: '#fff' } : {},
                }}
              >
                {crumb.label}
                {i < breadcrumbs.length - 1 && (
                  <Box component="span" sx={{ mx: 0.5, color: 'rgba(255,255,255,0.4)' }}>/</Box>
                )}
              </Typography>
            ))}
          </Box>
        )}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: '#fff',
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              mt: 1.5,
              maxWidth: 600,
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              lineHeight: 1.7,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default PageHero;
