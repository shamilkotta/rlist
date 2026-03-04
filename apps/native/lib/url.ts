export function normalizeUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function isValidUrl(url: string): boolean {
  const normalized = normalizeUrl(url);
  if (!normalized) {
    return false;
  }

  try {
    const parsed = new URL(normalized);
    return Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function getDomain(url: string): string {
  const normalized = normalizeUrl(url);
  if (!normalized) {
    return '';
  }

  try {
    return new URL(normalized).hostname;
  } catch {
    return normalized;
  }
}
