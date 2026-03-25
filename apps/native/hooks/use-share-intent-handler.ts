import { useRouter } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { useEffect } from 'react';

export function useShareIntentHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const router = useRouter();

  useEffect(() => {
    if (hasShareIntent && shareIntent) {
      const url = shareIntent.webUrl || shareIntent.text;
      if (url) {
        router.push({ pathname: '/save-url', params: { sharedUrl: url } });
        resetShareIntent();
      }
    }
  }, [hasShareIntent, shareIntent, router, resetShareIntent]);
}
