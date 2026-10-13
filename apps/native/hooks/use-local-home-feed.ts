import { convexQuery } from '@convex-dev/react-query';
import { api } from '@rlist/api/convex/_generated/api';
import type { Id } from '@rlist/api/convex/_generated/dataModel';
import { type UseQueryResult, useMutation, useQueries } from '@tanstack/react-query';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { DisplayArticle, PaginationStatus, TabFilter } from '@/features/home/home-feed.types';
import { convexQueryClient } from '@/lib/convex';

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

// Cache by server object so unchanged articles keep the same DisplayArticle reference
// across page loads, which lets the memoized ArticleCard skip re-rendering.
const displayArticleCache = new WeakMap<ServerArticle, DisplayArticle>();

function toDisplayArticle(article: ServerArticle): DisplayArticle {
  const cached = displayArticleCache.get(article);
  if (cached) return cached;

  const displayArticle: DisplayArticle = {
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
  displayArticleCache.set(article, displayArticle);
  return displayArticle;
}

type ArticlesPage = {
  page: ServerArticle[];
  isDone: boolean;
  continueCursor: string;
};

// Combined via `useQueries({ combine })` so the result keeps its identity across renders
// unless a page actually changes. Without this, every render produced new `pages` /
// `articles` arrays and re-rendered the whole list.
function combinePages(results: UseQueryResult<ArticlesPage>[]) {
  return {
    pages: results.map((result) => result.data).filter((page) => page !== undefined),
    isFirstPagePending: results.at(0)?.isPending ?? false,
    isLastPagePending: results.at(-1)?.isPending ?? false,
  };
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

  const { pages, isFirstPagePending, isLastPagePending } = useQueries({
    queries: activeUserId
      ? effectiveCursors.map((cursor) => ({
          ...convexQuery(api.articles.listUserArticles, {
            filter,
            tags: selectedTags,
            paginationOpts: { numItems: PAGE_SIZE, cursor },
          }),
        }))
      : [],
    combine: combinePages,
  });

  // Each page is an independent live query, so when articles are added, read, archived or
  // deleted the page boundaries shift and adjacent pages can overlap. Dedupe by id so the
  // list never contains duplicate keys.
  const articles = useMemo(() => {
    const seen = new Set<string>();
    const result: DisplayArticle[] = [];
    for (const page of pages) {
      for (const article of page.page) {
        if (seen.has(article.articleId)) continue;
        seen.add(article.articleId);
        result.push(toDisplayArticle(article));
      }
    }
    return result;
  }, [pages]);

  const loadMore = useCallback(() => {
    const latestPage = pages.at(-1);
    if (!latestPage || latestPage.isDone) return;

    const nextCursor = latestPage.continueCursor;
    if (loadedCursors.includes(nextCursor)) return;

    setIsLoadingMore(true);
    setLoadedCursors((prev) => [...prev, nextCursor]);
  }, [loadedCursors, pages]);

  useEffect(() => {
    if (isLoadingMore && !isLastPagePending) {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, isLastPagePending]);

  const status = useMemo<PaginationStatus>(() => {
    if (articles.length === 0 && isFirstPagePending) {
      return 'LoadingFirstPage';
    }
    if (isLoadingMore) return 'LoadingMore';

    const lastResolved = pages.at(-1);
    if (lastResolved && !lastResolved.isDone) return 'CanLoadMore';

    return 'Exhausted';
  }, [articles.length, isFirstPagePending, isLoadingMore, pages]);

  const toggleReadMutation = useMutation({
    mutationFn: (articleId: string) =>
      convexQueryClient.convexClient.mutation(api.articles.toggleReadStatus, {
        articleId: articleId as Id<'articles'>,
      }),
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: (articleId: string) =>
      convexQueryClient.convexClient.mutation(api.articles.toggleArchiveStatus, {
        articleId: articleId as Id<'articles'>,
      }),
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (articleId: string) =>
      convexQueryClient.convexClient.mutation(api.articles.deleteArticle, {
        articleId: articleId as Id<'articles'>,
      }),
  });

  const updateTagsMutation = useMutation({
    mutationFn: ({ articleId, tags }: { articleId: string; tags: string[] }) =>
      convexQueryClient.convexClient.mutation(api.articles.updateArticleTags, {
        articleId: articleId as Id<'articles'>,
        tags,
      }),
  });

  const { mutateAsync: toggleReadAsync } = toggleReadMutation;
  const toggleRead = useCallback(
    async (articleId: string) => {
      await toggleReadAsync(articleId);
    },
    [toggleReadAsync]
  );

  const { mutateAsync: toggleArchiveAsync } = toggleArchiveMutation;
  const toggleArchive = useCallback(
    async (articleId: string) => {
      await toggleArchiveAsync(articleId);
    },
    [toggleArchiveAsync]
  );

  const { mutateAsync: deleteArticleAsync } = deleteArticleMutation;
  const deleteArticle = useCallback(
    async (articleId: string) => {
      await deleteArticleAsync(articleId);
    },
    [deleteArticleAsync]
  );

  const { mutateAsync: updateTagsAsync } = updateTagsMutation;
  const updateTags = useCallback(
    async (articleId: string, tags: string[]) => {
      await updateTagsAsync({ articleId, tags });
    },
    [updateTagsAsync]
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
