import { ComponentProps } from 'react';
import { View } from 'react-native';

type IconProps = ComponentProps<typeof View> & {
  color?: string;
  fill?: string;
  size?: number;
};

function Icon({ accessibilityLabel }: IconProps) {
  return <View accessibilityLabel={accessibilityLabel} />;
}

export const AlertCircle = Icon;
export const ArrowLeft = Icon;
export const ChefHat = Icon;
export const ChevronDown = Icon;
export const ChevronRight = Icon;
export const ChevronUp = Icon;
export const Clock3 = Icon;
export const ExternalLink = Icon;
export const LocateFixed = Icon;
export const MapPin = Icon;
export const RotateCw = Icon;
export const Search = Icon;
export const Settings = Icon;
export const Sparkles = Icon;
export const Star = Icon;
export const Utensils = Icon;
