export const AUTH_API_PATHS = {
  google: '/v1/auth/google',
  googleConfirm: '/v1/auth/google/confirm',
  guest: '/v1/auth/guest',
  logout: '/v1/auth/logout',
  me: '/v1/auth/me',
  refresh: '/v1/auth/refresh',
} as const;

export const AUTH_SECURE_STORE_KEYS = {
  googleLinkPromptSeen: 'food-roulette.google-link-prompt-seen',
  guestCredential: 'food-roulette.guest-credential',
  refreshToken: 'food-roulette.refresh-token',
} as const;

export const GOOGLE_SIGN_IN_WIDE_MINIMUM_SCREEN_WIDTH = 360;

export const AUTH_ERROR_MESSAGES = {
  googleSignInFailed:
    'No pudimos iniciar sesión con Google. Inténtalo de nuevo.',
  googleSignInUnavailable:
    'Google Sign-In no está disponible en esta versión de la app.',
  logoutFailed:
    'No pudimos cerrar la sesión de forma segura. Inténtalo de nuevo.',
  missingProvider: 'useAuth must be used within AuthProvider',
} as const;

export const AUTH_LABELS = {
  account: {
    accessibility: {
      close: 'Cerrar cuenta',
      googleAvatarFallback: 'Perfil de la cuenta de Google',
      openGoogle: 'Abrir cuenta de Google',
      openGuest: 'Abrir cuenta de invitado',
    },
    googleBody:
      'Tu progreso está vinculado y podrás recuperarlo en otro dispositivo.',
    googleTitle: 'Cuenta de Google',
    guestBody:
      'Puedes seguir usando la ruleta sin registrarte. Vincula Google para conservar tu progreso al cambiar de dispositivo.',
    guestTitle: 'Cuenta de invitado',
    memberSince: (date: string) => `Cuenta creada el ${date}`,
    title: 'Cuenta',
  },
  google: {
    cancel: 'Cancelar',
    conflictConfirm: 'Cambiar de cuenta',
    conflictMessage:
      'Esta cuenta de Google ya está vinculada. Si continúas, usarás esa cuenta. Tus otros datos de invitado no se fusionarán automáticamente.',
    conflictTitle: 'Esta cuenta ya existe',
    continue: 'Continuar con Google',
    errorTitle: 'No pudimos iniciar sesión',
    successMessage: 'Tu progreso quedó vinculado a tu cuenta de Google.',
    successTitle: 'Cuenta vinculada',
  },
  logout: {
    accessibility: 'Cerrar la sesión de Google',
    cancel: 'Cancelar',
    confirm: 'Cerrar sesión',
    errorTitle: 'No pudimos cerrar sesión',
    localOnlyMessage:
      'La cuenta se quitó de este dispositivo, pero no pudimos confirmar la revocación remota. La sesión del servidor vencerá automáticamente.',
    localOnlyTitle: 'Sesión cerrada en este dispositivo',
    message:
      'Tu progreso vinculado a Google permanecerá guardado. Podrás recuperarlo cuando vuelvas a iniciar sesión.',
    newGuestUnavailableMessage:
      'La cuenta se quitó de este dispositivo. Cuando recuperes la conexión podrás continuar con una nueva sesión de invitado.',
    title: '¿Cerrar sesión?',
  },
  prompt: {
    body: 'Vincula tu cuenta con Google para conservar tu progreso cuando cambies de dispositivo.',
    dismiss: 'Ahora no',
    title: '¿Quieres conservar tu progreso?',
  },
  sessionRecovery: {
    accessibilityDismiss: 'Ocultar aviso de sesión',
    body: 'Continúa como invitado o inicia sesión con Google desde Cuenta para recuperar tu progreso.',
    title: 'Tu sesión anterior terminó',
  },
} as const;
