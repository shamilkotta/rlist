import { getDomain } from '@/lib/url';

export type ArticleFilter = 'unread' | 'all' | 'archive';

export type MockArticle = {
  articleId: string;
  url: string;
  title: string | null;
  description: string | null;
  domain: string;
  faviconUrl: string;
  tags: string[];
  isRead: boolean;
  isArchived: boolean;
  _creationTime: number;
};

export type MockArticlesPage = {
  page: MockArticle[];
  isDone: boolean;
  continueCursor: string | null;
};

export const MOCK_ARTICLES_QUERY_KEY = ['mock-articles'] as const;

const STORAGE_KEY = 'rlist.mock.articles';
const DEFAULT_PAGE_SIZE = 24;

function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

function createSeedArticles(): MockArticle[] {
  const now = Date.now();
  return [
    {
      articleId: 'a1',
      url: 'https://tanstack.com/router/latest',
      title: 'TanStack Router docs',
      description: 'Type-safe routing with first-class search params and data loading.',
      domain: 'tanstack.com',
      faviconUrl: getFaviconUrl('tanstack.com'),
      tags: ['DEV'],
      isRead: false,
      isArchived: false,
      _creationTime: now - 1000 * 60 * 10,
    },
    {
      articleId: 'a2',
      url: 'https://react.dev/learn',
      title: 'React official learn guide',
      description: 'Modern React fundamentals, components, state, and effects.',
      domain: 'react.dev',
      faviconUrl: getFaviconUrl('react.dev'),
      tags: ['REACT'],
      isRead: true,
      isArchived: false,
      _creationTime: now - 1000 * 60 * 60,
    },
    {
      articleId: 'a3',
      url: 'https://tailwindcss.com/docs/installation',
      title: 'Tailwind CSS installation',
      description: 'Set up Tailwind CSS in your project quickly.',
      domain: 'tailwindcss.com',
      faviconUrl: getFaviconUrl('tailwindcss.com'),
      tags: ['CSS'],
      isRead: false,
      isArchived: false,
      _creationTime: now - 1000 * 60 * 90,
    },
    {
      articleId: 'a4',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      title: 'MDN JavaScript',
      description: 'JavaScript references and guides.',
      domain: 'developer.mozilla.org',
      faviconUrl: getFaviconUrl('developer.mozilla.org'),
      tags: ['JS'],
      isRead: true,
      isArchived: true,
      _creationTime: now - 1000 * 60 * 120,
    },
  ];
}

function readArticles(): MockArticle[] {
  if (typeof window === 'undefined') {
    return createSeedArticles();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = createSeedArticles();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as MockArticle[];
    return parsed;
  } catch {
    return createSeedArticles();
  }
}

function writeArticles(articles: MockArticle[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

function filterArticles(articles: MockArticle[], filter: ArticleFilter): MockArticle[] {
  if (filter === 'archive') {
    return articles.filter((article) => article.isArchived);
  }

  if (filter === 'unread') {
    return articles.filter((article) => !article.isRead && !article.isArchived);
  }

  return articles;
}

function sortArticles(articles: MockArticle[]): MockArticle[] {
  return [...articles].sort((a, b) => b._creationTime - a._creationTime);
}

function parseCursor(cursor: string | null): number {
  if (!cursor) {
    return 0;
  }
  const parsed = Number.parseInt(cursor, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function listUserArticles({
  filter,
  paginationOpts,
}: {
  filter: ArticleFilter;
  paginationOpts: { numItems: number; cursor: string | null };
}): Promise<MockArticlesPage> {
  const source = sortArticles(filterArticles(readArticles(), filter));
  const start = parseCursor(paginationOpts.cursor);
  const size = paginationOpts.numItems || DEFAULT_PAGE_SIZE;
  const page = source.slice(start, start + size);
  const nextStart = start + page.length;
  const isDone = nextStart >= source.length;

  return {
    page,
    isDone,
    continueCursor: isDone ? null : String(nextStart),
  };
}

export async function searchUserArticles(query: string): Promise<MockArticle[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return sortArticles(readArticles()).filter((article) => {
    return (
      article.title?.toLowerCase().includes(normalized) ||
      article.description?.toLowerCase().includes(normalized) ||
      article.domain.toLowerCase().includes(normalized)
    );
  });
}

export async function fetchMetadata(url: string): Promise<{
  title: string;
  description: string;
  domain: string;
  faviconUrl: string;
}> {
  const domain = getDomain(url);
  return {
    title: `Saved from ${domain}`,
    description: 'Mock metadata for deployment testing.',
    domain,
    faviconUrl: getFaviconUrl(domain),
  };
}

export async function addArticle({
  url,
  tags,
}: {
  url: string;
  tags: string[];
}): Promise<{ articleId: string }> {
  const normalizedUrl = url.trim();
  const articles = readArticles();
  const duplicate = articles.find((article) => article.url === normalizedUrl);

  if (duplicate) {
    throw new Error('Article already saved');
  }

  const domain = getDomain(normalizedUrl);
  const articleId = `a-${Date.now()}`;
  const newArticle: MockArticle = {
    articleId,
    url: normalizedUrl,
    title: `Article from ${domain}`,
    description: 'Mock article content for testing.',
    domain,
    faviconUrl: getFaviconUrl(domain),
    tags,
    isRead: false,
    isArchived: false,
    _creationTime: Date.now(),
  };

  writeArticles([newArticle, ...articles]);
  return { articleId };
}

export async function toggleReadStatus({ articleId }: { articleId: string }): Promise<void> {
  const articles = readArticles();
  writeArticles(
    articles.map((article) =>
      article.articleId === articleId ? { ...article, isRead: !article.isRead } : article
    )
  );
}

export async function toggleArchiveStatus({ articleId }: { articleId: string }): Promise<void> {
  const articles = readArticles();
  writeArticles(
    articles.map((article) =>
      article.articleId === articleId ? { ...article, isArchived: !article.isArchived } : article
    )
  );
}

export async function deleteArticle({ articleId }: { articleId: string }): Promise<void> {
  const articles = readArticles();
  writeArticles(articles.filter((article) => article.articleId !== articleId));
}

export async function updateArticleTags({
  articleId,
  tags,
}: {
  articleId: string;
  tags: string[];
}): Promise<void> {
  const articles = readArticles();
  writeArticles(
    articles.map((article) => (article.articleId === articleId ? { ...article, tags } : article))
  );
}
