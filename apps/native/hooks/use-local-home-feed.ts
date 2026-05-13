import { convexQuery } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import type { Id } from '@rlist/api/convex/_generated/dataModel';
import { useMutation, useQueries } from '@tanstack/react-query';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { DisplayArticle, PaginationStatus, TabFilter } from '@/features/home/home-feed.types';
import { convexQueryClient, queryClient } from '@/lib/convex';

export type { DisplayArticle, PaginationStatus, TabFilter };

const PAGE_SIZE = 24;

type ServerArticle = {
  articleId: Id<'articles'>;
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

function toDisplayArticle(article: ServerArticle): DisplayArticle {
  return {
    articleId: article.articleId,
    url: article.url,
    title: article.title,
    description: article.description,
    domain: article.domain,
    faviconUrl: article.faviconUrl,
    tags: article.tags,
    isRead: article.isRead ?? false,
    isArchived: article.isArchived ?? false,
    creationTime: article._creationTime,
  };
}

function invalidateArticleQueries() {
  void queryClient.invalidateQueries();
}

export function useLocalHomeFeed(
  userId: string | undefined,
  filter: TabFilter,
  selectedTags: string[] = [],
  isActive = true
) {
  const [loadedCursors, setLoadedCursors] = useState<(string | null)[]>([null]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const queryScope = `${filter}:${selectedTags.join('|')}`;
  const prevQueryScopeRef = useRef(queryScope);
  const activeUserId = isActive ? userId : undefined;

  const queryScopeChanged = prevQueryScopeRef.current !== queryScope;
  if (queryScopeChanged) {
    prevQueryScopeRef.current = queryScope;
  }

  const effectiveCursors = useMemo(
    () => (queryScopeChanged ? [null] : loadedCursors),
    [queryScopeChanged, loadedCursors]
  );

  useLayoutEffect(() => {
    if (queryScopeChanged) {
      setLoadedCursors([null]);
      setIsLoadingMore(false);
    }
  }, [queryScopeChanged]);

  const pageQueries = useQueries({
    queries: activeUserId
      ? effectiveCursors.map((cursor) => ({
          ...convexQuery(api.articles.listUserArticles, {
            filter,
            tags: selectedTags,
            paginationOpts: { numItems: PAGE_SIZE, cursor },
          }),
        }))
      : [],
  });

  const pages = useMemo(
    () => pageQueries.map((query) => query.data).filter((page) => page !== undefined),
    [pageQueries]
  );

  const articles = useMemo(() => pages.flatMap((page) => page.page.map(toDisplayArticle)), [pages]);

  const loadMore = useCallback(() => {
    const latestPage = pages.at(-1);
    if (!latestPage || latestPage.isDone) return;

    const nextCursor = latestPage.continueCursor;
    if (loadedCursors.includes(nextCursor)) return;

    setIsLoadingMore(true);
    setLoadedCursors((prev) => [...prev, nextCursor]);
  }, [loadedCursors, pages]);

  const lastQuery = pageQueries.at(-1);
  useEffect(() => {
    if (isLoadingMore && lastQuery && !lastQuery.isPending) {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, lastQuery]);

  const status = useMemo<PaginationStatus>(() => {
    const firstQuery = pageQueries.at(0);
    if (articles.length === 0 && firstQuery?.isPending && !firstQuery.data) {
      return 'LoadingFirstPage';
    }
    if (isLoadingMore) return 'LoadingMore';

    const lastResolved = pages.at(-1);
    if (lastResolved && !lastResolved.isDone) return 'CanLoadMore';

    return 'Exhausted';
  }, [articles.length, isLoadingMore, pageQueries, pages]);

  const toggleReadMutation = useMutation({
    mutationFn: (articleId: string) =>
      convexQueryClient.convexClient.mutation(api.articles.toggleReadStatus, {
        articleId: articleId as Id<'articles'>,
      }),
    onSettled: invalidateArticleQueries,
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: (articleId: string) =>
      convexQueryClient.convexClient.mutation(api.articles.toggleArchiveStatus, {
        articleId: articleId as Id<'articles'>,
      }),
    onSettled: invalidateArticleQueries,
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (articleId: string) =>
      convexQueryClient.convexClient.mutation(api.articles.deleteArticle, {
        articleId: articleId as Id<'articles'>,
      }),
    onSettled: invalidateArticleQueries,
  });

  const updateTagsMutation = useMutation({
    mutationFn: ({ articleId, tags }: { articleId: string; tags: string[] }) =>
      convexQueryClient.convexClient.mutation(api.articles.updateArticleTags, {
        articleId: articleId as Id<'articles'>,
        tags,
      }),
    onSettled: invalidateArticleQueries,
  });

  const toggleRead = useCallback(
    async (articleId: string) => {
      await toggleReadMutation.mutateAsync(articleId);
    },
    [toggleReadMutation]
  );

  const toggleArchive = useCallback(
    async (articleId: string) => {
      await toggleArchiveMutation.mutateAsync(articleId);
    },
    [toggleArchiveMutation]
  );

  const deleteArticle = useCallback(
    async (articleId: string) => {
      await deleteArticleMutation.mutateAsync(articleId);
    },
    [deleteArticleMutation]
  );

  const updateTags = useCallback(
    async (articleId: string, tags: string[]) => {
      await updateTagsMutation.mutateAsync({ articleId, tags });
    },
    [updateTagsMutation]
  );

  return {
    articles,
    status,
    loadMore,
    toggleRead,
    toggleArchive,
    deleteArticle,
    updateTags,
  };
}
