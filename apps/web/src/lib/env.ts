function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getContactEmail(): string {
  return requireEnv(import.meta.env.VITE_CONTACT_EMAIL, 'VITE_CONTACT_EMAIL');
}
