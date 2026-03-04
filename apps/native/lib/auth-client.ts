import { env } from '@/lib/env';
import { convexClient } from '@convex-dev/better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: env.convexSiteUrl,
  plugins: [convexClient()],
});
