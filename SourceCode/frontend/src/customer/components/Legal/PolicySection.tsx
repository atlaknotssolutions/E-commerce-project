import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface PolicySectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  id?: string;
}

const PolicySection = ({ title, children, defaultExpanded = false, id }: PolicySectionProps) => {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        border: '1px solid #e9ecef',
        borderRadius: '12px !important',
        mb: 2,
        overflow: 'hidden',
        '&::before': { display: 'none' },
        '&.Mui-expanded': {
          margin: 0,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#00927c' }} />}
        sx={{
          backgroundColor: '#f8f9fa',
          minHeight: 56,
          '&.Mui-expanded': {
            backgroundColor: '#f0faf7',
            minHeight: 56,
          },
          '& .MuiAccordionSummary-content': {
            my: 1.5,
            '&.Mui-expanded': { my: 1.5 },
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            color: '#1a1a2e',
          }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 3, py: 2.5 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default PolicySection;
