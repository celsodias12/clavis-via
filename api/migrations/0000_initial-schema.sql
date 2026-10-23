CREATE TABLE `check_ins` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`state` text NOT NULL,
	`other_text` text,
	`local_date` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `check_ins_user_local_date_index` ON `check_ins` (`user_id`,`local_date`,`created_at`);--> statement-breakpoint
CREATE TABLE `daily_keys` (
	`state` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`text` text NOT NULL,
	`practice_id` text NOT NULL,
	FOREIGN KEY (`practice_id`) REFERENCES `practices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `practices` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`duration_seconds` integer NOT NULL,
	`description` text NOT NULL
);
