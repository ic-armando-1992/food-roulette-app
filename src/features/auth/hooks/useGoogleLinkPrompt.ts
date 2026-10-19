import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/providers/AuthProvider';
import {
  hasSeenGoogleLinkPrompt,
  markGoogleLinkPromptSeen,
} from '@/features/auth/services/auth-storage';
import { GoogleLinkPromptState } from '@/features/auth/types/account.types';

export function useGoogleLinkPrompt(): GoogleLinkPromptState {
  const { status, user } = useAuth();
  const [visible, setVisible] = useState(false);
  const promptStatus = useRef<'loading' | 'seen' | 'unseen'>('loading');
  const pendingSuccessfulSpin = useRef(false);
  const isGuest = status === 'ready' && user?.isGuest === true;
  const isGuestRef = useRef(isGuest);

  useEffect(() => {
    isGuestRef.current = isGuest;
  }, [isGuest]);

  const claimPrompt = useCallback(() => {
    if (
      promptStatus.current !== 'unseen' ||
      !pendingSuccessfulSpin.current ||
      !isGuestRef.current
    ) {
      return;
    }

    promptStatus.current = 'seen';
    setVisible(true);
    void markGoogleLinkPromptSeen().catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;

    void hasSeenGoogleLinkPrompt()
      .then((seen) => {
        if (active) {
          promptStatus.current = seen ? 'seen' : 'unseen';
          claimPrompt();
        }
      })
      .catch(() => {
        if (active) {
          promptStatus.current = 'seen';
        }
      });

    return () => {
      active = false;
    };
  }, [claimPrompt]);

  const dismiss = useCallback(() => setVisible(false), []);
  const recordSuccessfulSpin = useCallback(() => {
    pendingSuccessfulSpin.current = true;
    claimPrompt();
  }, [claimPrompt]);

  return { dismiss, recordSuccessfulSpin, visible: visible && isGuest };
}
