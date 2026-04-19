import { create } from 'zustand';

type Severity = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  message: string;
  severity: Severity;
  key: number;
}

interface NotificationState {
  notification: Notification | null;
  notify: (message: string, severity?: Severity) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notification: null,
  notify: (message, severity = 'success') =>
    set({ notification: { message, severity, key: Date.now() } }),
  clear: () => set({ notification: null }),
}));
