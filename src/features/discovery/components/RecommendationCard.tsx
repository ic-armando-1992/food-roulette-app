import { Image } from 'expo-image';
import {
  ExternalLink,
  MapPin,
  RotateCw,
  Star,
  Utensils,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';

import { getApiResourceUrl } from '@/api/client';
import {
  PriceLevel,
  RandomRecommendationResponse,
  RestaurantPhotoAuthorAttribution,
} from '@/api/contracts/recommendations';
import { Button } from '@/components/ui/Button';

type RecommendationCardProps = {
  isRerolling: boolean;
  onReroll: () => void;
  result: RandomRecommendationResponse;
};

const PRICE_LABELS: Record<PriceLevel, string> = {
  FREE: 'Gratis',
  INEXPENSIVE: '$',
  MODERATE: '$$',
  EXPENSIVE: '$$$',
  VERY_EXPENSIVE: '$$$$',
};

const CATEGORY_LABELS: Record<string, string> = {
  afghani_restaurant: 'Restaurante afgano',
  african_restaurant: 'Restaurante africano',
  american_restaurant: 'Restaurante estadounidense',
  asian_restaurant: 'Restaurante asiático',
  bakery: 'Panadería',
  bar: 'Bar',
  bar_and_grill: 'Bar y parrilla',
  barbecue_restaurant: 'Parrilla',
  brazilian_restaurant: 'Restaurante brasileño',
  breakfast_restaurant: 'Restaurante de desayunos',
  brunch_restaurant: 'Restaurante de brunch',
  buffet_restaurant: 'Bufé',
  cafe: 'Cafetería',
  cafeteria: 'Cafetería',
  chinese_restaurant: 'Restaurante chino',
  coffee_shop: 'Cafetería',
  deli: 'Delicatessen',
  dessert_restaurant: 'Restaurante de postres',
  dessert_shop: 'Tienda de postres',
  diner: 'Restaurante informal',
  fast_food_restaurant: 'Comida rápida',
  fine_dining_restaurant: 'Alta cocina',
  food_court: 'Patio de comidas',
  french_restaurant: 'Restaurante francés',
  greek_restaurant: 'Restaurante griego',
  hamburger_restaurant: 'Hamburguesería',
  ice_cream_shop: 'Heladería',
  indian_restaurant: 'Restaurante indio',
  indonesian_restaurant: 'Restaurante indonesio',
  italian_restaurant: 'Restaurante italiano',
  japanese_restaurant: 'Restaurante japonés',
  juice_shop: 'Bar de jugos',
  korean_restaurant: 'Restaurante coreano',
  lebanese_restaurant: 'Restaurante libanés',
  meal_delivery: 'Entrega de comida',
  meal_takeaway: 'Comida para llevar',
  mediterranean_restaurant: 'Restaurante mediterráneo',
  mexican_restaurant: 'Restaurante mexicano',
  middle_eastern_restaurant: 'Restaurante de Medio Oriente',
  pizza_restaurant: 'Pizzería',
  pub: 'Pub',
  ramen_restaurant: 'Restaurante de ramen',
  restaurant: 'Restaurante',
  sandwich_shop: 'Tienda de sándwiches',
  seafood_restaurant: 'Restaurante de mariscos',
  spanish_restaurant: 'Restaurante español',
  steak_house: 'Restaurante de carnes',
  sushi_restaurant: 'Restaurante de sushi',
  tea_house: 'Casa de té',
  thai_restaurant: 'Restaurante tailandés',
  turkish_restaurant: 'Restaurante turco',
  vegan_restaurant: 'Restaurante vegano',
  vegetarian_restaurant: 'Restaurante vegetariano',
  vietnamese_restaurant: 'Restaurante vietnamita',
};

function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1_000) {
    return `a ${Math.round(distanceMeters)} m`;
  }

  return `a ${(distanceMeters / 1_000).toFixed(1)} km`;
}

function formatCategory(value: string | undefined): string {
  if (!value) {
    return 'Restaurante';
  }

  return CATEGORY_LABELS[value] ?? 'Restaurante';
}

function PhotoAttribution({
  attribution,
}: {
  attribution: RestaurantPhotoAuthorAttribution;
}) {
  const label = attribution.displayName ?? 'Autor de la foto';

  return (
    <View className="mt-2 flex-row items-center gap-2">
      {attribution.photoUri ? (
        <Image
          accessibilityLabel={`Imagen de perfil de ${label}`}
          source={{ uri: attribution.photoUri }}
          style={{ borderRadius: 12, height: 24, width: 24 }}
        />
      ) : null}
      <Pressable
        accessibilityRole={attribution.uri ? 'link' : undefined}
        disabled={!attribution.uri}
        onPress={() => {
          if (attribution.uri) {
            void Linking.openURL(attribution.uri);
          }
        }}
      >
        <Text className="text-xs text-mutedForeground">Foto de {label}</Text>
      </Pressable>
    </View>
  );
}

