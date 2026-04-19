import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '../store/notificationStore';

export function GlobalSnackbar() {
  const { notification, clear } = useNotificationStore();

  return (
    <Snackbar
      key={notification?.key}
      open={!!notification}
      autoHideDuration={4000}
      onClose={clear}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {notification ? (
        <Alert
          onClose={clear}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
}
