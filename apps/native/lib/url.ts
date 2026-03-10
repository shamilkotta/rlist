import { Linking } from 'react-native';

const ALLOWED_SCHEMES = ['http:', 'https:'];

export function isSafeWebUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_SCHEMES.includes(parsed.protocol);
  } catch {
    return false;
  }
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

export async function openSafeUrl(url: string): Promise<boolean> {
  const normalized = normalizeUrl(url);
  if (!normalized || !isSafeWebUrl(normalized)) {
    return false;
  }
  const canOpen = await Linking.canOpenURL(normalized);
  if (canOpen) {
    void Linking.openURL(normalized);
    return true;
  }
  return false;
}