export function RecommendationCard({
  isRerolling,
  onReroll,
  result,
}: RecommendationCardProps) {
  const { attribution, recommendation } = result;
  const photo = recommendation.photo;
  const mapsUri = recommendation.mapsUri;
  const [failedPhotoRestaurantId, setFailedPhotoRestaurantId] = useState<
    string | null
  >(null);
  const photoFailed = failedPhotoRestaurantId === recommendation.id;
  const photoUrl = useMemo(
    () => (photo ? getApiResourceUrl(photo.url) : null),
    [photo],
  );
  const category = recommendation.primaryType ?? recommendation.types[0];

  return (
    <View className="relative overflow-hidden rounded-3xl border border-border bg-surface">
      {isRerolling ? (
        <View
          accessibilityLabel="Buscando otra opción"
          accessibilityRole="progressbar"
          className="absolute inset-0 z-10 items-center justify-center px-8"
          style={{ backgroundColor: 'rgba(255, 248, 243, 0.94)' }}
        >
          <View className="rounded-full bg-surface p-4">
            <ActivityIndicator color="#E85D3F" size="large" />
          </View>
          <Text className="mt-4 text-center text-xl font-black text-foreground">
            Buscando otra opción…
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-mutedForeground">
            Conservamos tu elección anterior hasta encontrar la siguiente.
          </Text>
        </View>
      ) : null}

      <View className="h-52 items-center justify-center bg-surfaceSecondary">
        {photoUrl && !photoFailed ? (
          <Image
            accessibilityLabel={`Foto de ${recommendation.name}`}
            contentFit="cover"
            onError={() => setFailedPhotoRestaurantId(recommendation.id)}
            source={{ uri: photoUrl }}
            style={{ height: '100%', width: '100%' }}
            transition={200}
          />
        ) : (
          <View className="items-center gap-2">
            <Utensils color="#75675E" size={34} />
            <Text className="text-sm text-mutedForeground">
              No hay foto disponible
            </Text>
          </View>
        )}
      </View>

      <View className="gap-4 p-5">
        <View>
          <Text className="text-sm font-bold uppercase tracking-widest text-primary">
            Tu elección
          </Text>
          <Text className="mt-1 text-3xl font-black text-foreground">
            {recommendation.name}
          </Text>
          {recommendation.formattedAddress ? (
            <Text className="mt-2 text-sm leading-5 text-mutedForeground">
              {recommendation.formattedAddress}
            </Text>
          ) : null}
        </View>

        <View className="flex-row flex-wrap gap-2">
          <View className="flex-row items-center gap-1 rounded-full bg-surfaceSecondary px-3 py-2">
            <Utensils color="#75675E" size={15} />
            <Text className="text-sm font-semibold text-foreground">
              {formatCategory(category)}
            </Text>
          </View>
          {recommendation.rating !== undefined ? (
            <View className="flex-row items-center gap-1 rounded-full bg-surfaceSecondary px-3 py-2">
              <Star color="#B76E00" fill="#B76E00" size={15} />
              <Text className="text-sm font-semibold text-foreground">
                {recommendation.rating.toFixed(1)}
                {recommendation.userRatingCount !== undefined
                  ? ` (${recommendation.userRatingCount})`
                  : ''}
              </Text>
            </View>
          ) : null}
          {recommendation.priceLevel ? (
            <View className="rounded-full bg-surfaceSecondary px-3 py-2">
              <Text className="text-sm font-semibold text-foreground">
                {PRICE_LABELS[recommendation.priceLevel]}
              </Text>
            </View>
          ) : null}
          <View className="flex-row items-center gap-1 rounded-full bg-surfaceSecondary px-3 py-2">
            <MapPin color="#75675E" size={15} />
            <Text className="text-sm font-semibold text-foreground">
              {formatDistance(recommendation.distanceMeters)}
            </Text>
          </View>
        </View>

        {attribution ? (
          <Text className="text-xs text-mutedForeground">
            Resultados de {attribution.displayText}
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
            className="flex-row items-center gap-1"
            onPress={() => void Linking.openURL(photo.googleMapsUri)}
          >
            <ExternalLink color="#75675E" size={13} />
            <Text className="text-xs font-semibold text-mutedForeground">
              Ver fuente de la foto
            </Text>
          </Pressable>
        ) : null}

        {mapsUri ? (
          <Button
            icon={<MapPin color="#2A211C" size={18} />}
            label="ABRIR EN MAPAS"
            onPress={() => void Linking.openURL(mapsUri)}
            variant="secondary"
          />
        ) : null}
        <Button
          icon={<RotateCw color="#FFFFFF" size={18} />}
          label={isRerolling ? 'GIRANDO…' : 'VOLVER A GIRAR'}
          loading={isRerolling}
          onPress={onReroll}
        />
      </View>
    </View>
  );
}
