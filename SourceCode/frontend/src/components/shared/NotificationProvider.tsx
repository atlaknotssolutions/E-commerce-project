import { useEffect, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { notification, Notification } from '../../services/notificationService';

export default function NotificationProvider() {
  const [current, setCurrent] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = notification.subscribe((n) => {
      setCurrent(n);
      setOpen(true);
    });
    return unsubscribe;
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleExited = useCallback(() => {
    setCurrent(null);
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={current?.duration ?? 3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionProps={{ onExited: handleExited }}
    >
      <Alert
        onClose={handleClose}
        severity={(current?.severity as AlertColor) ?? 'info'}
        variant="filled"
        sx={{ minWidth: 280, boxShadow: 2 }}
      >
        {current?.message ?? ''}
      </Alert>
    </Snackbar>
  );
}
