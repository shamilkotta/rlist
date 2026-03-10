import { convexQuery } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import type { Id } from '@rlist/api/convex/_generated/dataModel';
import { useQueries } from '@tanstack/react-query';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  addOutboxItem,
  buildFeedQuery,
  getPendingOutboxItems,
  markLocallyDeleted,
  markOutboxFailed,
  markOutboxProcessed,
  removeDeletedArticle,
  resetPaginationForFilter,
  toggleLocalArchiveStatus,
  toggleLocalReadStatus,
  upsertServerPage,
} from '@/db/repositories/articles';
import type { CachedArticle } from '@/db/schema';
import { convexQueryClient } from '@/lib/convex';

export type TabFilter = 'unread' | 'all' | 'archive';
export type PaginationStatus = 'LoadingFirstPage' | 'CanLoadMore' | 'LoadingMore' | 'Exhausted';

export type DisplayArticle = {
  articleId: string;
  url: string;
  title: string | null;
  description: string | null;
  domain: string;
  faviconUrl: string;
  tags: string[];
  isRead: boolean;
  isArchived: boolean;
  creationTime: number;
};

const PAGE_SIZE = 24;
const OUTBOX_FLUSH_INTERVAL = 30_000;

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

export function useLocalHomeFeed(userId: string | undefined, filter: TabFilter) {
  const [loadedCursors, setLoadedCursors] = useState<Array<string | null>>([null]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pendingPagesToLoadRef = useRef(0);
  const isFlushingRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset must fire when filter changes
  useEffect(() => {
    setLoadedCursors([null]);
    setIsLoadingMore(false);
    pendingPagesToLoadRef.current = 0;
  }, [filter]);

  // ---------------------------------------------------------------------------
  // Reactive local read — SQLite is the rendering source of truth
  // ---------------------------------------------------------------------------
  const { data: localArticles } = useLiveQuery(buildFeedQuery(userId ?? '', filter));

  // ---------------------------------------------------------------------------
  // Convex background sync — live subscriptions materialised into SQLite
  // ---------------------------------------------------------------------------
  const pageQueries = useQueries({
    queries: userId
      ? loadedCursors.map((cursor) => ({
          ...convexQuery(api.articles.listUserArticles, {
            filter,
            paginationOpts: { numItems: PAGE_SIZE, cursor },
          }),
        }))
      : [],
  });

  const pagesKey = pageQueries
    .map((q, i) =>
      q.data
        ? `${i}:${q.data.continueCursor}:${q.data.page.length}:${q.data.isDone}`
        : `${i}:pending`
    )
    .join('|');

  // biome-ignore lint/correctness/useExhaustiveDependencies: pagesKey is the stable change-detection fingerprint
  useEffect(() => {
    if (!userId) return;

    void (async () => {
      for (const q of pageQueries) {
        if (!q.data) continue;
        await upsertServerPage(userId, q.data.page, filter, q.data.continueCursor, q.data.isDone);
      }
    })();
  }, [pagesKey, userId, filter, pageQueries]);

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
    if (pendingPagesToLoadRef.current <= 0 || !lastPage) return;
    if (lastPage.isDone) {
      pendingPagesToLoadRef.current = 0;
      setIsLoadingMore(false);
      return;
    }
    const nextCursor = lastPage.continueCursor;
    if (loadedCursors.includes(nextCursor)) {
      pendingPagesToLoadRef.current = 0;
      setIsLoadingMore(false);
      return;
    }
    pendingPagesToLoadRef.current -= 1;
    setLoadedCursors((prev) => [...prev, nextCursor]);
  }, [lastPage, loadedCursors]);

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
  // Outbox flush — sends queued mutations to Convex
  // ---------------------------------------------------------------------------
  const flushOutboxNow = useCallback(async () => {
    if (isFlushingRef.current) return;
    isFlushingRef.current = true;
    try {
      const items = await getPendingOutboxItems();
      const client = convexQueryClient.convexClient;

      for (const item of items) {
        try {
          const id = item.articleId as Id<'articles'>;
          switch (item.action) {
            case 'toggleReadStatus':
              await client.mutation(api.articles.toggleReadStatus, { articleId: id });
              break;
            case 'toggleArchiveStatus':
              await client.mutation(api.articles.toggleArchiveStatus, { articleId: id });
              break;
            case 'deleteArticle':
              await client.mutation(api.articles.deleteArticle, { articleId: id });
              break;
          }
          await markOutboxProcessed(item.id);
          if (item.action === 'deleteArticle') {
            await removeDeletedArticle(item.articleId);
          }
        } catch {
          await markOutboxFailed(item.id);
        }
      }
    } finally {
      isFlushingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => void flushOutboxNow(), OUTBOX_FLUSH_INTERVAL);
    void flushOutboxNow();
    return () => clearInterval(interval);
  }, [flushOutboxNow]);

  // ---------------------------------------------------------------------------
  // Action handlers — optimistic local update + outbox enqueue
  // ---------------------------------------------------------------------------
  const toggleRead = useCallback(
    async (articleId: string) => {
      if (!userId) return;
      await toggleLocalReadStatus(articleId, userId);
      await addOutboxItem('toggleReadStatus', articleId);
      void flushOutboxNow();
    },
    [userId, flushOutboxNow]
  );

  const toggleArchive = useCallback(
    async (articleId: string) => {
      if (!userId) return;
      await toggleLocalArchiveStatus(articleId, userId);
      await addOutboxItem('toggleArchiveStatus', articleId);
      void flushOutboxNow();
    },
    [userId, flushOutboxNow]
  );

  const deleteArticle = useCallback(
    async (articleId: string) => {
      if (!userId) return;
      await markLocallyDeleted(articleId, userId);
      await addOutboxItem('deleteArticle', articleId);
      void flushOutboxNow();
    },
    [userId, flushOutboxNow]
  );

  // ---------------------------------------------------------------------------
  // Refresh (pull-to-refresh)
  // ---------------------------------------------------------------------------
  const refresh = useCallback(() => {
    void resetPaginationForFilter(filter);
    setLoadedCursors([null]);
    setIsLoadingMore(false);
    pendingPagesToLoadRef.current = 0;
  }, [filter]);

  // ---------------------------------------------------------------------------
  // Result
  // ---------------------------------------------------------------------------
  const articles = useMemo(() => {
    return (localArticles ?? []).map(toDisplayArticle);
  }, [localArticles]);

  return {
    articles,
    status,
    loadMore,
    toggleRead,
    toggleArchive,
    deleteArticle,
    refresh,
  };
}
