import { ComponentProps } from 'react';
import { View } from 'react-native';

type MockImageProps = ComponentProps<typeof View> & {
  onLoad?: () => void;
};

export function Image({ accessibilityLabel, onLoad, style }: MockImageProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      onLayout={onLoad}
      style={style}
    />
  );
}
