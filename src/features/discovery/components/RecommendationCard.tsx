import { Image } from 'expo-image';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  RotateCw,
  Sparkles,
  Star,
  Utensils,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { getApiResourceUrl } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { OpeningHoursSection } from '@/features/discovery/components/OpeningHoursSection';
import {
  CATEGORY_PRESENTATIONS,
  DISCOVERY_RESULT_LAYOUT,
  GOOGLE_MAPS_SEARCH_BASE_URL,
  PRICE_LABELS,
} from '@/features/discovery/constants/discovery.constants';
import { DISCOVERY_LABELS } from '@/features/discovery/constants/discovery.labels';
import {
  CategoryPresentation,
  PhotoAttributionProps,
  RecommendationCardProps,
} from '@/features/discovery/types/discovery.types';
import colors from '@/theme/colors.json';

function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1_000) {
    return DISCOVERY_LABELS.result.distanceMeters(Math.round(distanceMeters));
  }

  return DISCOVERY_LABELS.result.distanceKilometers(
    (distanceMeters / 1_000).toFixed(1),
  );
}

function getCategoryPresentations(types: string[]): CategoryPresentation[] {
  const labels = new Set<string>();

  return types.flatMap((type) => {
    const presentation = CATEGORY_PRESENTATIONS[type];

    if (!presentation || labels.has(presentation.label)) {
      return [];
    }

    labels.add(presentation.label);
    return [presentation];
  });
}

function PhotoAttribution({ attribution }: PhotoAttributionProps) {
  const label =
    attribution.displayName ?? DISCOVERY_LABELS.photo.authorFallback;

  return (
    <Pressable
      accessibilityRole={attribution.uri ? 'link' : undefined}
      disabled={!attribution.uri}
      onPress={() => {
        if (attribution.uri) {
          void Linking.openURL(attribution.uri);
        }
      }}
    >
      <Text className="text-xs text-mutedForeground">
        {DISCOVERY_LABELS.photo.authorPrefix} {label}
      </Text>
    </Pressable>
  );
}

