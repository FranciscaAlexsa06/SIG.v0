CREATE TABLE `document_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`document_type` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`file_name` text NOT NULL,
	`file_key` text NOT NULL,
	`content_type` text DEFAULT 'application/octet-stream' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `system_base_items` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`name` text NOT NULL,
	`value` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`worker_rut` text NOT NULL,
	`worker_name` text NOT NULL,
	`profile` text NOT NULL,
	`scope` text DEFAULT 'Total empresa' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_worker_rut_unique` ON `user_profiles` (`worker_rut`);--> statement-breakpoint
ALTER TABLE `work_sites` ADD `region` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `work_sites` ADD `commune` text DEFAULT '' NOT NULL;