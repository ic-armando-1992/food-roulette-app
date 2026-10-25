import { act } from '@testing-library/react-native';
import { useNotificationStore } from '@/core/notifications/notification.store';

jest.mock('expo-image');

afterEach(() => {
  act(() => useNotificationStore.setState({ queue: [] }));
});
