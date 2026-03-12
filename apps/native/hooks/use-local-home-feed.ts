import { convexQuery } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import { useQueries } from '@tanstack/react-query';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  addOutboxItem,
  buildFeedQuery,
  markLocallyDeleted,
  toggleLocalArchiveStatus,
  toggleLocalReadStatus,
  updateLocalTags,
  upsertServerPage,
} from '@/db/repositories/articles';
import type { CachedArticle } from '@/db/schema';
import { useArticleOutboxSync } from '@/hooks/use-article-outbox-sync';

import type { DisplayArticle, PaginationStatus, TabFilter } from '@/features/home/home-feed.types';

export type { DisplayArticle, PaginationStatus, TabFilter };

const PAGE_SIZE = 24;

function toDisplayArticle(row: CachedArticle): DisplayArticle {
  return {
    articleId: row.articleId,
    url: row.url,
    title: row.title,
    description: row.description,
    domain: row.domain,
    faviconUrl: row.faviconUrl,
    tags: JSON.parse(row.tags) as string[],
    isRead: row.isRead === 1,
    isArchived: row.isArchived === 1,
    creationTime: row.creationTime,
  };
}

function hasMatchingTag(articleTags: string[], selectedTags: string[]): boolean {
  if (selectedTags.length === 0) return true;
  return articleTags.some((tag) => selectedTags.includes(tag));
}

