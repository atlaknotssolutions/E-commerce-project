import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CookieSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (prefs: { necessary: boolean; analytics: boolean; marketing: boolean; preferences: boolean }) => void;
  onRejectAll: () => void;
  onAcceptAll: () => void;
}

const COOKIE_PREF_KEY = 'aiknots_cookie_consent';

const CookieSettingsModal = ({ open, onClose, onSave, onRejectAll, onAcceptAll }: CookieSettingsModalProps) => {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [preferences, setPreferences] = useState(false);

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem(COOKIE_PREF_KEY);
      if (saved) {
        try {
          const prefs = JSON.parse(saved);
          setAnalytics(!!prefs.analytics);
          setMarketing(!!prefs.marketing);
          setPreferences(!!prefs.preferences);
        } catch { /* keep defaults */ }
      }
    }
  }, [open]);

  const handleSave = () => {
    onSave({ necessary: true, analytics, marketing, preferences });
  };

  const cookieCategories = [
    {
      title: 'Strictly Necessary',
      description: 'Essential cookies that enable core functionality such as security, authentication, and shopping cart features. These cookies cannot be disabled.',
      required: true,
      enabled: true,
    },
    {
      title: 'Analytics & Performance',
      description: 'Help us understand how visitors interact with our marketplace by collecting anonymous usage data. This helps us improve site performance and user experience.',
      required: false,
      enabled: analytics,
      onChange: () => setAnalytics(!analytics),
    },
    {
      title: 'Marketing & Advertising',
      description: 'Used to deliver relevant advertisements and track campaign effectiveness. These cookies may be set by our advertising partners to build a profile of your interests.',
      required: false,
      enabled: marketing,
      onChange: () => setMarketing(!marketing),
    },
    {
      title: 'Preferences & Functionality',
      description: 'Remember your settings and choices such as language, region, and display preferences to provide a more personalized experience.',
      required: false,
      enabled: preferences,
      onChange: () => setPreferences(!preferences),
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          Cookie Settings
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" sx={{ color: '#6c757d', mb: 3, lineHeight: 1.6 }}>
          Manage your cookie preferences below. You can choose which categories of cookies to allow. Necessary cookies are always enabled as they are essential for the marketplace to function correctly.
        </Typography>

        {cookieCategories.map((cat, index) => (
          <Box key={cat.title}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 2 }}>
              <Box sx={{ flex: 1, pr: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5 }}>
                  {cat.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  {cat.description}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={cat.enabled}
                    onChange={cat.onChange}
                    disabled={cat.required}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#00927c' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00927c' },
                    }}
                  />
                }
                label=""
                sx={{ m: 0, mt: -0.5 }}
              />
            </Box>
            {index < cookieCategories.length - 1 && <Divider />}
          </Box>
        ))}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onRejectAll}
          sx={{
            textTransform: 'none',
            color: '#6c757d',
            fontWeight: 600,
            borderRadius: '8px',
          }}
        >
          Reject All
        </Button>
        <Button
          onClick={handleSave}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderColor: '#00927c',
            color: '#00927c',
            fontWeight: 600,
            borderRadius: '8px',
            '&:hover': { borderColor: '#007a6a', backgroundColor: 'rgba(0,146,124,0.04)' },
          }}
        >
          Save Settings
        </Button>
        <Button
          onClick={onAcceptAll}
          variant="contained"
          sx={{
            textTransform: 'none',
            backgroundColor: '#00927c',
            fontWeight: 600,
            borderRadius: '8px',
            px: 3,
            '&:hover': { backgroundColor: '#007a6a' },
          }}
        >
          Accept All
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CookieSettingsModal;
