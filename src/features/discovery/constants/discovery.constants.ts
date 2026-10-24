import { ChefHat, Search, Sparkles, Utensils } from 'lucide-react-native';

import { PriceLevel } from '@/api/contracts/recommendations';
import { DISCOVERY_LABELS } from '@/features/discovery/constants/discovery.labels';
import { CategoryPresentation } from '@/features/discovery/types/discovery.types';
import colors from '@/theme/colors.json';

export const DISCOVERY_TIMING = {
  countryLookupTimeoutMs: 8_000,
  lastKnownLocationMaxAgeMs: 2 * 60 * 1_000,
  locationRequestTimeoutMs: 12_000,
  loadingMessageIntervalMs: 850,
  minimumSpinDurationMs: 2_000,
  rouletteStopDurationMs: 700,
  rouletteStopRotationDegrees: 180,
  rouletteSpinDurationMs: 1_100,
} as const;

export const RADIUS_OPTIONS = [
  { label: DISCOVERY_LABELS.radius.options[0], value: 1_000 },
  { label: DISCOVERY_LABELS.radius.options[1], value: 3_000 },
  { label: DISCOVERY_LABELS.radius.options[2], value: 5_000 },
  { label: DISCOVERY_LABELS.radius.options[3], value: 10_000 },
] as const;

export const DISCOVERY_LOADING_ICONS = [Search, ChefHat, Utensils, Sparkles];

export const PRICE_LABELS: Record<PriceLevel, string> = {
  FREE: DISCOVERY_LABELS.price.free,
  INEXPENSIVE: DISCOVERY_LABELS.price.inexpensive,
  MODERATE: DISCOVERY_LABELS.price.moderate,
  EXPENSIVE: DISCOVERY_LABELS.price.expensive,
  VERY_EXPENSIVE: DISCOVERY_LABELS.price.veryExpensive,
};

export const DISCOVERY_RESULT_LAYOUT = {
  maximumCategoryTags: 3,
  maximumPhotoHeight: 390,
  minimumPhotoHeight: 280,
  photoHeightRatio: 0.38,
} as const;

export const GOOGLE_MAPS_SEARCH_BASE_URL =
  'https://www.google.com/maps/search/?api=1&query=';

export const CATEGORY_PRESENTATIONS: Record<string, CategoryPresentation> = {
  american_restaurant: {
    label: DISCOVERY_LABELS.categories.american_restaurant,
  },
  asian_restaurant: { label: DISCOVERY_LABELS.categories.asian_restaurant },
  bakery: { icon: '🥐', label: DISCOVERY_LABELS.categories.bakery },
  bar: { icon: '🍸', label: DISCOVERY_LABELS.categories.bar },
  bar_and_grill: {
    icon: '🍖',
    label: DISCOVERY_LABELS.categories.bar_and_grill,
  },
  barbecue_restaurant: {
    icon: '🍖',
    label: DISCOVERY_LABELS.categories.barbecue_restaurant,
  },
  breakfast_restaurant: {
    icon: '🍳',
    label: DISCOVERY_LABELS.categories.breakfast_restaurant,
  },
  brunch_restaurant: {
    icon: '🍳',
    label: DISCOVERY_LABELS.categories.brunch_restaurant,
  },
  cafe: { icon: '☕', label: DISCOVERY_LABELS.categories.cafe },
  chinese_restaurant: {
    label: DISCOVERY_LABELS.categories.chinese_restaurant,
  },
  coffee_shop: {
    icon: '☕',
    label: DISCOVERY_LABELS.categories.coffee_shop,
  },
  fast_food_restaurant: {
    icon: '🍔',
    label: DISCOVERY_LABELS.categories.fast_food_restaurant,
  },
  fine_dining_restaurant: {
    label: DISCOVERY_LABELS.categories.fine_dining_restaurant,
  },
  french_restaurant: {
    label: DISCOVERY_LABELS.categories.french_restaurant,
  },
  hamburger_restaurant: {
    icon: '🍔',
    label: DISCOVERY_LABELS.categories.hamburger_restaurant,
  },
  indian_restaurant: {
    label: DISCOVERY_LABELS.categories.indian_restaurant,
  },
  italian_restaurant: {
    label: DISCOVERY_LABELS.categories.italian_restaurant,
  },
  japanese_restaurant: {
    icon: '🍣',
    label: DISCOVERY_LABELS.categories.japanese_restaurant,
  },
  korean_restaurant: {
    label: DISCOVERY_LABELS.categories.korean_restaurant,
  },
  mediterranean_restaurant: {
    label: DISCOVERY_LABELS.categories.mediterranean_restaurant,
  },
  mexican_restaurant: {
    icon: '🌮',
    label: DISCOVERY_LABELS.categories.mexican_restaurant,
  },
  pizza_restaurant: {
    icon: '🍕',
    label: DISCOVERY_LABELS.categories.pizza_restaurant,
  },
  ramen_restaurant: {
    icon: '🍜',
    label: DISCOVERY_LABELS.categories.ramen_restaurant,
  },
  restaurant: { icon: '🍴', label: DISCOVERY_LABELS.categories.restaurant },
  seafood_restaurant: {
    icon: '🦐',
    label: DISCOVERY_LABELS.categories.seafood_restaurant,
  },
  steak_house: {
    icon: '🥩',
    label: DISCOVERY_LABELS.categories.steak_house,
  },
  sushi_restaurant: {
    icon: '🍣',
    label: DISCOVERY_LABELS.categories.sushi_restaurant,
  },
  thai_restaurant: { label: DISCOVERY_LABELS.categories.thai_restaurant },
  vegan_restaurant: {
    icon: '🥗',
    label: DISCOVERY_LABELS.categories.vegan_restaurant,
  },
  vegetarian_restaurant: {
    icon: '🥗',
    label: DISCOVERY_LABELS.categories.vegetarian_restaurant,
  },
};

export const ROULETTE_APPEARANCE = {
  gestureActivationDegrees: 60,
  gestureMinimumRadiusRatio: 0.24,
  gestureResetDurationMs: 180,
  defaultSize: 292,
  foodIcons: ['🍕', '🌮', '🍣', '🍔', '🍜', '🥗', '🍗', '🥩'],
  hubRadiusRatio: 0.17,
  iconRadiusRatio: 0.31,
  maxSize: 320,
  minSize: 238,
  radiusRatio: 0.46,
  segmentColors: [
    colors.rouletteGold,
    colors.rouletteCream,
    colors.rouletteGreen,
    colors.rouletteCream,
    colors.rouletteGold,
    colors.rouletteCream,
    colors.rouletteGreen,
    colors.rouletteCream,
  ],
  segmentCount: 8,
} as const;
