export const FAVORITES_QUERY_KEYS = {
  all: ['favorites'] as const,
  list: ['favorites', 'list'] as const,
  status: (restaurantId: string) =>
    ['favorites', 'status', restaurantId] as const,
} as const;

export const FAVORITES_QUERY_STALE_TIME_MS = 60_000;
