export const FAVORITES_LABELS = {
  accessibility: {
    back: 'Volver a la ruleta',
    favorite: (restaurantName: string) =>
      `Guardar ${restaurantName} en favoritos`,
    favoriteSelected: (restaurantName: string) =>
      `Quitar ${restaurantName} de favoritos`,
    list: 'Lista de restaurantes favoritos',
    photo: (restaurantName: string) => `Foto de ${restaurantName}`,
    remove: (restaurantName: string) => `Quitar ${restaurantName} de favoritos`,
  },
  actions: {
    openMaps: 'ABRIR EN MAPAS',
    retry: 'INTENTAR DE NUEVO',
  },
  empty: {
    subtitle: 'Guarda un resultado con el corazón y aparecerá aquí.',
    title: 'Aún no tienes favoritos',
  },
  error: {
    authUnavailable:
      'No pudimos preparar tu cuenta. Inténtalo de nuevo para ver tus favoritos.',
    list: 'No pudimos cargar tus favoritos. Revisa tu conexión e inténtalo de nuevo.',
    maps: 'No pudimos abrir este lugar en Maps.',
    mutation: 'No pudimos actualizar este favorito. Inténtalo de nuevo.',
    unavailable: 'Este lugar ya no está disponible.',
  },
  photo: {
    authorFallback: 'Autor de la foto',
    authorPrefix: 'Foto de',
    source: 'Ver fuente de la foto',
    unavailable: 'Sin foto disponible',
  },
  result: {
    attributionPrefix: 'Datos de',
    saved: 'Guardado',
  },
  subtitle: 'Tus lugares para volver después.',
  title: 'Favoritos',
} as const;
