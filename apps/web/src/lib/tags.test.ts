import { describe, expect, it } from 'vitest';
import { normalizeTags, toTagsSearchParam } from './tags';

describe('normalizeTags', () => {
  it('returns empty array for null/undefined', () => {
    expect(normalizeTags(null)).toEqual([]);
    expect(normalizeTags(undefined)).toEqual([]);
  });

  it('parses comma-separated string', () => {
    expect(normalizeTags('design, dev')).toEqual(['DESIGN', 'DEV']);
  });

  it('parses array of strings', () => {
    expect(normalizeTags(['design', 'dev'])).toEqual(['DESIGN', 'DEV']);
  });

  it('uppercases and trims', () => {
    expect(normalizeTags('  design  ,  dev  ')).toEqual(['DESIGN', 'DEV']);
  });

  it('deduplicates', () => {
    expect(normalizeTags(['design', 'design', 'DESIGN'])).toEqual(['DESIGN']);
  });

  it('filters by max length', () => {
    expect(normalizeTags(['a'.repeat(20)])).toEqual([]);
  });

  it('limits to max filter tags', () => {
    const many = Array.from({ length: 20 }, (_, i) => `tag${i}`);
    expect(normalizeTags(many)).toHaveLength(12);
  });
});

describe('toTagsSearchParam', () => {
  it('returns undefined for empty array', () => {
    expect(toTagsSearchParam([])).toBeUndefined();
  });

  it('returns tags for non-empty array', () => {
    expect(toTagsSearchParam(['DESIGN'])).toEqual(['DESIGN']);
  });
});
