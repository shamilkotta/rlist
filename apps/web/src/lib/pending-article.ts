const PENDING_ARTICLE_KEY = 'rlist.pendingArticleUrl';

export function setPendingArticleUrl(url: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PENDING_ARTICLE_KEY, url);
  }
}

export function getPendingArticleUrl(): string | null {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(PENDING_ARTICLE_KEY);
  }
  return null;
}

export function clearPendingArticleUrl(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(PENDING_ARTICLE_KEY);
  }
}
