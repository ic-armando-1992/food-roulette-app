import { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  variant?: ButtonVariant;
};
