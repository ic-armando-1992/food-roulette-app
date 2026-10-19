import { Image } from 'expo-image';
import { UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

type AccountAvatarProps = {
  avatarUrl: string | null;
  fallbackColor: string;
  fallbackSize: number;
  fallbackTestID?: string;
  imageTestID: string;
};

export function AccountAvatar({
  avatarUrl,
  fallbackColor,
  fallbackSize,
  fallbackTestID,
  imageTestID,
}: AccountAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageAvailable = Boolean(avatarUrl && failedUrl !== avatarUrl);

  if (imageAvailable && avatarUrl) {
    return (
      <View
        accessible={false}
        pointerEvents="none"
        style={{ height: '100%', width: '100%' }}
        testID={imageTestID}
      >
        <Image
          accessible={false}
          cachePolicy="memory-disk"
          contentFit="cover"
          onError={() => setFailedUrl(avatarUrl)}
          recyclingKey={avatarUrl}
          source={{ uri: avatarUrl }}
          style={{ height: '100%', width: '100%' }}
          transition={180}
        />
      </View>
    );
  }

  return (
    <View
      accessible={false}
      className="h-full w-full items-center justify-center"
      pointerEvents="none"
      testID={fallbackTestID}
    >
      <UserRound color={fallbackColor} size={fallbackSize} />
    </View>
  );
}
