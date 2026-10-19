export type AccountButtonProps = {
  onPress: () => void;
};

export type AccountModalProps = {
  onClose: () => void;
  visible: boolean;
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
