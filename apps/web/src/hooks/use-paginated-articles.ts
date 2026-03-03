import {
  type ArticleFilter,
  MOCK_ARTICLES_QUERY_KEY,
  type MockArticle,
  listUserArticles,
} from '@/lib/mock-articles';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
type PaginationStatus = 'LoadingFirstPage' | 'CanLoadMore' | 'LoadingMore' | 'Exhausted';

export function usePaginatedQuery({
  filter,
  pageSize,
}: {
  filter: ArticleFilter;
  pageSize: number;
}): {
  results: Array<MockArticle>;
  status: PaginationStatus;
  loadMore: (_numItems: number) => void;
} {
  const query = useInfiniteQuery({
    queryKey: [...MOCK_ARTICLES_QUERY_KEY, filter, pageSize],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      listUserArticles({
        filter,
        paginationOpts: {
          numItems: pageSize,
          cursor: pageParam,
        },
      }),
    getNextPageParam: (lastPage) => (lastPage.isDone ? undefined : lastPage.continueCursor),
  });

  const status = useMemo<PaginationStatus>(() => {
    if (query.isPending) {
      return 'LoadingFirstPage';
    }

    if (query.isFetchingNextPage) {
      return 'LoadingMore';
    }

    if (query.hasNextPage) {
      return 'CanLoadMore';
    }

    return 'Exhausted';
  }, [query.hasNextPage, query.isFetchingNextPage, query.isPending]);

  const resolvedResults = useMemo(
    () => query.data?.pages.flatMap((page) => page.page) ?? [],
    [query.data?.pages]
  );

  const loadMore = useCallback(
    (numItems: number) => {
      void numItems;
      if (!query.hasNextPage || query.isFetchingNextPage) {
        return;
      }

      query.fetchNextPage();
    },
    [query]
  );

  return {
    results: resolvedResults,
    status,
    loadMore,
  };
}
