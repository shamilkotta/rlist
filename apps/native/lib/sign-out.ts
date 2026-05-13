import { router } from 'expo-router';

import { authClient } from '@/lib/auth-client';
import { queryClient } from '@/lib/convex';

export async function signOutAndClear(): Promise<void> {
  queryClient.clear();
  await authClient.signOut();
  router.replace('/login' as never);
}
