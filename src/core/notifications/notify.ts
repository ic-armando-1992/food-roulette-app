import { useNotificationStore } from '@/core/notifications/notification.store';
import {
  NotificationOptions,
  NotificationType,
} from '@/core/notifications/types/notification.types';

function enqueue(
  type: NotificationType,
  message: string,
  options?: NotificationOptions,
): string {
  return useNotificationStore.getState().enqueue(type, message, options);
}

export const notify = {
  clear: () => useNotificationStore.getState().clear(),
  dismiss: (id: string) => useNotificationStore.getState().dismiss(id),
  error: (message: string, options?: NotificationOptions) =>
    enqueue('error', message, options),
  info: (message: string, options?: NotificationOptions) =>
    enqueue('info', message, options),
  success: (message: string, options?: NotificationOptions) =>
    enqueue('success', message, options),
  warning: (message: string, options?: NotificationOptions) =>
    enqueue('warning', message, options),
} as const;
