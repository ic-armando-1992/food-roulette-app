import {
  NotificationPresentation,
  NotificationType,
} from '@/core/notifications/types/notification.types';
import colors from '@/theme/colors.json';

export const NOTIFICATION_DEFAULT_DURATIONS_MS: Record<
  NotificationType,
  number
> = {
  success: 3_000,
  error: 6_000,
  warning: 5_000,
  info: 4_000,
};

export const NOTIFICATION_MAXIMUM_QUEUE_SIZE = 5;
export const NOTIFICATION_ANIMATION_DURATION_MS = 240;

export const NOTIFICATION_PRESENTATIONS: Record<
  NotificationType,
  NotificationPresentation
> = {
  success: {
    accentColor: colors.success,
    borderColor: colors.successBorder,
    surfaceColor: colors.successSurfaceTranslucent,
  },
  error: {
    accentColor: colors.error,
    borderColor: colors.errorBorder,
    surfaceColor: colors.errorSurface,
  },
  warning: {
    accentColor: colors.warning,
    borderColor: colors.warningBorder,
    surfaceColor: colors.warningSurface,
  },
  info: {
    accentColor: colors.info,
    borderColor: colors.infoBorder,
    surfaceColor: colors.infoSurface,
  },
};

export const NOTIFICATION_LABELS = {
  close: 'Cerrar notificación',
} as const;
