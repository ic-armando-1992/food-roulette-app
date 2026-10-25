import { Image } from 'expo-image';
import { ExternalLink, Heart, MapPin, Utensils } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import { getApiResourceUrl } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { notify } from '@/core/notifications/notify';
import { formatLongDate } from '@/core/utils/format-date';
import { FAVORITES_LABELS } from '@/features/favorites/constants/favorites.labels';
import { FavoriteCardProps } from '@/features/favorites/types/favorites.types';
import colors from '@/theme/colors.json';

export function FavoriteCard({
  isRemoving,
  item,
  onRemove,
}: FavoriteCardProps) {
  const restaurant = item.restaurant;
  const photo = restaurant?.photo;
  const photoUrl = useMemo(
    () => (photo ? getApiResourceUrl(photo.url) : null),
    [photo],
  );
  const [photoFailed, setPhotoFailed] = useState(false);
  const savedDate = formatLongDate(item.createdAt, 'es-MX');

  const openMaps = async () => {
    if (!restaurant?.mapsUri) {
      return;
    }

    try {
      await Linking.openURL(restaurant.mapsUri);
    } catch {
      notify.error(FAVORITES_LABELS.error.maps);
    }
  };

  return (
    <View className="overflow-hidden rounded-3xl border border-border bg-surface">
      <View className="h-44 items-center justify-center bg-surfaceSecondary">
        {restaurant && photoUrl && !photoFailed ? (
          <Image
            accessibilityLabel={FAVORITES_LABELS.accessibility.photo(
              restaurant.name,
            )}
            contentFit="cover"
            onError={() => setPhotoFailed(true)}
            recyclingKey={`${restaurant.id}:${photoUrl}`}
            source={{ uri: photoUrl }}
            style={{ height: '100%', width: '100%' }}
            transition={200}
          />
        ) : (
          <View className="items-center gap-2">
            <Utensils color={colors.mutedForeground} size={32} />
            <Text className="text-sm text-mutedForeground">
              {restaurant
                ? FAVORITES_LABELS.photo.unavailable
                : FAVORITES_LABELS.error.unavailable}
            </Text>
          </View>
        )}

        <Pressable
          accessibilityLabel={FAVORITES_LABELS.accessibility.remove(
            restaurant?.name ?? FAVORITES_LABELS.error.unavailable,
          )}
          accessibilityRole="button"
          accessibilityState={{ busy: isRemoving, disabled: isRemoving }}
          className="absolute right-4 top-4 h-11 w-11 items-center justify-center rounded-full bg-surface"
          disabled={isRemoving}
          onPress={() => onRemove(item.restaurantId)}
          style={({ pressed }) => ({
            opacity: isRemoving ? 0.55 : pressed ? 0.78 : 0.96,
          })}
        >
          <Heart color={colors.primary} fill={colors.primary} size={22} />
        </Pressable>
      </View>

      <View className="gap-3 p-5">
        {restaurant ? (
          <>
            <Text className="text-2xl font-black text-foreground">
              {restaurant.name}
            </Text>
            {restaurant.formattedAddress ? (
              <View className="flex-row items-start gap-2">
                <MapPin color={colors.mutedForeground} size={18} />
                <Text className="flex-1 text-sm leading-5 text-mutedForeground">
                  {restaurant.formattedAddress}
                </Text>
              </View>
            ) : null}
            {restaurant.mapsUri ? (
              <Button
                icon={<MapPin color={colors.primaryForeground} size={18} />}
                label={FAVORITES_LABELS.actions.openMaps}
                onPress={() => void openMaps()}
              />
            ) : null}
          </>
        ) : (
          <Text className="font-bold text-foreground">
            {FAVORITES_LABELS.error.unavailable}
          </Text>
        )}

        {savedDate ? (
          <Text className="text-xs font-semibold text-mutedForeground">
            {FAVORITES_LABELS.result.saved} · {savedDate}
          </Text>
        ) : null}

        {item.attribution ? (
          <Text className="text-xs text-mutedForeground">
            {FAVORITES_LABELS.result.attributionPrefix}{' '}
            {item.attribution.displayText}
          </Text>
        ) : null}
        {photo?.authorAttributions.map((attribution, index) => (
          <Pressable
            accessibilityRole={attribution.uri ? 'link' : undefined}
            disabled={!attribution.uri}
            key={`${attribution.uri ?? attribution.displayName ?? 'author'}-${index}`}
            onPress={() => {
              if (attribution.uri) {
                void Linking.openURL(attribution.uri);
              }
            }}
          >
            <Text className="text-xs text-mutedForeground">
              {FAVORITES_LABELS.photo.authorPrefix}{' '}
              {attribution.displayName ?? FAVORITES_LABELS.photo.authorFallback}
            </Text>
          </Pressable>
        ))}
        {photo ? (
          <Pressable
            accessibilityRole="link"
            className="flex-row items-center gap-1"
            onPress={() => void Linking.openURL(photo.googleMapsUri)}
          >
            <ExternalLink color={colors.mutedForeground} size={13} />
            <Text className="text-xs font-semibold text-mutedForeground">
              {FAVORITES_LABELS.photo.source}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
