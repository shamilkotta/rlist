import { authClient } from '@/lib/auth-client';
import { convexQueryClient, queryClient } from '@/lib/convex';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConvexProviderWithAuth } from 'convex/react';
import type { PropsWithChildren } from 'react';
import { useCallback, useMemo } from 'react';

function useAuthFromBetterAuth() {
  const { data: session, isPending } = authClient.useSession();

  const fetchAccessToken = useCallback(async () => {
    if (!session) {
      return null;
    }

    try {
      const result = await authClient.convex.token();
      return result.data?.token ?? null;
    } catch {
      return null;
    }
  }, [session]);

  return useMemo(
    () => ({
      isLoading: isPending,
      isAuthenticated: session !== null,
      fetchAccessToken,
    }),
    [fetchAccessToken, isPending, session]
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConvexProviderWithAuth
        client={convexQueryClient.convexClient}
        useAuth={useAuthFromBetterAuth}
      >
        {children}
      </ConvexProviderWithAuth>
    </QueryClientProvider>
  );
}
