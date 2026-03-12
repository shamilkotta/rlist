const TAG_MAX_LENGTH = 15;
const MAX_FILTER_TAGS = 12;

export function normalizeTags(rawTags: string[]): string[] {
  return [...new Set(rawTags.map((tag) => tag.trim().toUpperCase()).filter(Boolean))]
    .filter((tag) => tag.length <= TAG_MAX_LENGTH)
    .slice(0, MAX_FILTER_TAGS);
}

export function normalizeTag(value: string): string {
  return value.trim().toUpperCase();
}
