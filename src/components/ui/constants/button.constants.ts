import { ButtonVariant } from '@/components/ui/types/button.types';
import colors from '@/theme/colors.json';

export const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'border border-border bg-surface',
};

export const BUTTON_LABEL_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-primaryForeground',
  secondary: 'text-foreground',
};

export const BUTTON_LOADING_COLORS: Record<ButtonVariant, string> = {
  primary: colors.primaryForeground,
  secondary: colors.primary,
};
