import { convexQuery } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useDebounce } from '@/hooks/use-debounce';
import { authClient } from '@/lib/auth-client';
import { formatRelativeDate } from '@/lib/date';

type SearchDisplayArticle = {
  articleId: string;
  url: string;
  title: string;
  domain: string;
  faviconUrl: string;
  date: string;
};

type RawArticle = {
  articleId: string;
  url: string;
  title: string | null;
  description: string | null;
  domain: string;
  faviconUrl: string;
  tags: string[];
  isRead?: boolean;
  isArchived?: boolean;
  _creationTime: number;
};

function mapArticlesForDisplay(articles: RawArticle[] | undefined): SearchDisplayArticle[] {
  if (!articles) return [];
  return articles.map((article) => ({
    articleId: article.articleId,
    url: article.url,
    title: article.title ?? article.domain,
    domain: article.domain,
    faviconUrl: article.faviconUrl,
    date: formatRelativeDate(article._creationTime),
  }));
}

export function useArticleSearch(query: string) {
  const { data: session } = authClient.useSession();
  const isAuthenticated = Boolean(session?.user?.id);
  const debouncedQuery = useDebounce(query, 250);
  const hasSearchQuery = debouncedQuery.trim().length > 0;

  const { data: recentArticlesPage } = useQuery({
    ...convexQuery(api.articles.listUserArticles, {
      paginationOpts: { numItems: 10, cursor: null },
    }),
    enabled: isAuthenticated,
  });

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    ...convexQuery(api.articles.searchUserArticles, { query: debouncedQuery }),
    enabled: isAuthenticated && hasSearchQuery,
  });

  const defaultArticles = useMemo(
    () => mapArticlesForDisplay((recentArticlesPage?.page as RawArticle[] | undefined) ?? []),
    [recentArticlesPage]
  );

  const searchArticles = useMemo(
    () => mapArticlesForDisplay((searchResults as RawArticle[] | undefined) ?? []),
    [searchResults]
  );

  const articles = hasSearchQuery ? searchArticles : defaultArticles;
  const isSearching = hasSearchQuery && (isSearchLoading || query !== debouncedQuery);

  return {
    articles,
    isSearching,
    isAuthenticated,
    hasSearchQuery,
  };
}
