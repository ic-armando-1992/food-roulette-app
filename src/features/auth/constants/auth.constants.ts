export const AUTH_API_PATHS = {
  guest: '/v1/auth/guest',
  me: '/v1/auth/me',
  refresh: '/v1/auth/refresh',
} as const;

export const AUTH_SECURE_STORE_KEYS = {
  guestCredential: 'food-roulette.guest-credential',
  refreshToken: 'food-roulette.refresh-token',
} as const;

export const AUTH_ERROR_MESSAGES = {
  missingProvider: 'useAuth must be used within AuthProvider',
} as const;
