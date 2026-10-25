import { useEffect } from 'react';

import { notify } from '@/core/notifications/notify';
import { AUTH_LABELS } from '@/features/auth/constants/auth.constants';
import { useAuth } from '@/features/auth/providers/AuthProvider';

export function SessionRecoveryNotice() {
  const { dismissSessionRecoveryNotice, sessionRecoveryNoticeVisible, user } =
    useAuth();

  useEffect(() => {
    if (!sessionRecoveryNoticeVisible || !user?.isGuest) {
      return;
    }

    notify.info(AUTH_LABELS.sessionRecovery.title, {
      description: AUTH_LABELS.sessionRecovery.body,
      onDismiss: dismissSessionRecoveryNotice,
      persistent: true,
    });
  }, [
    dismissSessionRecoveryNotice,
    sessionRecoveryNoticeVisible,
    user?.isGuest,
  ]);

  return null;
}
