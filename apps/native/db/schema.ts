import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const userSettings = sqliteTable('user_settings', {
  id: int().primaryKey({ autoIncrement: true }),
  theme: text().notNull().default('system'),
});

export type UserSettings = typeof userSettings.$inferSelect;
