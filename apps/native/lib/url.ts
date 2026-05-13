import { Linking } from 'react-native';

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^localhost$/i,
  /^\[::1\]$/,
  /^\[fe80:/i,
];

const BLOCKED_SCHEMES = /^(javascript|file|data|vbscript):/i;

function isPrivateOrReservedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.localhost')) return true;
  if (lower === '169.254.169.254') return true;
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) return true;
  }
  return false;
}

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

export function validateArticleUrl(input: string): string | null {
  const trimmed = input.trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  if (BLOCKED_SCHEMES.test(trimmed)) return null;

  let url: URL;
  try {
    const toParse = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    url = new URL(toParse);
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const portNum = url.port ? Number.parseInt(url.port, 10) : url.protocol === 'https:' ? 443 : 80;
  if (!Number.isNaN(portNum) && portNum !== 80 && portNum !== 443) return null;
  if (isPrivateOrReservedHost(url.hostname)) return null;

  return url.href;
}

export function isValidUrl(url: string): boolean {
  return validateArticleUrl(url) !== null;
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

export async function openSafeUrl(url: string): Promise<boolean> {
  const validatedUrl = validateArticleUrl(url);
  if (!validatedUrl) {
    return false;
  }

  try {
    await Linking.openURL(validatedUrl);
    return true;
  } catch {
    return false;
  }
}
