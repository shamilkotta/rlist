CREATE TABLE `cached_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` text NOT NULL,
	`userId` text NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`description` text,
	`domain` text NOT NULL,
	`faviconUrl` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`isRead` integer DEFAULT 0 NOT NULL,
	`isArchived` integer DEFAULT 0 NOT NULL,
	`creationTime` real NOT NULL,
	`isLocallyDeleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cached_articles_article_user` ON `cached_articles` (`articleId`,`userId`);
--> statement-breakpoint
CREATE INDEX `cached_articles_user_id` ON `cached_articles` (`userId`);
--> statement-breakpoint
CREATE TABLE `pagination_state` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filter` text NOT NULL,
	`continueCursor` text,
	`isDone` integer DEFAULT 0 NOT NULL,
	`lastSyncedAt` real
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pagination_state_filter_unique` ON `pagination_state` (`filter`);
--> statement-breakpoint
CREATE TABLE `sync_outbox` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`articleId` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`retryCount` integer DEFAULT 0 NOT NULL,
	`createdAt` real NOT NULL,
	`processedAt` real
);
--> statement-breakpoint
CREATE INDEX `sync_outbox_status` ON `sync_outbox` (`status`);
