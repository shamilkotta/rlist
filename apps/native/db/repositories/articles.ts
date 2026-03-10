import { and, desc, eq, lt } from 'drizzle-orm';

import { db } from '@/db/client';
import { cachedArticles, paginationState, syncOutbox } from '@/db/schema';
import type { SyncOutboxItem } from '@/db/schema';

export type TabFilter = 'unread' | 'all' | 'archive';

const MAX_RETRIES = 3;

export type ServerArticleItem = {
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

function getFilterConditions(filter: TabFilter) {
  switch (filter) {
    case 'unread':
      return [eq(cachedArticles.isArchived, 0), eq(cachedArticles.isRead, 0)];
    case 'all':
      return [eq(cachedArticles.isArchived, 0)];
    case 'archive':
      return [eq(cachedArticles.isArchived, 1)];
  }
}

export function buildFeedQuery(userId: string, filter: TabFilter) {
  return db
    .select()
    .from(cachedArticles)
    .where(
      and(
        eq(cachedArticles.userId, userId),
        eq(cachedArticles.isLocallyDeleted, 0),
        ...getFilterConditions(filter)
      )
    )
    .orderBy(desc(cachedArticles.creationTime));
}

export async function upsertServerPage(
  userId: string,
  items: ServerArticleItem[],
  filter: TabFilter,
  continueCursor: string,
  isDone: boolean
) {
  if (items.length === 0) {
    await db
      .insert(paginationState)
      .values({
        filter,
        continueCursor,
        isDone: isDone ? 1 : 0,
        lastSyncedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: paginationState.filter,
        set: { continueCursor, isDone: isDone ? 1 : 0, lastSyncedAt: Date.now() },
      });
    return;
  }

  const pendingItems = await db.select().from(syncOutbox).where(eq(syncOutbox.status, 'pending'));

  const pendingDeleteIds = new Set(
    pendingItems.filter((i) => i.action === 'deleteArticle').map((i) => i.articleId)
  );
  const pendingReadIds = new Set(
    pendingItems.filter((i) => i.action === 'toggleReadStatus').map((i) => i.articleId)
  );
  const pendingArchiveIds = new Set(
    pendingItems.filter((i) => i.action === 'toggleArchiveStatus').map((i) => i.articleId)
  );

  for (const item of items) {
    if (pendingDeleteIds.has(item.articleId)) continue;

    const isRead = item.isRead ? 1 : 0;
    const isArchived = item.isArchived ? 1 : 0;
    const tags = JSON.stringify(item.tags);

    const baseFields = {
      url: item.url,
      title: item.title,
      description: item.description,
      domain: item.domain,
      faviconUrl: item.faviconUrl,
      tags,
      creationTime: item._creationTime,
    };

    await db
      .insert(cachedArticles)
      .values({
        articleId: item.articleId,
        userId,
        ...baseFields,
        isRead,
        isArchived,
        isLocallyDeleted: 0,
      })
      .onConflictDoUpdate({
        target: [cachedArticles.articleId, cachedArticles.userId],
        set: {
          ...baseFields,
          ...(pendingReadIds.has(item.articleId) ? {} : { isRead }),
          ...(pendingArchiveIds.has(item.articleId) ? {} : { isArchived }),
          isLocallyDeleted: 0,
        },
      });
  }

  await db
    .insert(paginationState)
    .values({
      filter,
      continueCursor,
      isDone: isDone ? 1 : 0,
      lastSyncedAt: Date.now(),
    })
    .onConflictDoUpdate({
      target: paginationState.filter,
      set: { continueCursor, isDone: isDone ? 1 : 0, lastSyncedAt: Date.now() },
    });
}

export async function toggleLocalReadStatus(articleId: string, userId: string) {
  const rows = await db
    .select({ isRead: cachedArticles.isRead })
    .from(cachedArticles)
    .where(and(eq(cachedArticles.articleId, articleId), eq(cachedArticles.userId, userId)))
    .limit(1);

  if (rows.length === 0) return;

  await db
    .update(cachedArticles)
    .set({ isRead: rows[0].isRead === 0 ? 1 : 0 })
    .where(and(eq(cachedArticles.articleId, articleId), eq(cachedArticles.userId, userId)));
}

export async function toggleLocalArchiveStatus(articleId: string, userId: string) {
  const rows = await db
    .select({ isArchived: cachedArticles.isArchived })
    .from(cachedArticles)
    .where(and(eq(cachedArticles.articleId, articleId), eq(cachedArticles.userId, userId)))
    .limit(1);

  if (rows.length === 0) return;

  await db
    .update(cachedArticles)
    .set({ isArchived: rows[0].isArchived === 0 ? 1 : 0 })
    .where(and(eq(cachedArticles.articleId, articleId), eq(cachedArticles.userId, userId)));
}

export async function markLocallyDeleted(articleId: string, userId: string) {
  await db
    .update(cachedArticles)
    .set({ isLocallyDeleted: 1 })
    .where(and(eq(cachedArticles.articleId, articleId), eq(cachedArticles.userId, userId)));
}

export async function removeDeletedArticle(articleId: string) {
  await db.delete(cachedArticles).where(eq(cachedArticles.articleId, articleId));
}

export async function addOutboxItem(
  action: 'toggleReadStatus' | 'toggleArchiveStatus' | 'deleteArticle',
  articleId: string
) {
  await db.insert(syncOutbox).values({
    action,
    articleId,
    status: 'pending',
    retryCount: 0,
    createdAt: Date.now(),
  });
}

export async function getPendingOutboxItems(): Promise<SyncOutboxItem[]> {
  return db
    .select()
    .from(syncOutbox)
    .where(and(eq(syncOutbox.status, 'pending'), lt(syncOutbox.retryCount, MAX_RETRIES)))
    .orderBy(syncOutbox.createdAt);
}

export async function markOutboxProcessed(id: number) {
  await db.delete(syncOutbox).where(eq(syncOutbox.id, id));
}

export async function markOutboxFailed(id: number) {
  const rows = await db
    .select({ retryCount: syncOutbox.retryCount })
    .from(syncOutbox)
    .where(eq(syncOutbox.id, id))
    .limit(1);

  if (rows.length === 0) return;

  const newCount = rows[0].retryCount + 1;
  if (newCount >= MAX_RETRIES) {
    await db.delete(syncOutbox).where(eq(syncOutbox.id, id));
  } else {
    await db.update(syncOutbox).set({ retryCount: newCount }).where(eq(syncOutbox.id, id));
  }
}

export async function resetPaginationForFilter(filter: TabFilter) {
  await db.delete(paginationState).where(eq(paginationState.filter, filter));
}

export async function clearLocalData(userId: string) {
  await db.delete(cachedArticles).where(eq(cachedArticles.userId, userId));
  await db.delete(paginationState);
  await db.delete(syncOutbox);
}
