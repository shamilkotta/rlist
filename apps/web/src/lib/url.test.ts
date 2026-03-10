import { describe, expect, it } from 'vitest';
import { getDomain, isValidUrl, normalizeUrl, validateArticleUrl } from './url';

describe('normalizeUrl', () => {
  it('adds https to plain URLs', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('example.com/path')).toBe('https://example.com/path');
  });

  it('preserves https URLs', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('preserves http URLs', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('trims trailing slashes', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
  });
});

describe('validateArticleUrl', () => {
  it('accepts valid public https URLs', () => {
    expect(validateArticleUrl('https://example.com')).toBe('https://example.com/');
    expect(validateArticleUrl('https://example.com/article')).toBe('https://example.com/article');
  });

  it('accepts valid public http URLs', () => {
    expect(validateArticleUrl('http://example.com')).toBe('http://example.com/');
  });

  it('adds https to plain domains', () => {
    const result = validateArticleUrl('example.com');
    expect(result).toBe('https://example.com/');
  });

  it('rejects empty input', () => {
    expect(validateArticleUrl('')).toBeNull();
    expect(validateArticleUrl('   ')).toBeNull();
  });

  it('rejects localhost', () => {
    expect(validateArticleUrl('http://localhost')).toBeNull();
    expect(validateArticleUrl('https://localhost:3000')).toBeNull();
  });

  it('rejects private IPs', () => {
    expect(validateArticleUrl('http://127.0.0.1')).toBeNull();
    expect(validateArticleUrl('http://10.0.0.1')).toBeNull();
    expect(validateArticleUrl('http://192.168.1.1')).toBeNull();
    expect(validateArticleUrl('http://172.16.0.1')).toBeNull();
    expect(validateArticleUrl('http://169.254.169.254')).toBeNull();
  });

  it('rejects non-http(s) schemes', () => {
    expect(validateArticleUrl('javascript:alert(1)')).toBeNull();
    expect(validateArticleUrl('file:///etc/passwd')).toBeNull();
  });

  it('rejects non-standard ports', () => {
    expect(validateArticleUrl('https://example.com:8080')).toBeNull();
  });
});

describe('isValidUrl', () => {
  it('returns true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('localhost')).toBe(false);
  });
});

describe('getDomain', () => {
  it('extracts hostname from URL', () => {
    expect(getDomain('https://example.com/path')).toBe('example.com');
  });

  it('handles plain domains', () => {
    expect(getDomain('example.com')).toBe('example.com');
  });

  it('returns empty string for invalid', () => {
    expect(getDomain('')).toBe('');
  });
});
