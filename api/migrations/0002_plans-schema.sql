CREATE TABLE `day_completions` (
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`day_number` integer NOT NULL,
	`reflection` text,
	`completed_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `plan_id`, `day_number`),
	FOREIGN KEY (`plan_id`,`day_number`) REFERENCES `plan_days`(`plan_id`,`day_number`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plan_days` (
	`plan_id` text NOT NULL,
	`day_number` integer NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`message` text NOT NULL,
	`reflection` text NOT NULL,
	`action` text NOT NULL,
	`tip` text NOT NULL,
	`prayer` text NOT NULL,
	`video_duration_seconds` integer NOT NULL,
	PRIMARY KEY(`plan_id`, `day_number`),
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plan_enrollments` (
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`started_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `plan_id`),
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`position` integer NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plans_position_unique` ON `plans` (`position`);--> statement-breakpoint
CREATE TABLE `practice_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`practice_id` text NOT NULL,
	`local_date` text NOT NULL,
	`completed_at` integer NOT NULL,
	FOREIGN KEY (`practice_id`) REFERENCES `practices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `practice_completions_user_local_date_index` ON `practice_completions` (`user_id`,`local_date`);--> statement-breakpoint
CREATE TABLE `verses` (
	`position` integer PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`reference` text NOT NULL
);
