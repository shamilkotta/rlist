function readRequiredEnv(name: string): string {
  const value = import.meta.env[name];
  if (!value || typeof value !== 'string') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  convexUrl: readRequiredEnv('VITE_CONVEX_URL'),
  convexSiteUrl: readRequiredEnv('VITE_CONVEX_SITE_URL'),
  siteUrl: readRequiredEnv('VITE_SITE_URL'),
};
