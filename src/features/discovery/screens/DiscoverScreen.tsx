import {
  AlertCircle,
  LocateFixed,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { RadiusSelector } from '@/features/discovery/components/RadiusSelector';
import { RecommendationCard } from '@/features/discovery/components/RecommendationCard';
import { useCurrentLocation } from '@/features/discovery/hooks/useCurrentLocation';
import { useRandomRecommendation } from '@/features/discovery/hooks/useRandomRecommendation';
import { useDiscoveryStore } from '@/features/discovery/store/discovery.store';
import { getRecommendationErrorMessage } from '@/features/discovery/utils/getRecommendationErrorMessage';

export function DiscoverScreen() {
  const radiusMeters = useDiscoveryStore((state) => state.radiusMeters);
  const setRadiusMeters = useDiscoveryStore((state) => state.setRadiusMeters);
  const { requestLocation, state: locationState } = useCurrentLocation();
  const recommendation = useRandomRecommendation();
  const [excludedRestaurantIds, setExcludedRestaurantIds] = useState<string[]>(
    [],
  );
  const requestedLocationOnMount = useRef(false);

  useEffect(() => {
    if (!requestedLocationOnMount.current) {
      requestedLocationOnMount.current = true;
      void requestLocation();
    }
  }, [requestLocation]);

  const requestRecommendation = async (isReroll: boolean) => {
    if (locationState.status !== 'granted' || recommendation.isPending) {
      return;
    }

    const previousResult = recommendation.data;
    const exclusions = isReroll ? excludedRestaurantIds : [];

    if (!isReroll) {
      setExcludedRestaurantIds([]);
    }

    try {
      const result = await recommendation.recommend({
        ...locationState.coordinates,
        radiusMeters,
        candidatePoolId: isReroll
          ? previousResult?.candidatePool.id
          : undefined,
        excludedRestaurantIds: exclusions.length > 0 ? exclusions : undefined,
      });

      if (result) {
        setExcludedRestaurantIds([...exclusions, result.recommendation.id]);
      }
    } catch {
      // TanStack Query retains the normalized error for the visible error state.
    }
  };

  const handleRadiusChange = (nextRadiusMeters: number) => {
    setRadiusMeters(nextRadiusMeters);
    setExcludedRestaurantIds([]);
    recommendation.reset();
  };

  const locationReady = locationState.status === 'granted';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerClassName="gap-7 px-5 pb-12 pt-5"
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text className="text-sm font-extrabold uppercase tracking-widest text-primary">
            Food Roulette
          </Text>
          <Text className="mt-2 text-4xl font-black leading-tight text-foreground">
            Deja que el azar elija dónde comer.
          </Text>
          <Text className="mt-3 text-base leading-6 text-mutedForeground">
            Elige qué tan lejos buscar y descubre un restaurante cercano.
          </Text>
        </View>

        <View className="rounded-2xl border border-border bg-surface p-4">
          <View className="flex-row items-center gap-3">
            {locationReady ? (
              <LocateFixed color="#21865A" size={22} />
            ) : locationState.status === 'denied' ||
              locationState.status === 'error' ? (
              <AlertCircle color="#B42318" size={22} />
            ) : (
              <MapPin color="#E85D3F" size={22} />
            )}
            <View className="flex-1">
              <Text className="font-bold text-foreground">
                {locationState.status === 'idle' &&
                  'Ubicación aún no solicitada'}
                {locationState.status === 'requesting' &&
                  'Obteniendo tu ubicación…'}
                {locationState.status === 'granted' && 'Ubicación lista'}
                {locationState.status === 'denied' &&
                  'El acceso a la ubicación está desactivado'}
                {locationState.status === 'error' && 'Ubicación no disponible'}
              </Text>
              <Text className="mt-1 text-sm text-mutedForeground">
                {locationState.status === 'granted'
                  ? 'Tu ubicación solo se usa para esta búsqueda y se envía a la API de Food Roulette.'
                  : locationState.status === 'denied'
                    ? 'Activa la ubicación en los ajustes del sistema y vuelve a comprobar.'
                    : locationState.status === 'error'
                      ? 'No pudimos determinar tu posición. Inténtalo de nuevo cuando la ubicación esté disponible.'
                      : 'Necesitamos tu ubicación para buscar restaurantes cercanos.'}
              </Text>
            </View>
          </View>

          {locationState.status === 'denied' ? (
            <View className="mt-4 gap-2">
              <Button
                label="ABRIR AJUSTES"
                onPress={() => void Linking.openSettings()}
              />
              <Button
                label="COMPROBAR DE NUEVO"
                onPress={() => void requestLocation()}
                variant="secondary"
              />
            </View>
          ) : null}
          {locationState.status === 'error' ? (
            <View className="mt-4">
              <Button
                label="INTENTAR DE NUEVO"
                onPress={() => void requestLocation()}
              />
            </View>
          ) : null}
        </View>

        <RadiusSelector
          radiusMeters={radiusMeters}
          onChange={handleRadiusChange}
        />

        <Button
          disabled={!locationReady}
          icon={<Sparkles color="#FFFFFF" size={20} />}
          label={
            recommendation.isPending ? 'BUSCANDO UN LUGAR…' : 'SORPRÉNDEME'
          }
          loading={recommendation.isPending}
          onPress={() => void requestRecommendation(false)}
        />

        {recommendation.isPending && !recommendation.data ? (
          <View
            accessibilityLabel="Buscando un restaurante cercano"
            accessibilityRole="progressbar"
            className="items-center rounded-3xl border border-border bg-surface px-6 py-8"
          >
            <View className="mb-4 rounded-full bg-surfaceSecondary p-4">
              <ActivityIndicator color="#E85D3F" size="large" />
            </View>
            <Text className="text-center text-lg font-extrabold text-foreground">
              Girando la ruleta…
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-mutedForeground">
              Estamos buscando opciones cercanas para elegir una por ti.
            </Text>
          </View>
        ) : null}

        {recommendation.isError ? (
          <View className="rounded-2xl border border-error bg-surface p-4">
            <Text className="font-bold text-error">
              No pudimos elegir un restaurante
            </Text>
            <Text className="mt-1 leading-5 text-mutedForeground">
              {getRecommendationErrorMessage(recommendation.error)}
            </Text>
          </View>
        ) : null}

        {recommendation.data ? (
          <RecommendationCard
            isRerolling={recommendation.isPending}
            onReroll={() => void requestRecommendation(true)}
            result={recommendation.data}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
