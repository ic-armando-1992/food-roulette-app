import { RestaurantPhoto } from '@/api/contracts/recommendations';

export type Favorite = {
  id: string;
  restaurantId: string;
  createdAt: string;
};

export type FavoriteStatus = {
  isFavorite: boolean;
};

export type FavoriteRestaurant = {
  id: string;
  name: string;
  formattedAddress?: string;
  primaryType?: string;
  types: string[];
  mapsUri?: string;
  photo: RestaurantPhoto | null;
};

export type FavoriteListItem = Favorite & {
  restaurant: FavoriteRestaurant | null;
  attribution: {
    provider: string;
    displayText: string;
  } | null;
};

export type FavoriteListResponse = {
  favorites: FavoriteListItem[];
};
