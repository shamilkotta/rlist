import { index, int, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const userSettings = sqliteTable('user_settings', {
  id: int().primaryKey({ autoIncrement: true }),
  theme: text().notNull().default('system'),
});

export type UserSettings = typeof userSettings.$inferSelect;

export const cachedArticles = sqliteTable(
  'cached_articles',
  {
    id: int().primaryKey({ autoIncrement: true }),
    articleId: text().notNull(),
    userId: text().notNull(),
    url: text().notNull(),
    title: text(),
    description: text(),
    domain: text().notNull(),
    faviconUrl: text().notNull(),
    tags: text().notNull().default('[]'),
    isRead: int().notNull().default(0),
    isArchived: int().notNull().default(0),
    creationTime: real().notNull(),
    isLocallyDeleted: int().notNull().default(0),
  },
  (table) => [
    uniqueIndex('cached_articles_article_user').on(table.articleId, table.userId),
    index('cached_articles_user_id').on(table.userId),
  ]
);

export type CachedArticle = typeof cachedArticles.$inferSelect;

export const paginationState = sqliteTable('pagination_state', {
  id: int().primaryKey({ autoIncrement: true }),
  filter: text().notNull().unique(),
  continueCursor: text(),
  isDone: int().notNull().default(0),
  lastSyncedAt: real(),
});

export type PaginationState = typeof paginationState.$inferSelect;

export const syncOutbox = sqliteTable(
  'sync_outbox',
  {
    id: int().primaryKey({ autoIncrement: true }),
    action: text().notNull(),
    articleId: text().notNull(),
    status: text().notNull().default('pending'),
    retryCount: int().notNull().default(0),
    createdAt: real().notNull(),
    processedAt: real(),
  },
  (table) => [index('sync_outbox_status').on(table.status)]
);

export type SyncOutboxItem = typeof syncOutbox.$inferSelect;
