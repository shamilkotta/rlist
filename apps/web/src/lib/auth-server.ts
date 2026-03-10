import { convexBetterAuthReactStart } from '@convex-dev/better-auth/react-start';

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const { handler, getToken, fetchAuthQuery, fetchAuthMutation, fetchAuthAction } =
  convexBetterAuthReactStart({
    convexUrl: requireEnv(import.meta.env.VITE_CONVEX_URL, 'VITE_CONVEX_URL'),
    convexSiteUrl: requireEnv(import.meta.env.VITE_CONVEX_SITE_URL, 'VITE_CONVEX_SITE_URL'),
  });
