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
      'Haz check-in cuando llegues a un restaurante elegido por la ruleta.',
  },
  error: {
    authUnavailable:
      'No pudimos preparar tu cuenta. Inténtalo de nuevo para ver tus visitas.',
    list: 'No pudimos cargar tus visitas. Revisa tu conexión e inténtalo de nuevo.',
    maps: 'No pudimos abrir este lugar en Maps.',
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
  subtitle: 'Tus últimas 10 visitas verificadas.',
  title: 'Mis visitas',
} as const;
