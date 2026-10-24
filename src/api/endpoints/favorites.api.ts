import { apiRequest } from '@/api/client';
import {
  Favorite,
  FavoriteListResponse,
  FavoriteStatus,
} from '@/api/contracts/favorites';

export function getFavorites(): Promise<FavoriteListResponse> {
  return apiRequest<FavoriteListResponse>('/v1/favorites');
}

export function getFavoriteStatus(
  restaurantId: string,
): Promise<FavoriteStatus> {
  return apiRequest<FavoriteStatus>(`/v1/favorites/${restaurantId}`);
}

export function saveFavorite(restaurantId: string): Promise<Favorite> {
  return apiRequest<Favorite>(`/v1/favorites/${restaurantId}`, {
    method: 'PUT',
  });
}

export function removeFavorite(restaurantId: string): Promise<void> {
  return apiRequest<void>(`/v1/favorites/${restaurantId}`, {
    method: 'DELETE',
  });
}