export function useLocalHomeFeed(
  userId: string | undefined,
  filter: TabFilter,
  selectedTags: string[] = []
) {
  const [loadedCursors, setLoadedCursors] = useState<(string | null)[]>([null]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pendingPagesToLoadRef = useRef(0);
  const prevFilterRef = useRef(filter);
  const filterGenerationRef = useRef(0);
  const { flushOutboxNow } = useArticleOutboxSync(userId);

  // Synchronous filter-scoped cursors: use [null] immediately when filter changes
  // so we never run queries with stale cursors from a different tab
  const filterJustChanged = prevFilterRef.current !== filter;
  if (filterJustChanged) {
    prevFilterRef.current = filter;
    filterGenerationRef.current += 1;
  }
  const effectiveCursors = useMemo(
    () => (filterJustChanged ? [null] : loadedCursors),
    [filterJustChanged, loadedCursors]
  );

  useLayoutEffect(() => {
    if (filterJustChanged) {
      setLoadedCursors([null]);
      setIsLoadingMore(false);
      pendingPagesToLoadRef.current = 0;
    }
  }, [filterJustChanged]);

  // ---------------------------------------------------------------------------
  // Reactive local read — SQLite is the rendering source of truth
  // ---------------------------------------------------------------------------
  const { data: localArticles } = useLiveQuery(buildFeedQuery(userId ?? '', filter), [
    userId,
    filter,
  ]);

  // ---------------------------------------------------------------------------
  // Convex background sync — live subscriptions materialised into SQLite
  // ---------------------------------------------------------------------------
  const pageQueries = useQueries({
    queries: userId
      ? effectiveCursors.map((cursor) => ({
          ...convexQuery(api.articles.listUserArticles, {
            filter,
            paginationOpts: { numItems: PAGE_SIZE, cursor },
          }),
        }))
      : [],
  });

  const backgroundFilters = useMemo(
    () => (['unread', 'all', 'archive'] as TabFilter[]).filter((candidate) => candidate !== filter),
    [filter]
  );

  // Keep first pages of non-active filters reactive so remote status flips
  // still get materialized locally even when an item disappears from current filter pages.
  const backgroundPageQueries = useQueries({
    queries: userId
      ? backgroundFilters.map((backgroundFilter) => ({
          ...convexQuery(api.articles.listUserArticles, {
            filter: backgroundFilter,
            paginationOpts: { numItems: PAGE_SIZE, cursor: null },
          }),
        }))
      : [],
  });

  const pageDataToUpsert = useMemo(() => {
    const activeFilterPages = pageQueries
      .filter((q): q is typeof q & { data: NonNullable<typeof q.data> } => !!q.data)
      .map((q) => ({
        filter,
        page: q.data.page,
        continueCursor: q.data.continueCursor,
        isDone: q.data.isDone,
      }));

    const backgroundFilterPages = backgroundPageQueries
      .map((query, index) => ({
        query,
        backgroundFilter: backgroundFilters[index],
      }))
      .filter(
        (
          item
        ): item is {
          query: (typeof backgroundPageQueries)[number] & {
            data: NonNullable<(typeof backgroundPageQueries)[number]['data']>;
          };
          backgroundFilter: TabFilter;
        } => !!item.query.data && !!item.backgroundFilter
      )
      .map((item) => ({
        filter: item.backgroundFilter,
        page: item.query.data.page,
        continueCursor: item.query.data.continueCursor,
        isDone: item.query.data.isDone,
      }));

    return [...activeFilterPages, ...backgroundFilterPages];
  }, [pageQueries, filter, backgroundPageQueries, backgroundFilters]);

  useEffect(() => {
    if (!userId) return;

    const generationAtStart = filterGenerationRef.current;

    void (async () => {
      for (const item of pageDataToUpsert) {
        if (filterGenerationRef.current !== generationAtStart) return;
        await upsertServerPage(userId, item.page, item.filter, item.continueCursor, item.isDone);
      }
    })();
  }, [pageDataToUpsert, userId]);

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------
  const lastPage = useMemo(() => {
    return pageQueries
      .map((q) => q.data)
      .filter(Boolean)
      .at(-1);
  }, [pageQueries]);

  useEffect(() => {
    if (filterJustChanged) return;
    if (pendingPagesToLoadRef.current <= 0 || !lastPage) return;
    if (lastPage.isDone) {
      pendingPagesToLoadRef.current = 0;
      setIsLoadingMore(false);
      return;
    }
    const nextCursor = lastPage.continueCursor;
    if (effectiveCursors.includes(nextCursor)) {
      pendingPagesToLoadRef.current = 0;
      setIsLoadingMore(false);
      return;
    }
    pendingPagesToLoadRef.current -= 1;
    setLoadedCursors((prev) => [...prev, nextCursor]);
  }, [filterJustChanged, lastPage, effectiveCursors]);

  useEffect(() => {
    if (!isLoadingMore) return;
    const lastQuery = pageQueries.at(-1);
    if (lastQuery && !lastQuery.isPending) {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, pageQueries]);

  const loadMore = useCallback(() => {
    const resolvedPages = pageQueries.map((q) => q.data).filter(Boolean);
    const latestPage = resolvedPages.at(-1);
    if (!latestPage || latestPage.isDone) return;

    const nextCursor = latestPage.continueCursor;
    if (loadedCursors.includes(nextCursor)) return;

    setIsLoadingMore(true);
    setLoadedCursors((prev) => [...prev, nextCursor]);
  }, [loadedCursors, pageQueries]);

  // ---------------------------------------------------------------------------
  // Status
  // ---------------------------------------------------------------------------
  const status = useMemo<PaginationStatus>(() => {
    const firstQuery = pageQueries.at(0);
    const hasLocal = (localArticles?.length ?? 0) > 0;

    if (!hasLocal && firstQuery?.isPending && !firstQuery.data) {
      return 'LoadingFirstPage';
    }
    if (isLoadingMore) return 'LoadingMore';

    const lastResolved = pageQueries
      .map((q) => q.data)
      .filter(Boolean)
      .at(-1);

    if (lastResolved && !lastResolved.isDone) return 'CanLoadMore';
    if (!lastResolved && hasLocal) return 'CanLoadMore';

    return 'Exhausted';
  }, [pageQueries, localArticles, isLoadingMore]);

  // ---------------------------------------------------------------------------
  // Action handlers — optimistic local update + outbox enqueue
  // ---------------------------------------------------------------------------
  const toggleRead = useCallback(
    async (articleId: string) => {
      if (!userId) return;
      // Enqueue first so server upserts know this row has a pending local override.
      await addOutboxItem('toggleReadStatus', articleId, userId);
      await toggleLocalReadStatus(articleId, userId);
      void flushOutboxNow();
    },
    [userId, flushOutboxNow]
  );

  const toggleArchive = useCallback(
    async (articleId: string) => {
      if (!userId) return;
      // Enqueue first so server upserts know this row has a pending local override.
      await addOutboxItem('toggleArchiveStatus', articleId, userId);
      await toggleLocalArchiveStatus(articleId, userId);
      void flushOutboxNow();
    },
    [userId, flushOutboxNow]
  );

  const deleteArticle = useCallback(
    async (articleId: string) => {
      if (!userId) return;
      await markLocallyDeleted(articleId, userId);
      await addOutboxItem('deleteArticle', articleId, userId);
      void flushOutboxNow();
    },
    [userId, flushOutboxNow]
  );

  const updateTags = useCallback(
    async (articleId: string, tags: string[]) => {
      if (!userId) return;
      await updateLocalTags(articleId, userId, tags);
      await addOutboxItem('updateTags', articleId, userId, JSON.stringify(tags));
      void flushOutboxNow();
    },
    [userId, flushOutboxNow]
  );

  // ---------------------------------------------------------------------------
  // Result — filter by selected tags locally
  // ---------------------------------------------------------------------------
  const articles = useMemo(() => {
    const allArticles = (localArticles ?? []).map(toDisplayArticle);
    if (selectedTags.length === 0) return allArticles;
    return allArticles.filter((article) => hasMatchingTag(article.tags, selectedTags));
  }, [localArticles, selectedTags]);

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
