export const VISITS_LABELS = {
  accessibility: {
    back: 'Volver a la ruleta',
    list: 'Historial de visitas verificadas',
    photo: (restaurantName: string) => `Foto de ${restaurantName}`,
  },
  actions: {
    openMaps: 'ABRIR EN MAPAS',
    retry: 'INTENTAR DE NUEVO',
  },
  empty: {
    title: 'Aún no tienes visitas',
    subtitle:
      'Registra tu visita cuando llegues a un restaurante elegido por la ruleta.',
  },
  error: {
    authUnavailable:
      'No pudimos preparar tu cuenta. Inténtalo de nuevo para ver tus visitas.',
    list: 'No pudimos cargar tus visitas. Revisa tu conexión e inténtalo de nuevo.',
    maps: 'No pudimos abrir este lugar en Maps.',
    locationUnavailable:
      'No pudimos obtener una ubicación precisa. Intenta de nuevo al aire libre.',
    permissionDenied:
      'Necesitamos permiso de ubicación para verificar que estás en el restaurante.',
    request:
      'No pudimos registrar tu visita. Revisa tu conexión e inténtalo de nuevo.',
    unavailable: 'Este restaurante ya no está disponible.',
  },
  photo: {
    authorFallback: 'Autor de la foto',
    authorPrefix: 'Foto de',
    source: 'Ver fuente de la foto',
    unavailable: 'Sin foto disponible',
  },
  result: {
    attributionPrefix: 'Datos de',
    distance: (distanceMeters: number) =>
      `Check-in verificado a ${Math.round(distanceMeters)} m`,
    visited: 'Visitado',
  },
  notification: {
    accuracyLow: (accuracyMeters: number) =>
      `La precisión actual es de ${Math.round(accuracyMeters)} m. Espera una mejor señal GPS e inténtalo de nuevo.`,
    tooFar: (distanceMeters: number) => {
      const distance =
        distanceMeters < 1_000
          ? `${Math.round(distanceMeters)} m`
          : `${(distanceMeters / 1_000).toFixed(1)} km`;

      return `Estás a ${distance} del restaurante. Acércate para registrar tu visita.`;
    },
    tooFarTitle: 'Aún no estás ahí 📍',
    verified: '¡Visita verificada! ✅',
  },
  subtitle: 'Tus últimas 10 visitas verificadas.',
  title: 'Mis visitas',
} as const;
