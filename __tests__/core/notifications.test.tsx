import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { NotificationRegion } from '@/core/notifications/NotificationRegion';
import { NOTIFICATION_MAXIMUM_QUEUE_SIZE } from '@/core/notifications/constants/notification.constants';
import { useNotificationStore } from '@/core/notifications/notification.store';
import { notify } from '@/core/notifications/notify';

describe('notifications', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('exposes the four variants through the global API', () => {
    act(() => {
      notify.success('Guardado');
      notify.error('Falló');
      notify.warning('Atención');
      notify.info('Información');
    });

    expect(useNotificationStore.getState().queue).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Guardado', type: 'success' }),
        expect.objectContaining({ message: 'Falló', type: 'error' }),
        expect.objectContaining({ message: 'Atención', type: 'warning' }),
        expect.objectContaining({ message: 'Información', type: 'info' }),
      ]),
    );
  });

  it('shows one notification at a time and advances after manual dismissal', () => {
    render(<NotificationRegion />);

    act(() => {
      notify.success('Primera', { description: 'Descripción inicial' });
      notify.error('Segunda');
    });

    expect(screen.getByText('Primera')).toBeOnTheScreen();
    expect(screen.getByText('Descripción inicial')).toBeOnTheScreen();
    expect(screen.queryByText('Segunda')).not.toBeOnTheScreen();

    fireEvent.press(
      screen.getByRole('button', { name: 'Cerrar notificación' }),
    );

    expect(screen.queryByText('Primera')).not.toBeOnTheScreen();
    expect(screen.getByText('Segunda')).toBeOnTheScreen();
  });

  it('dismisses a notification after its configured duration', () => {
    jest.useFakeTimers();
    render(<NotificationRegion />);

    act(() => {
      notify.info('Temporal', { durationMs: 1_000 });
    });
    expect(screen.getByText('Temporal')).toBeOnTheScreen();

    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(screen.queryByText('Temporal')).not.toBeOnTheScreen();
  });

  it('keeps important notifications visible until explicitly dismissed', () => {
    jest.useFakeTimers();
    render(<NotificationRegion />);

    act(() => {
      notify.warning('Requiere atención', {
        durationMs: 1_000,
        persistent: true,
      });
      jest.advanceTimersByTime(10_000);
    });

    expect(screen.getByText('Requiere atención')).toBeOnTheScreen();
  });

  it('deduplicates equal messages and bounds the waiting queue', () => {
    const onDropped = jest.fn();

    act(() => {
      const firstId = notify.info('Repetida');
      const duplicateId = notify.info('Repetida');

      expect(duplicateId).toBe(firstId);
      notify.info('Descartable', { onDismiss: onDropped });
      for (let index = 0; index < NOTIFICATION_MAXIMUM_QUEUE_SIZE; index += 1) {
        notify.info(`Nueva ${index}`);
      }
    });

    const queue = useNotificationStore.getState().queue;
    expect(queue).toHaveLength(NOTIFICATION_MAXIMUM_QUEUE_SIZE);
    expect(queue[0]?.message).toBe('Repetida');
    expect(queue.at(-1)?.message).toBe(
      `Nueva ${NOTIFICATION_MAXIMUM_QUEUE_SIZE - 1}`,
    );
    expect(onDropped).toHaveBeenCalledTimes(1);
  });
});
