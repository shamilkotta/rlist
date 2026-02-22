export function isValidUrl(string: string): boolean {
  const trimmed = string.trim();
  if (!trimmed) return false;

  if (/^https?:\/\/.+/.test(trimmed)) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/;
  return domainPattern.test(trimmed);
}

export function getDomain(url: string): string {
  try {
    if (!url.startsWith('http')) {
      return new URL(`https://${url}`).hostname;
    }
    return new URL(url).hostname;
  } catch {
    return '';
  }
}
