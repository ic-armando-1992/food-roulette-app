import { act } from '@testing-library/react-native';
import { useNotificationStore } from '@/core/notifications/notification.store';

jest.mock('expo-image');
jest.mock('expo-sqlite/kv-store', () => {
  const values = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => values.get(key) ?? null),
      removeItem: jest.fn(async (key: string) => {
        values.delete(key);
      }),
      setItem: jest.fn(async (key: string, value: string) => {
        values.set(key, value);
      }),
    },
  };
});

afterEach(() => {
  act(() => useNotificationStore.setState({ queue: [] }));
});
