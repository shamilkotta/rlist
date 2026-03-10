import { router } from 'expo-router';

import { clearLocalData } from '@/db/repositories/articles';
import { authClient } from '@/lib/auth-client';
import { queryClient } from '@/lib/convex';

export async function signOutAndClear(userId: string): Promise<void> {
  await clearLocalData(userId);
  queryClient.clear();
  await authClient.signOut();
  router.replace('/login' as never);
}
