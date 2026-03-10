import { authClient } from '@/lib/auth-client';

export function useSignOut() {
  return () =>
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          location.reload();
        },
      },
    });
}
