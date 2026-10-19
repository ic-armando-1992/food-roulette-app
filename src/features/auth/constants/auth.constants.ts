export const AUTH_API_PATHS = {
  google: '/v1/auth/google',
  googleConfirm: '/v1/auth/google/confirm',
  guest: '/v1/auth/guest',
  me: '/v1/auth/me',
  refresh: '/v1/auth/refresh',
} as const;

export const AUTH_SECURE_STORE_KEYS = {
  guestCredential: 'food-roulette.guest-credential',
  refreshToken: 'food-roulette.refresh-token',
} as const;

export const AUTH_ERROR_MESSAGES = {
  googleSignInFailed:
    'No pudimos iniciar sesión con Google. Inténtalo de nuevo.',
  googleSignInUnavailable:
    'Google Sign-In no está disponible en esta versión de la app.',
  missingProvider: 'useAuth must be used within AuthProvider',
} as const;

export const AUTH_LABELS = {
  google: {
    cancel: 'Cancelar',
    conflictConfirm: 'Cambiar de cuenta',
    conflictMessage:
      'Esta cuenta de Google ya está vinculada. Si continúas, usarás esa cuenta. Tus otros datos de invitado no se fusionarán automáticamente.',
    conflictTitle: 'Esta cuenta ya existe',
    errorTitle: 'No pudimos iniciar sesión',
    sectionBody:
      'Protege tu cuenta y conserva tu progreso en tus dispositivos.',
    sectionTitle: 'Guarda tu progreso',
    successMessage: 'Tu progreso quedó vinculado a tu cuenta de Google.',
    successTitle: 'Cuenta vinculada',
  },
} as const;
