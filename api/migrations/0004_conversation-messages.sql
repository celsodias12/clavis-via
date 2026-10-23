CREATE TABLE `conversation_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`text` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `conversation_messages_user_created_index` ON `conversation_messages` (`user_id`,`created_at`);