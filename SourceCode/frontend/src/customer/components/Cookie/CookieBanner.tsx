import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CookieSettingsModal from './CookieSettingsModal';

const COOKIE_PREF_KEY = 'aiknots_cookie_consent';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const pref = localStorage.getItem(COOKIE_PREF_KEY);
    if (!pref) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: { necessary: boolean; analytics: boolean; marketing: boolean; preferences: boolean }) => {
    localStorage.setItem(COOKIE_PREF_KEY, JSON.stringify({ ...prefs, timestamp: Date.now() }));
    setVisible(false);
    setSettingsOpen(false);
  };

  const handleAcceptAll = () => {
    savePreferences({ necessary: true, analytics: true, marketing: true, preferences: true });
  };

  const handleRejectNonEssential = () => {
    savePreferences({ necessary: true, analytics: false, marketing: false, preferences: false });
  };

  if (!visible) return null;

  return (
    <>
      <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: '#fff',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.12)',
            borderTop: '1px solid #e9ecef',
          }}
        >
          <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                  We value your privacy
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d', lineHeight: 1.6 }}>
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{' '}
                  <a href="/privacy-policy" style={{ color: '#00927c', textDecoration: 'none' }}>Privacy Policy</a>
                  {' '}|{' '}
                  <a href="/cookie-policy" style={{ color: '#00927c', textDecoration: 'none' }}>Cookie Policy</a>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSettingsOpen(true)}
                  sx={{
                    borderColor: '#d1d5db',
                    color: '#6c757d',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px',
                    '&:hover': { borderColor: '#00927c', color: '#00927c' },
                  }}
                >
                  Customize
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRejectNonEssential}
                  sx={{
                    borderColor: '#d1d5db',
                    color: '#6c757d',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px',
                    '&:hover': { borderColor: '#00927c', color: '#00927c' },
                  }}
                >
                  Reject Non-Essential
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAcceptAll}
                  sx={{
                    backgroundColor: '#00927c',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px',
                    px: 3,
                    '&:hover': { backgroundColor: '#007a6a' },
                  }}
                >
                  Accept All
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Slide>

      <CookieSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={savePreferences}
        onRejectAll={handleRejectNonEssential}
        onAcceptAll={handleAcceptAll}
      />
    </>
  );
};

export default CookieBanner;
