import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import PageHero from './PageHero';

interface TOCItem {
  id: string;
  title: string;
}

interface PolicyLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  toc: TOCItem[];
  children: React.ReactNode;
}

const PolicyLayout = ({ title, subtitle, lastUpdated, toc, children }: PolicyLayoutProps) => {
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box sx={{ minHeight: '60vh' }}>
      <PageHero
        title={title}
        subtitle={subtitle}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: title },
        ]}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          {isLarge && (
            <Box
              sx={{
                position: 'sticky',
                top: 90,
                minWidth: 220,
                flexShrink: 0,
                display: { xs: 'none', lg: 'block' },
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  color: '#00927c',
                  letterSpacing: '0.1em',
                  mb: 2,
                  display: 'block',
                }}
              >
                Table of Contents
              </Typography>
              {toc.map((item) => (
                <Box
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    py: 0.8,
                    px: 1.5,
                    mb: 0.5,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: activeId === item.id ? '#00927c' : '#6c757d',
                    fontWeight: activeId === item.id ? 600 : 400,
                    backgroundColor: activeId === item.id ? 'rgba(0,146,124,0.06)' : 'transparent',
                    borderLeft: activeId === item.id ? '3px solid #00927c' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#00927c',
                      backgroundColor: 'rgba(0,146,124,0.04)',
                    },
                  }}
                >
                  {item.title}
                </Box>
              ))}
              {lastUpdated && (
                <Typography variant="caption" sx={{ color: '#9ca3af', mt: 3, display: 'block' }}>
                  Last Updated: {lastUpdated}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {lastUpdated && !isLarge && (
              <Typography variant="caption" sx={{ color: '#9ca3af', mb: 3, display: 'block' }}>
                Last Updated: {lastUpdated}
              </Typography>
            )}
            {children}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PolicyLayout;
