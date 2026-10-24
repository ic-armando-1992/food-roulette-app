import { FavoriteListItem } from '@/api/contracts/favorites';

export type FavoriteCardProps = {
  item: FavoriteListItem;
  isRemoving: boolean;
  onRemove: (restaurantId: string) => void;
};

export type FavoriteToggleButtonProps = {
  disabled?: boolean;
  isFavorite: boolean;
  isPending: boolean;
  onPress: () => void;
  restaurantName: string;
};
