const TAG_MAX_LENGTH = 15;
const MAX_FILTER_TAGS = 12;

export function normalizeTags(rawTags: unknown): string[] {
  if (!rawTags) {
    return [];
  }

  const tagValues =
    typeof rawTags === 'string'
      ? rawTags.split(',')
      : Array.isArray(rawTags)
        ? rawTags.flatMap((value) => (typeof value === 'string' ? value.split(',') : []))
        : [];

  return [...new Set(tagValues.map((tag) => tag.trim().toUpperCase()).filter(Boolean))]
    .filter((tag) => tag.length <= TAG_MAX_LENGTH)
    .slice(0, MAX_FILTER_TAGS);
}

export function toTagsSearchParam(tags: string[]): string[] | undefined {
  if (tags.length === 0) {
    return undefined;
  }
  return tags;
}
