function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  convexUrl: requireEnv(process.env.EXPO_PUBLIC_CONVEX_URL, 'EXPO_PUBLIC_CONVEX_URL'),
  convexSiteUrl: requireEnv(process.env.EXPO_PUBLIC_CONVEX_SITE_URL, 'EXPO_PUBLIC_CONVEX_SITE_URL'),
  siteUrl: requireEnv(process.env.EXPO_PUBLIC_SITE_URL, 'EXPO_PUBLIC_SITE_URL'),
};
