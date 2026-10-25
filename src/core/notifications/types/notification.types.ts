export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type NotificationOptions = {
  description?: string;
  durationMs?: number;
  onDismiss?: () => void;
  persistent?: boolean;
};

export type AppNotification = NotificationOptions & {
  id: string;
  message: string;
  type: NotificationType;
};

export type NotificationStore = {
  queue: AppNotification[];
  clear: () => void;
  dismiss: (id: string) => void;
  enqueue: (
    type: NotificationType,
    message: string,
    options?: NotificationOptions,
  ) => string;
};

export type NotificationRegionProps = {
  enabled?: boolean;
};

export type NotificationIconProps = {
  type: NotificationType;
};

export type NotificationPresentation = {
  accentColor: string;
  borderColor: string;
  surfaceColor: string;
};
