export function formatRelativeDate(creationTime: number): string {
  const now = Date.now();
  const diffMs = now - creationTime;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(creationTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
