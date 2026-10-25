import { create } from 'zustand';

import { NOTIFICATION_MAXIMUM_QUEUE_SIZE } from '@/core/notifications/constants/notification.constants';
import {
  AppNotification,
  NotificationStore,
} from '@/core/notifications/types/notification.types';

let nextNotificationId = 0;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  queue: [],
  clear: () => {
    const notifications = get().queue;
    set({ queue: [] });
    notifications.forEach((notification) => notification.onDismiss?.());
  },
  dismiss: (id) => {
    const notification = get().queue.find((item) => item.id === id);
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    }));
    notification?.onDismiss?.();
  },
  enqueue: (type, message, options = {}) => {
    const duplicate = get().queue.find(
      (item) =>
        item.type === type &&
        item.message === message &&
        item.description === options.description,
    );

    if (duplicate) {
      return duplicate.id;
    }

    nextNotificationId += 1;
    const notification: AppNotification = {
      ...options,
      id: `notification-${nextNotificationId}`,
      message,
      type,
    };

    const nextQueue = [...get().queue, notification];

    if (nextQueue.length <= NOTIFICATION_MAXIMUM_QUEUE_SIZE) {
      set({ queue: nextQueue });
    } else {
      const droppedNotification = nextQueue[1];
      set({
        queue: [
          nextQueue[0],
          ...nextQueue.slice(-(NOTIFICATION_MAXIMUM_QUEUE_SIZE - 1)),
        ],
      });
      droppedNotification.onDismiss?.();
    }

    return notification.id;
  },
}));