export function RecommendationCard({
  isRerolling,
  onBack,
  onMapsOpened,
  onReroll,
  result,
}: RecommendationCardProps) {
  const { height } = useWindowDimensions();
  const { attribution, recommendation } = result;
  const photo = recommendation.photo;
  const mapsUri =
    recommendation.mapsUri ??
    `${GOOGLE_MAPS_SEARCH_BASE_URL}${recommendation.latitude},${recommendation.longitude}`;
  const [failedPhotoRestaurantId, setFailedPhotoRestaurantId] = useState<
    string | null
  >(null);
  const [loadedPhotoKey, setLoadedPhotoKey] = useState<string | null>(null);
  const [failedMapsRestaurantId, setFailedMapsRestaurantId] = useState<
    string | null
  >(null);
  const photoFailed = failedPhotoRestaurantId === recommendation.id;
  const photoUrl = useMemo(
    () => (photo ? getApiResourceUrl(photo.url) : null),
    [photo],
  );
  const photoKey = photoUrl ? `${recommendation.id}:${photoUrl}` : null;
  const photoHeight = Math.min(
    DISCOVERY_RESULT_LAYOUT.maximumPhotoHeight,
    Math.max(
      DISCOVERY_RESULT_LAYOUT.minimumPhotoHeight,
      height * DISCOVERY_RESULT_LAYOUT.photoHeightRatio,
    ),
  );
  const categoryPresentations = getCategoryPresentations(
    [recommendation.primaryType, ...recommendation.types].filter(
      (type): type is string => Boolean(type),
    ),
  ).slice(0, DISCOVERY_RESULT_LAYOUT.maximumCategoryTags);

  const handleOpenMaps = async () => {
    setFailedMapsRestaurantId(null);

    try {
      await Linking.openURL(mapsUri);
      onMapsOpened();
    } catch {
      setFailedMapsRestaurantId(recommendation.id);
    }
  };

  return (
    <Animated.View entering={FadeInUp.duration(380)}>
      <View
        className="relative items-center justify-center overflow-hidden bg-surfaceSecondary"
        style={{ height: photoHeight }}
      >
        {photoUrl && !photoFailed ? (
          <>
            <Image
              accessibilityLabel={DISCOVERY_LABELS.accessibility.photo(
                recommendation.name,
              )}
              contentFit="cover"
              key={photoKey}
              onError={() => setFailedPhotoRestaurantId(recommendation.id)}
              onLoad={() => setLoadedPhotoKey(photoKey)}
              recyclingKey={photoKey}
              source={{ uri: photoUrl }}
              style={{ height: '100%', width: '100%' }}
              transition={250}
            />
            {loadedPhotoKey !== photoKey ? (
              <View
                accessibilityLabel={DISCOVERY_LABELS.accessibility.loadingPhoto(
                  recommendation.name,
                )}
                accessibilityRole="progressbar"
                className="absolute inset-0 items-center justify-center gap-3 bg-surfaceSecondary"
              >
                <ActivityIndicator color={colors.primary} size="large" />
                <Text className="text-sm font-semibold text-mutedForeground">
                  {DISCOVERY_LABELS.photo.preparing}
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <View className="items-center gap-2">
            <Utensils color={colors.mutedForeground} size={38} />
            <Text className="text-sm text-mutedForeground">
              {DISCOVERY_LABELS.photo.unavailable}
            </Text>
          </View>
        )}

        <Pressable
          accessibilityLabel={DISCOVERY_LABELS.actions.backToRoulette}
          accessibilityRole="button"
          className="absolute left-5 top-5 h-12 w-12 items-center justify-center rounded-full bg-surface"
          onPress={onBack}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 0.96 })}
        >
          <ArrowLeft color={colors.foreground} size={24} />
        </Pressable>
      </View>

      <View className="-mt-5 gap-4 rounded-t-3xl bg-background px-5 pb-10 pt-6">
        <View>
          <View className="flex-row items-center gap-2">
            <Sparkles color={colors.primary} size={18} />
            <Text className="text-sm font-extrabold uppercase tracking-wider text-primary">
              {DISCOVERY_LABELS.result.selected}
            </Text>
          </View>
          <Text className="mt-2 text-3xl font-black leading-tight text-foreground">
            {recommendation.name}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {recommendation.rating !== undefined ? (
            <View className="flex-row items-center gap-1.5 rounded-full bg-surfaceSecondary px-3 py-2.5">
              <Star color={colors.warning} fill={colors.warning} size={17} />
              <Text className="font-bold text-foreground">
                {recommendation.rating.toFixed(1)}
                {recommendation.userRatingCount !== undefined
                  ? ` (${recommendation.userRatingCount.toLocaleString()})`
                  : ''}
              </Text>
            </View>
          ) : null}
          {recommendation.priceLevel ? (
            <View className="rounded-full bg-surfaceSecondary px-4 py-2.5">
              <Text className="font-bold text-foreground">
                {PRICE_LABELS[recommendation.priceLevel]}
              </Text>
            </View>
          ) : null}
          <View className="flex-row items-center gap-1.5 rounded-full bg-surfaceSecondary px-3 py-2.5">
            <MapPin color={colors.mutedForeground} size={17} />
            <Text className="font-bold text-foreground">
              {formatDistance(recommendation.distanceMeters)}
            </Text>
          </View>
        </View>

        {categoryPresentations.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {categoryPresentations.map((category) => (
              <View
                className="flex-row items-center gap-1.5 rounded-full bg-surfaceSecondary px-3 py-2"
                key={category.label}
              >
                {category.icon ? <Text>{category.icon}</Text> : null}
                <Text className="text-sm text-foreground">
                  {category.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {recommendation.openingHours ? (
          <OpeningHoursSection openingHours={recommendation.openingHours} />
        ) : null}

        {recommendation.formattedAddress ? (
          <View className="flex-row items-start gap-3 py-1">
            <MapPin color={colors.mutedForeground} size={21} />
            <Text className="flex-1 text-sm leading-5 text-mutedForeground">
              {recommendation.formattedAddress}
            </Text>
          </View>
        ) : null}

        <View className="gap-3">
          <Button
            icon={<MapPin color={colors.primaryForeground} size={19} />}
            label={DISCOVERY_LABELS.actions.openMaps}
            onPress={() => void handleOpenMaps()}
          />
          {failedMapsRestaurantId === recommendation.id ? (
            <Text accessibilityRole="alert" className="text-sm text-error">
              {DISCOVERY_LABELS.error.mapsUnavailable}
            </Text>
          ) : null}
          <Button
            icon={<RotateCw color={colors.foreground} size={20} />}
            label={
              isRerolling
                ? DISCOVERY_LABELS.actions.spinning
                : DISCOVERY_LABELS.actions.spinAgain
            }
            loading={isRerolling}
            onPress={onReroll}
            variant="secondary"
          />
        </View>

        <View className="gap-1 border-t border-border pt-4">
          {attribution ? (
            <Text className="text-xs text-mutedForeground">
              {DISCOVERY_LABELS.result.attributionPrefix}{' '}
              {attribution.displayText}
            </Text>
          ) : null}
          {photo?.authorAttributions.map((photoAttribution, index) => (
            <PhotoAttribution
              attribution={photoAttribution}
              key={`${photoAttribution.uri ?? photoAttribution.displayName ?? 'author'}-${index}`}
            />
          ))}
          {photo ? (
            <Pressable
              accessibilityRole="link"
              className="mt-1 flex-row items-center gap-1"
              onPress={() => void Linking.openURL(photo.googleMapsUri)}
            >
              <ExternalLink color={colors.mutedForeground} size={13} />
              <Text className="text-xs font-semibold text-mutedForeground">
                {DISCOVERY_LABELS.photo.source}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
