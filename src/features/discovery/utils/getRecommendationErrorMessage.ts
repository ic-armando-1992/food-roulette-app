import { ApiError } from '@/api/client';

export function getRecommendationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Ocurrió un problema al buscar un restaurante. Inténtalo de nuevo.';
  }

  if (error.kind === 'configuration') {
    return 'El servicio de restaurantes no está configurado en esta versión de la app.';
  }

  if (error.kind === 'timeout') {
    return 'La búsqueda tardó demasiado. Inténtalo de nuevo.';
  }

  if (error.kind === 'network') {
    return 'No pudimos conectarnos al servicio de restaurantes. Revisa tu conexión e inténtalo de nuevo.';
  }

  if (error.status === 404) {
    return 'No encontramos restaurantes cercanos con esas opciones. Prueba con un radio más amplio.';
  }

  if (error.status !== undefined && error.status >= 500) {
    return 'El servicio de restaurantes no está disponible temporalmente. Inténtalo de nuevo.';
  }

  return 'No pudimos completar la búsqueda. Ajusta tus opciones e inténtalo de nuevo.';
}
