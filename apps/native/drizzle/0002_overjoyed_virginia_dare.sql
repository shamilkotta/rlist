-- Add userId to sync_outbox for per-user scoping
ALTER TABLE `sync_outbox` ADD COLUMN `userId` text NOT NULL DEFAULT '';
--> statement-breakpoint
-- Recreate pagination_state with userId scoping
CREATE TABLE `pagination_state_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`filter` text NOT NULL,
	`continueCursor` text,
	`isDone` integer DEFAULT 0 NOT NULL,
	`lastSyncedAt` real
);
--> statement-breakpoint
INSERT INTO `pagination_state_new` (`id`, `userId`, `filter`, `continueCursor`, `isDone`, `lastSyncedAt`)
SELECT `id`, '', `filter`, `continueCursor`, `isDone`, `lastSyncedAt` FROM `pagination_state`;
--> statement-breakpoint
DROP TABLE `pagination_state`;
--> statement-breakpoint
ALTER TABLE `pagination_state_new` RENAME TO `pagination_state`;
--> statement-breakpoint
CREATE UNIQUE INDEX `pagination_state_user_filter` ON `pagination_state` (`userId`,`filter`);
--> statement-breakpoint
-- Update sync_outbox index for userId+status queries
DROP INDEX IF EXISTS `sync_outbox_status`;
--> statement-breakpoint
CREATE INDEX `sync_outbox_user_status` ON `sync_outbox` (`userId`,`status`);
