import { api } from '@rlist/api/convex/_generated/api';
import { useEffect, useRef } from 'react';

import { resetPaginationForFilter, upsertServerPage } from '@/db/repositories/articles';
import type { TabFilter } from '@/db/repositories/articles';
import { convexQueryClient } from '@/lib/convex';

const PAGE_SIZE = 24;
const MAX_PAGES_PER_FILTER = 5;
const FILTERS: TabFilter[] = ['unread', 'all', 'archive'];

async function syncFilterFromServer(userId: string, filter: TabFilter): Promise<void> {
  const client = convexQueryClient.convexClient;
  await resetPaginationForFilter(filter, userId);

  let cursor: string | null = null;
  let pagesFetched = 0;

  while (pagesFetched < MAX_PAGES_PER_FILTER) {
    const result: (typeof api.articles.listUserArticles)['_returnType'] = await client.query(
      api.articles.listUserArticles,
      {
        filter,
        paginationOpts: { numItems: PAGE_SIZE, cursor },
      }
    );

    await upsertServerPage(userId, result.page, filter, result.continueCursor, result.isDone);

    pagesFetched += 1;
    if (result.isDone) break;

    cursor = result.continueCursor;
  }
}

export function useAppColdStartSync(userId: string | undefined) {
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!userId || hasRunRef.current) return;

    hasRunRef.current = true;

    void (async () => {
      for (const filter of FILTERS) {
        try {
          await syncFilterFromServer(userId, filter);
        } catch {
          // Continue with other filters; cold-start sync is best-effort
        }
      }
    })();
  }, [userId]);
}
