import { api } from '@rlist/api/convex/_generated/api';
import type { Id } from '@rlist/api/convex/_generated/dataModel';
import { useCallback, useEffect, useRef } from 'react';

import {
  getPendingOutboxItems,
  markOutboxFailed,
  markOutboxProcessed,
  removeDeletedArticle,
} from '@/db/repositories/articles';
import { convexQueryClient } from '@/lib/convex';

const OUTBOX_FLUSH_INTERVAL = 30_000;

export function useArticleOutboxSync(userId: string | undefined) {
  const isFlushingRef = useRef(false);

  const flushOutboxNow = useCallback(async () => {
    if (!userId || isFlushingRef.current) return;
    isFlushingRef.current = true;
    try {
      const items = await getPendingOutboxItems(userId);
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
            await removeDeletedArticle(item.articleId, userId);
          }
        } catch {
          await markOutboxFailed(item.id);
        }
      }
    } finally {
      isFlushingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => void flushOutboxNow(), OUTBOX_FLUSH_INTERVAL);
    void flushOutboxNow();
    return () => clearInterval(interval);
  }, [flushOutboxNow]);

  return { flushOutboxNow };
}
