const TAG_MAX_LENGTH = 15;
const MAX_FILTER_TAGS = 12;

export function normalizeTags(rawTags: unknown): string[] {
  if (!rawTags) {
    return [];
  }

  let source: unknown = rawTags;
  // TanStack may pass arrays already parsed; also accept a JSON array string.
  if (typeof source === 'string') {
    const trimmed = source.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        source = JSON.parse(trimmed) as unknown;
      } catch {
        // Fall through to comma-separated parsing.
      }
    }
  }

  const tagValues =
    typeof source === 'string'
      ? source.split(',')
      : Array.isArray(source)
        ? source.flatMap((value) => (typeof value === 'string' ? value.split(',') : []))
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
