import { AchievementProgression } from '@/api/contracts/achievements';

export type AccountButtonProps = {
  disabled?: boolean;
  level?: number;
  onPress: () => void;
};

export type AccountModalProps = {
  onClose: () => void;
  visible: boolean;
  progression?: AchievementProgression | null;
};

export type GoogleLinkPromptProps = {
  onDismiss: () => void;
};

export type GoogleSignInActionProps = {
  onBeforeSignIn?: () => void | Promise<void>;
  onLinked?: () => void;
};

export type GoogleLinkPromptState = {
  dismiss: () => void;
  recordSuccessfulSpin: () => void;
  visible: boolean;
};
