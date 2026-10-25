import { Image } from 'expo-image';
import { ExternalLink, MapPin, Utensils } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import { getApiResourceUrl } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { notify } from '@/core/notifications/notify';
import { formatLongDate } from '@/core/utils/format-date';
import { VISITS_LABELS } from '@/features/visits/constants/visits.labels';
import { VisitCardProps } from '@/features/visits/types/visits.types';
import colors from '@/theme/colors.json';

export function VisitCard({ item }: VisitCardProps) {
  const restaurant = item.restaurant;
  const photo = restaurant?.photo;
  const photoUrl = useMemo(
    () => (photo ? getApiResourceUrl(photo.url) : null),
    [photo],
  );
  const [photoFailed, setPhotoFailed] = useState(false);
  const visitDate = formatLongDate(item.checkedInAt, 'es-MX');

  const openMaps = async () => {
    if (!restaurant?.mapsUri) {
      return;
    }

    try {
      await Linking.openURL(restaurant.mapsUri);
    } catch {
      notify.error(VISITS_LABELS.error.maps);
    }
  };

  return (
    <View className="overflow-hidden rounded-3xl border border-border bg-surface">
      <View className="h-40 items-center justify-center bg-surfaceSecondary">
        {restaurant && photoUrl && !photoFailed ? (
          <Image
            accessibilityLabel={VISITS_LABELS.accessibility.photo(
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
                ? VISITS_LABELS.photo.unavailable
                : VISITS_LABELS.error.unavailable}
            </Text>
          </View>
        )}
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
                label={VISITS_LABELS.actions.openMaps}
                onPress={() => void openMaps()}
              />
            ) : null}
          </>
        ) : (
          <Text className="font-bold text-foreground">
            {VISITS_LABELS.error.unavailable}
          </Text>
        )}

        <View className="self-start rounded-full bg-surfaceSecondary px-3 py-2">
          <Text className="text-xs font-semibold text-mutedForeground">
            {VISITS_LABELS.result.distance(item.verificationDistanceMeters)}
          </Text>
        </View>

        {visitDate ? (
          <Text className="text-xs font-semibold text-mutedForeground">
            {VISITS_LABELS.result.visited} · {visitDate}
          </Text>
        ) : null}
        {item.attribution ? (
          <Text className="text-xs text-mutedForeground">
            {VISITS_LABELS.result.attributionPrefix}{' '}
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
              {VISITS_LABELS.photo.authorPrefix}{' '}
              {attribution.displayName ?? VISITS_LABELS.photo.authorFallback}
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
              {VISITS_LABELS.photo.source}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
