import { useNotificationStore } from '../store/notificationStore';

export function useNotification() {
  const notify = useNotificationStore((s) => s.notify);

  return {
    notifySuccess: (message: string) => notify(message, 'success'),
    notifyError: (message: string) => notify(message, 'error'),
    notifyInfo: (message: string) => notify(message, 'info'),
  };
}
