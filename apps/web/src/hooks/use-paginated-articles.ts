import { convexQuery } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type ArticleFilter = 'unread' | 'all' | 'archive';
type PaginationStatus = 'LoadingFirstPage' | 'CanLoadMore' | 'LoadingMore' | 'Exhausted';

type ArticlesPage = (typeof api.articles.listUserArticles)['_returnType'];
type ArticleListItem = ArticlesPage['page'][number];

const CACHE_KEY_PREFIX = '__articles_pagination__' as const;
const CACHE_GC_TIME = 5 * 60 * 1000; // 5 minutes

// TODO: revisit this implementation
export function usePaginatedQuery({
  filter,
  tags,
  pageSize,
}: {
  filter: ArticleFilter;
  tags: string[];
  pageSize: number;
}): {
  results: Array<ArticleListItem>;
  status: PaginationStatus;
  loadMore: (_numItems: number) => void;
} {
  const queryClient = useQueryClient();

  const cursorCacheKey = useMemo(
    () => [CACHE_KEY_PREFIX, 'cursors', filter, tags.join(','), pageSize] as const,
    [filter, pageSize, tags]
  );

  const [loadedCursors, setLoadedCursors] = useState<Array<string | null>>(
    () => queryClient.getQueryData<Array<string | null>>(cursorCacheKey) ?? [null]
  );
  const pendingPagesToLoadRef = useRef(0);

  useEffect(() => {
    const cachedCursors = queryClient.getQueryData<Array<string | null>>(cursorCacheKey);
    setLoadedCursors(cachedCursors ?? [null]);
    pendingPagesToLoadRef.current = 0;
  }, [cursorCacheKey, queryClient]);

  useEffect(() => {
    queryClient.setQueryData<Array<string | null>>(cursorCacheKey, loadedCursors, {
      updatedAt: Date.now(),
    });
  }, [cursorCacheKey, loadedCursors, queryClient]);

  const reactivePageQueries = useQueries({
    queries: loadedCursors.map((cursor) => ({
      ...convexQuery(api.articles.listUserArticles, {
        filter,
        tags: tags.length > 0 ? tags : undefined,
        paginationOpts: {
          numItems: pageSize,
          cursor,
        },
      }),
      gcTime: CACHE_GC_TIME,
      staleTime: CACHE_GC_TIME,
    })),
  });

  const pages = useMemo(() => {
    return reactivePageQueries
      .map((queryResult) => queryResult.data)
      .filter(Boolean) as Array<ArticlesPage>;
  }, [reactivePageQueries]);

  const resolvedResults = useMemo(() => pages.flatMap((page) => page.page), [pages]);

  const lastResolvedPage = pages.at(-1);

  useEffect(() => {
    if (pendingPagesToLoadRef.current <= 0 || !lastResolvedPage) {
      return;
    }

    if (lastResolvedPage.isDone) {
      pendingPagesToLoadRef.current = 0;
      return;
    }

    const nextCursor = lastResolvedPage.continueCursor;
    if (loadedCursors.includes(nextCursor)) {
      pendingPagesToLoadRef.current = 0;
      return;
    }

    pendingPagesToLoadRef.current -= 1;
    setLoadedCursors((prev) => [...prev, nextCursor]);
  }, [lastResolvedPage, loadedCursors]);

  const status = useMemo<PaginationStatus>(() => {
    const firstPageQuery = reactivePageQueries.at(0);
    if (firstPageQuery?.isPending && !firstPageQuery.data) {
      return 'LoadingFirstPage';
    }

    const isLoadingMore =
      pendingPagesToLoadRef.current > 0 ||
      (loadedCursors.length > 1 &&
        Boolean(
          reactivePageQueries.at(-1)?.isPending &&
            !reactivePageQueries.at(-1)?.data &&
            reactivePageQueries.at(-2)?.data
        ));

    if (isLoadingMore) {
      return 'LoadingMore';
    }

    if (lastResolvedPage && !lastResolvedPage.isDone) {
      return 'CanLoadMore';
    }

    return 'Exhausted';
  }, [loadedCursors.length, lastResolvedPage, reactivePageQueries]);

  const loadMore = useCallback(
    (numItems: number) => {
      const pagesToLoad = Math.max(1, Math.ceil(numItems / pageSize));
      const latestLoadedPage = pages.at(-1);

      if (!latestLoadedPage || latestLoadedPage.isDone) {
        return;
      }

      const nextCursor = latestLoadedPage.continueCursor;
      if (loadedCursors.includes(nextCursor)) {
        return;
      }

      pendingPagesToLoadRef.current += Math.max(0, pagesToLoad - 1);
      setLoadedCursors((prev) => [...prev, nextCursor]);
    },
    [loadedCursors, pageSize, pages]
  );

  return {
    results: resolvedResults,
    status,
    loadMore,
  };
}
